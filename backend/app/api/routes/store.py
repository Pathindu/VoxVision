from fastapi import APIRouter
from fastapi import Depends
from fastapi import Form
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Order,
    Donation
)

from app.db.schemas import (
    OrderCreate,
    DonationCreate
)

from app.core.dependencies import (
    get_current_user
)


router=APIRouter()


@router.post("/orders/create")
def create_order(
    order:OrderCreate,
    db:Session=Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):


    new_order=Order(
        quantity=order.quantity,
        total_amount=order.total_amount,
        user_id=current_user.id
    )

    db.add(new_order)

    db.commit()

    db.refresh(new_order)


    return {

        "message":"Order created",

        "order_id":new_order.id
    }



@router.post("/donations/create")
def create_donation(
    donation:DonationCreate,
    db:Session=Depends(get_db)
):


    new_donation=Donation(
        name=donation.name,
        email=donation.email,
        amount=donation.amount
    )

    db.add(new_donation)

    db.commit()

    db.refresh(new_donation)


    return {

        "message":"Donation created",

        "donation_id":new_donation.id
    }



@router.post("/payments/webhook")
async def payment_webhook(

    order_id:int=Form(None),

    donation_id:int=Form(None),

    status_code:int=Form(...)
):


    if status_code==2:

        return {

            "message":"Payment successful"
        }

    return {

        "message":"Payment pending"
    }