from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Tag,User
from app.db.schemas import TagCreate
from app.core.dependencies import caregiver_only

import uuid


router=APIRouter()


@router.post("/create")
def create_tag(
    tag:TagCreate,
    db:Session=Depends(get_db),
    current_user:User=Depends(
        caregiver_only
    )
):


    tag_id=str(
        uuid.uuid4()
    )[:8]


    new_tag=Tag(
        tag_id=tag_id,
        description=tag.description,
        user_id=current_user.id
    )

    db.add(
        new_tag
    )

    db.commit()

    db.refresh(
        new_tag
    )


    return {

        "message":"Tag created",

        "tag_id":tag_id
    }



@router.get("/{tag_id}")
def get_tag(
    tag_id:str,
    db:Session=Depends(get_db)
):


    tag=db.query(Tag).filter(
        Tag.tag_id==tag_id
    ).first()


    if not tag:

        raise HTTPException(
            status_code=404,
            detail="Tag not found"
        )


    return {

        "tag_id":tag.tag_id,

        "description":
        tag.description
    }