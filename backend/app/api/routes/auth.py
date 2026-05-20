from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.db.schemas import (
    UserRegister,
    UserLogin
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router=APIRouter()


@router.post("/register")
def register(
    user:UserRegister,
    db:Session=Depends(get_db)
):

    existing_user=db.query(
        User
    ).filter(
        User.email==user.email
    ).first()


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )


    new_user=User(
        name=user.name,
        email=user.email,
        password=hash_password(
            user.password
        )
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message":"Registration successful"
    }



@router.post("/login")
def login(
    user:UserLogin,
    db:Session=Depends(get_db)
):


    db_user=db.query(User).filter(
        User.email==user.email
    ).first()


    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


    if not verify_password(
        user.password,
        db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


    token=create_access_token(
        {
            "id":db_user.id,
            "email":db_user.email
        }
    )


    return {
        "access_token":token,
        "token_type":"bearer"
    }