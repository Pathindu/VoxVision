from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_root():
    return {"success": True,"message": "SR Backend is running."}
