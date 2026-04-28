import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Depends, Header
from app.config import FIREBASE_SERVICE_ACCOUNT_PATH
import os

# Initialize Firebase Admin
IS_AUTH_ENABLED = False
if FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
        IS_AUTH_ENABLED = True
    except Exception as e:
        print(f"ERROR: Firebase initialization failed: {e}")
else:
    print(f"WARNING: Auth service account not found. Running in MOCK AUTH MODE.")

async def get_current_user(authorization: str = Header(None)):
    """
    Dependency to verify Firebase ID token from Authorization header.
    If auth is disabled (missing service account), returns a mock user.
    """
    if not IS_AUTH_ENABLED:
        return {"uid": "mock-user-123", "email": "dev@biaslens.ai"}
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")
