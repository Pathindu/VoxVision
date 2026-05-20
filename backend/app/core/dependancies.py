from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token:str=Depends(oauth2_scheme),
    db:Session=Depends(get_db)
):

    credentials_exception=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

    try:

        payload=jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id=payload.get("id")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception


    user=db.query(User).filter(
        User.id==user_id
    ).first()

    if user is None:
        raise credentials_exception

    return user


def caregiver_only(
    current_user:User=Depends(
        get_current_user
    )
):

    if current_user.role!="caregiver":

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return current_user