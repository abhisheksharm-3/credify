import os
import base64
import json
from firebase_admin import credentials, initialize_app, storage
from dotenv import load_dotenv

load_dotenv()

_firebase_app = None
_firebase_bucket = None

def initialize_firebase():
    global _firebase_app, _firebase_bucket
    
    if _firebase_app is not None:
        return _firebase_bucket
    
    firebase_key_base64 = os.getenv('FIREBASE_KEY_BASE64')
    if not firebase_key_base64:
        raise ValueError("Environment variable FIREBASE_KEY_BASE64 is not set or is empty")

    try:
        print("Decoding Firebase key...")
        firebase_key_json = base64.b64decode(firebase_key_base64).decode('utf-8')
        firebase_key_dict = json.loads(firebase_key_json)
        
        print("Initializing Firebase...")
        cred = credentials.Certificate(firebase_key_dict)
        
        # Initialize Firebase with a unique name if needed
        _firebase_app = initialize_app(cred, {
            'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
        })
        
        _firebase_bucket = storage.bucket(app=_firebase_app)
        print("Firebase initialized successfully.")
        return _firebase_bucket
    except Exception as e:
        raise RuntimeError(f"Error initializing Firebase: {e}")

firebase_bucket = initialize_firebase()
