from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile
from sqlalchemy.exc import IntegrityError

from import_data import run

router = APIRouter(prefix="/api", tags=["Data Import"])


@router.post("/import-data")
async def import_data(file: UploadFile = File(...)):
    suffix = Path(file.filename or "upload").suffix.lower()
    if suffix not in {".csv", ".txt", ".xlsx", ".xls"}:
        raise HTTPException(status_code=400, detail="Upload a CSV or Excel file.")

    with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        result = run(temp_path)
        return {
            "message": "Data import completed successfully.",
            **result,
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Import failed because the file contains conflicting rows for unique records.",
        )