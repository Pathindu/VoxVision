from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Float,
    DateTime
)

from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class User(Base):

    __tablename__="users"

    id=Column(Integer,primary_key=True,index=True)

    name=Column(String)

    email=Column(
        String,
        unique=True,
        index=True
    )

    password=Column(String)

    role=Column(
        String,
        default="caregiver"
    )

    created_at=Column(
        DateTime,
        default=datetime.utcnow
    )



class Tag(Base):

    __tablename__="tags"

    id=Column(
        Integer,
        primary_key=True
    )

    tag_id=Column(
        String,
        unique=True
    )

    description=Column(
        String
    )

    user_id=Column(
        Integer,
        ForeignKey("users.id")
    )

    owner=relationship(
        "User"
    )



class Order(Base):

    __tablename__="orders"

    id=Column(
        Integer,
        primary_key=True
    )

    quantity=Column(Integer)

    total_amount=Column(Float)

    status=Column(
        String,
        default="Pending"
    )

    user_id=Column(
        Integer,
        ForeignKey("users.id")
    )



class Donation(Base):

    __tablename__="donations"

    id=Column(
        Integer,
        primary_key=True
    )

    name=Column(String)

    email=Column(String)

    amount=Column(Float)

    status=Column(
        String,
        default="Pending"
    )