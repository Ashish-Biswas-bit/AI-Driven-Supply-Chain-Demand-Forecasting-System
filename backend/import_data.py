"""
import_data.py — load explore data from CSV or Excel into the database.

Expected columns are flexible, but the import works best with:
product_id, product_name, category, unit_price, quantity, total, date, channel
"""

import hashlib
import re
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

from models.database import (
    Alert,
    Forecast,
    Inventory,
    Product,
    SaleRecord,
    SessionLocal,
    User,
    init_db,
)
from services.auth import hash_password


def _normalize_columns(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    frame.columns = [re.sub(r"[^a-z0-9]+", "_", str(column).strip().lower()).strip("_") for column in frame.columns]
    return frame


def _first_value(row: dict, candidates: list[str], default=None):
    for candidate in candidates:
        value = row.get(candidate)
        if pd.notna(value) if value is not None else False:
            return value
    return default


def _to_int(value, default=None):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _to_float(value, default=None):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _to_datetime(value, default=None):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    parsed = pd.to_datetime(value, errors="coerce")
    if pd.isna(parsed):
        return default
    return parsed.to_pydatetime()


def _derived_product_id(product_name: str, category: str = "", sku: str = "") -> int:
    seed = f"{product_name}|{category}|{sku}".encode("utf-8")
    return int(hashlib.md5(seed).hexdigest()[:8], 16)


def _load_frame(filepath: str) -> pd.DataFrame:
    def clean_frame(frame: pd.DataFrame) -> pd.DataFrame:
        cleaned = frame.copy()
        cleaned = cleaned.dropna(how="all")
        cleaned = cleaned.dropna(axis=1, how="all")
        return cleaned

    suffix = Path(filepath).suffix.lower()
    if suffix in {".csv", ".txt"}:
        encodings = [
            "utf-8-sig",
            "utf-8",
            "utf-16",
            "utf-16-le",
            "utf-16-be",
            "cp1252",
            "latin-1",
        ]
        separators = [None, ",", ";", "\t", "|"]
        frame = None
        last_error = None
        for encoding in encodings:
            for separator in separators:
                try:
                    kwargs = {
                        "encoding": encoding,
                        "on_bad_lines": "skip",
                    }
                    if separator is None:
                        kwargs["sep"] = None
                        kwargs["engine"] = "python"
                    else:
                        kwargs["sep"] = separator

                    candidate = pd.read_csv(filepath, **kwargs)
                    candidate = clean_frame(candidate)
                    if not candidate.empty:
                        frame = candidate
                        break
                except UnicodeDecodeError as error:
                    last_error = error
                except UnicodeError as error:
                    last_error = error
                except Exception:
                    # Try the next separator/encoding combo.
                    continue

            if frame is not None:
                break

        if frame is None:
            raise ValueError(
                "Could not decode CSV file. Please save it as UTF-8 CSV or Excel (.xlsx)."
            ) from last_error
    elif suffix in {".xlsx", ".xls"}:
        try:
            sheets = pd.read_excel(filepath, sheet_name=None)
            frame = None
            for sheet in sheets.values():
                candidate = clean_frame(sheet)
                if not candidate.empty:
                    frame = candidate
                    break

            if frame is None:
                frame = pd.DataFrame()
        except UnicodeDecodeError as error:
            raise ValueError("Could not decode spreadsheet file. Please export again as .xlsx.") from error
    else:
        raise ValueError("Unsupported file type. Upload a CSV or Excel file.")
    return _normalize_columns(clean_frame(frame))


def run(filepath: str) -> dict:
    init_db()
    db = SessionLocal()

    stats = {
        "products_created": 0,
        "products_updated": 0,
        "sales_imported": 0,
        "source_file": Path(filepath).name,
    }

    try:
        admin = db.query(User).filter(User.email == "admin@demo.com").first()
        if not admin:
            admin = User(
                name="Demo Admin",
                email="admin@demo.com",
                hashed_password=hash_password("password123"),
                role="admin",
            )
            db.add(admin)
            db.flush()

        # Delete all existing data before importing new dataset
        # This ensures the new dataset completely replaces the old one
        db.query(Alert).delete(synchronize_session=False)
        db.query(Forecast).delete(synchronize_session=False)
        db.query(SaleRecord).delete(synchronize_session=False)
        db.query(Inventory).delete(synchronize_session=False)
        db.query(Product).delete(synchronize_session=False)
        db.flush()

        frame = _load_frame(filepath)
        if frame.empty:
            raise ValueError("The uploaded file does not contain any rows.")

        products_by_id = {product.id: product for product in db.query(Product).all()}
        inventory_by_product = {inv.product_id: inv for inv in db.query(Inventory).all()}

        required_product_name = ["product_name", "name", "product", "item_name"]
        required_quantity = ["quantity", "qty", "units", "sold_quantity"]
        required_unit_price = ["unit_price", "price", "sales_price"]
        required_total = ["total", "total_amount", "amount", "revenue"]
        required_date = ["date", "sale_date", "transaction_date", "order_date"]

        for row in frame.to_dict(orient="records"):
            product_name = _first_value(row, required_product_name)
            if not product_name:
                raise ValueError("Each row must include a product name.")

            category = _first_value(row, ["category", "product_category", "group"], "Imported")
            sku = _first_value(row, ["sku", "sku_code", "product_sku"], "")
            pid = _to_int(_first_value(row, ["product_id", "id", "item_id", "sku_id"]), None)
            if pid is None:
                pid = _derived_product_id(str(product_name), str(category), str(sku))

            quantity = _to_int(_first_value(row, required_quantity), 1)
            unit_price = _to_float(_first_value(row, required_unit_price), 0.0)
            total_amount = _to_float(_first_value(row, required_total), unit_price * quantity)
            sale_date = _to_datetime(_first_value(row, required_date), datetime.utcnow())
            channel = str(_first_value(row, ["channel", "sales_channel", "source"], "online"))
            current_stock = _to_int(_first_value(row, ["current_stock", "stock", "inventory"], max(quantity * 2, 50)), max(quantity * 2, 50))
            safety_stock = _to_int(_first_value(row, ["safety_stock"], 10), 10)
            reorder_point = _to_int(_first_value(row, ["reorder_point"], 20), 20)
            lead_time_days = _to_int(_first_value(row, ["lead_time_days"], 7), 7)

            product = products_by_id.get(pid)
            if not product:
                product = Product(
                    id=pid,
                    name=str(product_name),
                    sku=str(sku or f"SKU-{pid}"),
                    category=str(category),
                    unit_price=unit_price,
                    safety_stock=safety_stock,
                    reorder_point=reorder_point,
                    lead_time_days=lead_time_days,
                )
                db.add(product)
                products_by_id[pid] = product
                stats["products_created"] += 1
            else:
                product.name = str(product_name)
                product.sku = str(sku or product.sku)
                product.category = str(category)
                product.unit_price = unit_price
                product.safety_stock = safety_stock
                product.reorder_point = reorder_point
                product.lead_time_days = lead_time_days
                stats["products_updated"] += 1

            inventory = inventory_by_product.get(pid)
            if not inventory:
                inventory = Inventory(
                    product_id=pid,
                    current_stock=current_stock,
                    warehouse_location=str(_first_value(row, ["warehouse_location", "warehouse"], "Imported")),
                    last_restocked=sale_date,
                )
                db.add(inventory)
                inventory_by_product[pid] = inventory
            else:
                inventory.current_stock = current_stock
                inventory.warehouse_location = str(_first_value(row, ["warehouse_location", "warehouse"], inventory.warehouse_location or "Imported"))
                inventory.last_restocked = sale_date

            sale = SaleRecord(
                product_id=pid,
                user_id=admin.id,
                quantity=quantity,
                unit_price=unit_price,
                total_amount=total_amount,
                sale_date=sale_date,
                channel=channel,
            )
            db.add(sale)
            stats["sales_imported"] += 1

        db.commit()
        return stats
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_data.py <path_to_csv_or_xlsx>")
        sys.exit(1)

    result = run(sys.argv[1])
    print(
        f"Imported {result['sales_imported']} sales rows, "
        f"created {result['products_created']} products, "
        f"updated {result['products_updated']} products."
    )
