from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ─────────────────────────────  AUTH / USER  ──────────────────────────────

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    is_caregiver: bool = False


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    username: str
    is_caregiver: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─────────────────────────────  NFC TAGS  ─────────────────────────────────

class TagCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=2000)


class TagUpdate(BaseModel):
    description: str = Field(..., min_length=1, max_length=2000)


class TagOut(BaseModel):
    id: str
    description: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagPublic(BaseModel):
    """Minimal response for public (visually impaired user) scan."""
    id: str
    description: str

    class Config:
        from_attributes = True


# ────────────────────────────  E-COMMERCE  ────────────────────────────────

class OrderCreate(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=200)
    quantity: int = Field(..., ge=1, le=1000)
    unit_price: float = Field(..., gt=0)
    shipping_address: str = Field(..., min_length=10, max_length=500)


class OrderOut(BaseModel):
    id: str
    user_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_amount: float
    shipping_address: str
    status: str
    payhere_order_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DonationCreate(BaseModel):
    donor_name: str = Field(..., min_length=2, max_length=100)
    donor_email: EmailStr
    amount: float = Field(..., gt=0)
    message: Optional[str] = Field(None, max_length=500)


class DonationOut(BaseModel):
    id: str
    donor_name: str
    donor_email: str
    amount: float
    message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────  PAYHERE WEBHOOK  ──────────────────────────────

class PayhereWebhook(BaseModel):
    """
    PayHere sends this as application/x-www-form-urlencoded (hidden form).
    status_code 2 = Paid, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Charged Back
    """
    merchant_id: str
    order_id: str
    payment_id: str
    payhere_amount: str
    payhere_currency: str
    status_code: str          # "2" means success
    md5sig: str
    custom_1: Optional[str] = None   # We store entity type: "order" or "donation"
    custom_2: Optional[str] = None   # We store internal record ID
