import hashlib
import os
# Adjust this import path if your payment_services.py is in a different folder
from app.services.payment_service import generate_payhere_hash

from fastapi import APIRouter, Depends, Form, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import Donation, Order, User
from app.db.schemas import DonationCreate, DonationOut, OrderCreate, OrderOut

router = APIRouter(tags=["Store & Payments"])


# ── ORDERS ────────────────────────────────────────────────────────────────

# Make sure you have this import at the top of the file!
# from app.services.payment_services import generate_payhere_hash

@router.post("/orders/create", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # Auth required
):
    """Authenticated users can place an order for blank NFC sticker tags."""
    total = round(payload.unit_price * payload.quantity, 2)
    order = Order(
        user_id=current_user.id,
        product_name=payload.product_name,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        total_amount=total,
        shipping_address=payload.shipping_address,
    )
    db.add(order)
    db.commit()
    db.refresh(order) # This generates the order.id
    
    # ─── NEW PAYHERE HASH LOGIC ──────────────────────────────────────
    # 1. Use the EXACT same credentials you used for donations
    merchant_id = "1235833"
    merchant_secret = "Mjk2NTAxNjM5MjMzMDY1NjgzMzQxNjY2NzUxMTg5MjgyNzEyNzQxMQ==" # Paste your real secret here
    
    # 2. Generate the secure MD5 hash using the new order.id and total_amount
    payment_hash = generate_payhere_hash(
        merchant_id=merchant_id,
        merchant_secret=merchant_secret,
        order_id=str(order.id),
        amount=order.total_amount 
    )
    
    # 3. Attach the generated hash to the database model
    order.hash = payment_hash
    
    # 4. Commit the transaction again to save the hash to the database
    db.commit()
    db.refresh(order)
    # ─────────────────────────────────────────────────────────────────

    return order


# ── DONATIONS ─────────────────────────────────────────────────────────────

@router.post("/donations/create", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_donation(payload: DonationCreate, db: Session = Depends(get_db)):
    """PUBLIC – anyone can make a donation to support VoxVision."""
    
    # 1. Create and save the initial record to generate the UUID
    donation = Donation(
        donor_name=payload.donor_name,
        donor_email=payload.donor_email,
        amount=payload.amount,
        message=payload.message,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)
    
    # 2. Load PayHere Credentials from environment variables
    # (Replace the fallback strings with your actual Sandbox credentials for now)
    merchant_id = os.getenv("1235833", "1235833")
    merchant_secret = os.getenv("Mjk2NTAxNjM5MjMzMDY1NjgzMzQxNjY2NzUxMTg5MjgyNzEyNzQxMQ==", "Mjk2NTAxNjM5MjMzMDY1NjgzMzQxNjY2NzUxMTg5MjgyNzEyNzQxMQ==")
    
    # 3. Generate the secure MD5 hash using the new donation.id
    payment_hash = generate_payhere_hash(
        merchant_id=merchant_id,
        merchant_secret=merchant_secret,
        order_id=str(donation.id),
        amount=donation.amount
    )
    
    # 4. Attach the generated hash to the database model
    donation.hash = payment_hash
    
    # 5. Commit the transaction again to save the hash to the database
    db.commit()
    db.refresh(donation)

    # 6. Return the updated donation object
    return donation


# ── PAYHERE WEBHOOK ───────────────────────────────────────────────────────

def _verify_payhere_signature(
    merchant_id: str,
    order_id: str,
    amount: str,
    currency: str,
    status_code: str,
    md5sig: str,
) -> bool:
    """
    PayHere MD5 signature verification.
    Formula: MD5( merchant_id + order_id + amount + currency + status_code
                  + strtoupper(MD5(merchant_secret)) )
    """
    if not settings.PAYHERE_MERCHANT_SECRET:
        # Skip verification in dev if secret not configured
        return True

    secret_hash = hashlib.md5(settings.PAYHERE_MERCHANT_SECRET.encode()).hexdigest().upper()
    local_sig = hashlib.md5(
        f"{merchant_id}{order_id}{amount}{currency}{status_code}{secret_hash}".encode()
    ).hexdigest()
    return local_sig == md5sig


@router.post("/payments/webhook", status_code=status.HTTP_200_OK)
async def payhere_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    PUBLIC – PayHere posts hidden form data here after a payment attempt.
    status_code == "2"  → payment successful (mark order/donation as paid).
    """
    form = await request.form()

    merchant_id   = form.get("merchant_id", "")
    order_id      = form.get("order_id", "")
    payment_id    = form.get("payment_id", "")
    amount        = form.get("payhere_amount", "")
    currency      = form.get("payhere_currency", "")
    status_code   = form.get("status_code", "")
    md5sig        = form.get("md5sig", "")
    custom_1      = form.get("custom_1", "")   # "order" | "donation"
    custom_2      = form.get("custom_2", "")   # internal record UUID

    # ── Signature check ───────────────────────────────────────────────────
    if not _verify_payhere_signature(merchant_id, order_id, amount, currency, status_code, md5sig):
        raise HTTPException(status_code=400, detail="Invalid PayHere signature.")

    # ── Only process successful payments ──────────────────────────────────
    if status_code != "2":
        return {"detail": f"Payment status {status_code} acknowledged but not processed."}

    # ── Update the correct record ─────────────────────────────────────────
    if custom_1 == "order" and custom_2:
        record = db.query(Order).filter(Order.id == custom_2).first()
        if record:
            record.status = "paid"
            record.payhere_order_id = payment_id
            db.commit()

    elif custom_1 == "donation" and custom_2:
        record = db.query(Donation).filter(Donation.id == custom_2).first()
        if record:
            record.status = "paid"
            record.payhere_order_id = payment_id
            db.commit()

    return {"detail": "Payment processed successfully."}
