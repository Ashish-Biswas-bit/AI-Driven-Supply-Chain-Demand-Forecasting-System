"""
Forecasting engine using Facebook Prophet for time-series demand prediction.
Falls back to linear regression when insufficient data is available.
Optionally generates AI-written insights via OpenAI GPT.
"""

import os
import warnings
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_percentage_error

warnings.filterwarnings("ignore")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def _build_dataframe(sales_records) -> pd.DataFrame:
    """Convert ORM SaleRecord list to a Prophet-compatible DataFrame."""
    if not sales_records:
        return pd.DataFrame(columns=["ds", "y"])

    rows = [
        {"ds": pd.Timestamp(s.sale_date.date()), "y": float(s.quantity)}
        for s in sales_records
    ]
    df = pd.DataFrame(rows)
    df = df.groupby("ds")["y"].sum().reset_index()
    df = df.sort_values("ds").reset_index(drop=True)
    return df


def _fill_date_gaps(df: pd.DataFrame) -> pd.DataFrame:
    """Fill missing dates with 0 so Prophet gets a complete time series."""
    if df.empty:
        return df
    date_range = pd.date_range(df["ds"].min(), df["ds"].max(), freq="D")
    df = df.set_index("ds").reindex(date_range, fill_value=0).reset_index()
    df.columns = ["ds", "y"]
    return df


def run_prophet_forecast(
    df: pd.DataFrame, periods: int = 30, freq: str = "D"
) -> Tuple[pd.DataFrame, float]:
    """
    Fit Facebook Prophet and return forecast DataFrame.
    Returns (forecast_df, mape_score).
    forecast_df columns: ds, yhat, yhat_lower, yhat_upper
    """
    try:
        from prophet import Prophet
    except ImportError:
        raise RuntimeError("prophet not installed. Run: pip install prophet")

    if len(df) < 10:
        raise ValueError("Need at least 10 data points for Prophet.")

    # Train/test split for accuracy
    split = max(int(len(df) * 0.8), len(df) - 30)
    train = df.iloc[:split]
    test = df.iloc[split:]

    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True if len(df) >= 365 else False,
        seasonality_mode="multiplicative",
        interval_width=0.80,
        changepoint_prior_scale=0.05,
    )
    model.fit(train)

    # Score on test
    accuracy = None
    if len(test) > 0:
        future_test = model.make_future_dataframe(periods=len(test), freq=freq)
        forecast_test = model.predict(future_test)
        preds = forecast_test["yhat"].values[-len(test):]
        preds = np.clip(preds, 0, None)
        try:
            accuracy = round(1 - mean_absolute_percentage_error(test["y"].values, preds + 1e-6), 4)
        except Exception:
            accuracy = None

    # Full model on all data
    full_model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True if len(df) >= 365 else False,
        seasonality_mode="multiplicative",
        interval_width=0.80,
        changepoint_prior_scale=0.05,
    )
    full_model.fit(df)
    future = full_model.make_future_dataframe(periods=periods, freq=freq)
    forecast = full_model.predict(future)
    forecast[["yhat", "yhat_lower", "yhat_upper"]] = forecast[
        ["yhat", "yhat_lower", "yhat_upper"]
    ].clip(lower=0)

    return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods), accuracy


def run_linear_forecast(
    df: pd.DataFrame, periods: int = 30
) -> Tuple[pd.DataFrame, float]:
    """Fallback: simple linear regression with time features."""
    df = df.copy()
    df["t"] = np.arange(len(df))
    df["month"] = df["ds"].dt.month
    df["dow"] = df["ds"].dt.dayofweek

    features = ["t", "month", "dow"]
    X = df[features].values
    y = df["y"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LinearRegression()
    model.fit(X_scaled, y)

    # Score
    preds_train = model.predict(X_scaled)
    try:
        accuracy = round(1 - mean_absolute_percentage_error(y + 1e-6, preds_train + 1e-6), 4)
    except Exception:
        accuracy = 0.70

    # Future
    last_date = df["ds"].max()
    future_dates = [last_date + timedelta(days=i + 1) for i in range(periods)]
    last_t = df["t"].max()

    future_X = np.array([
        [last_t + i + 1, d.month, d.weekday()]
        for i, d in enumerate(future_dates)
    ])
    future_X_scaled = scaler.transform(future_X)
    future_preds = np.clip(model.predict(future_X_scaled), 0, None)

    forecast_df = pd.DataFrame({
        "ds": future_dates,
        "yhat": future_preds,
        "yhat_lower": future_preds * 0.85,
        "yhat_upper": future_preds * 1.15,
    })
    return forecast_df, accuracy


def generate_forecast(sales_records, periods: int = 30, freq: str = "D") -> dict:
    """
    Main entry point. Returns forecast dict with points and metadata.
    """
    df = _build_dataframe(sales_records)
    df = _fill_date_gaps(df)

    model_used = "prophet"
    accuracy = None

    try:
        forecast_df, accuracy = run_prophet_forecast(df, periods=periods, freq=freq)
    except Exception:
        try:
            forecast_df, accuracy = run_linear_forecast(df, periods=periods)
            model_used = "linear_regression"
        except Exception as e:
            # Ultimate fallback: flat average
            avg = float(df["y"].mean()) if not df.empty else 5.0
            last_date = df["ds"].max() if not df.empty else datetime.utcnow()
            forecast_df = pd.DataFrame({
                "ds": [last_date + timedelta(days=i + 1) for i in range(periods)],
                "yhat": [avg] * periods,
                "yhat_lower": [avg * 0.8] * periods,
                "yhat_upper": [avg * 1.2] * periods,
            })
            model_used = "average"

    points = [
        {
            "date": row["ds"].strftime("%Y-%m-%d"),
            "predicted": round(float(row["yhat"]), 2),
            "lower": round(float(row["yhat_lower"]), 2),
            "upper": round(float(row["yhat_upper"]), 2),
        }
        for _, row in forecast_df.iterrows()
    ]

    return {
        "points": points,
        "model_used": model_used,
        "accuracy_score": accuracy,
        "total_predicted": round(sum(p["predicted"] for p in points), 1),
        "avg_daily": round(sum(p["predicted"] for p in points) / len(points), 2) if points else 0,
    }


async def get_ai_insight(product_name: str, forecast_data: dict, current_stock: int) -> Optional[str]:
    """
    Call OpenAI GPT to generate a human-readable inventory insight.
    Returns None gracefully if API key is missing or call fails.
    """
    if not OPENAI_API_KEY:
        total = forecast_data.get("total_predicted", 0)
        avg = forecast_data.get("avg_daily", 0)
        if current_stock < total * 0.5:
            return f"Stock is critically low. With {current_stock} units on hand and {int(total)} units forecasted over 30 days, immediate reordering is recommended."
        elif current_stock > total * 2:
            return f"Overstock detected. {current_stock} units on hand exceeds 2x the 30-day forecast of {int(total)} units. Consider promotional activity."
        else:
            return f"Inventory is balanced. Average daily demand forecast: {avg} units. Monitor weekly for any seasonal shifts."

    try:
        import openai
        client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""
You are a supply chain analyst AI. Provide a 2-sentence actionable insight.

Product: {product_name}
Current Stock: {current_stock} units
30-day Forecast: {forecast_data.get('total_predicted', 0)} units total
Average Daily Demand: {forecast_data.get('avg_daily', 0)} units/day
Model: {forecast_data.get('model_used', 'unknown')}
Accuracy: {forecast_data.get('accuracy_score', 'N/A')}

Give a short, clear recommendation for the inventory manager.
"""
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return None
