import hashlib

def generate_payhere_hash(merchant_id: str, merchant_secret: str, order_id: str, amount: float, currency: str = "LKR") -> str:
    """
    Generates the secure MD5 hash required by the PayHere payment gateway.
    
    Args:
        merchant_id (str): Your PayHere Merchant ID.
        merchant_secret (str): Your PayHere Merchant Secret.
        order_id (str): The unique database ID or order number for this transaction.
        amount (float): The exact payment amount (will be formatted to 2 decimal places).
        currency (str): The 3-letter currency code, defaults to "LKR".
        
    Returns:
        str: The uppercase MD5 hash string.
    """
    
    # 1. Hash the merchant secret and uppercase it
    hashed_secret = hashlib.md5(merchant_secret.encode('utf-8')).hexdigest().upper()

    # 2. Format the amount string (CRUCIAL: PayHere strictly expects exactly two decimal places)
    formatted_amount = "{:.2f}".format(float(amount)) 

    # 3. Concatenate the string in the exact sequence PayHere expects
    hash_string = f"{merchant_id}{order_id}{formatted_amount}{currency}{hashed_secret}"

    # 4. Hash the final combined string and uppercase it
    final_hash = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()
    
    return final_hash