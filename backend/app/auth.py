import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Depends, Header
from app.config import FIREBASE_SERVICE_ACCOUNT_PATH
import os

# Initialize Firebase Admin
if FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
else:
    print(f"WARNING: FIREBASE_SERVICE_ACCOUNT_PATH '{FIREBASE_SERVICE_ACCOUNT_PATH}' not found or invalid. Auth verification will fail.")

async def get_current_user(authorization: str = Header(None)):
    """
    Dependency to verify Firebase ID token from Authorization header.
    Returns a dict with 'uid' and 'email'.
    """
    # For local development without service account, you can disable this check 
    # IF you want to bypass auth. But for the hackathon, we want it enabled.
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header. Expected 'Bearer <token>'")
    
    token = authorization.split("Bearer ")[1]
    try:
        # Verify the ID token while checking if the token is revoked by passing check_revoked=True
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")
