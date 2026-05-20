from pydantic import BaseModel,EmailStr


class UserRegister(BaseModel):

    name:str
    email:EmailStr
    password:str



class UserLogin(BaseModel):

    email:EmailStr
    password:str



class TagCreate(BaseModel):

    description:str



class OrderCreate(BaseModel):

    quantity:int
    total_amount:float



class DonationCreate(BaseModel):

    name:str
    email:EmailStr
    amount:float



class Token(BaseModel):

    access_token:str
    token_type:str