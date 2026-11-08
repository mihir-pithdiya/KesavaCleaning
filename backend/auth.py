"""
Kesava Cleaning - Authentication & Security Module
Handles password hashing, token creation, validation, and route protection decorators.
"""

import os
from functools import wraps
from flask import request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from database import get_db_connection

SECRET_KEY = os.getenv("SECRET_KEY", "kesava-cleaning-botanical-secret-key-2026-xyz789")
serializer = URLSafeTimedSerializer(SECRET_KEY)
TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 Days

def hash_password(password: str) -> str:
    """Hashes a plaintext password using Werkzeug's secure salt-hashed format."""
    return generate_password_hash(password)

def verify_password(stored_hash: str, candidate_password: str) -> bool:
    """Verifies a candidate password against the stored hash."""
    return check_password_hash(stored_hash, candidate_password)

def generate_auth_token(user_id: int, email: str, role: str = "customer") -> str:
    """Generates a secure time-stamped authentication token."""
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role
    }
    return serializer.dumps(payload)

def decode_auth_token(token: str):
    """
    Decodes and validates a token.
    Returns (payload, None) on success or (None, error_message) on failure.
    """
    try:
        data = serializer.loads(token, max_age=TOKEN_MAX_AGE)
        return data, None
    except SignatureExpired:
        return None, "Session expired. Please sign in again."
    except BadSignature:
        return None, "Invalid authentication token."
    except Exception as e:
        return None, f"Authentication error: {str(e)}"

def get_current_user_from_request():
    """Extracts and verifies user from Authorization header without throwing."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    payload, error = decode_auth_token(token)
    if not payload:
        return None
    
    conn = get_db_connection()
    user = conn.execute("SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?", (payload["user_id"],)).fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def login_required(f):
    """Decorator to require a valid Bearer token for protected API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "error": "Missing or invalid authorization header. Bearer token required."
            }), 401

        token = auth_header.split(" ", 1)[1].strip()
        payload, error = decode_auth_token(token)
        if error:
            return jsonify({"success": False, "error": error}), 401

        conn = get_db_connection()
        user_row = conn.execute(
            "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
            (payload["user_id"],)
        ).fetchone()
        conn.close()

        if not user_row:
            return jsonify({"success": False, "error": "User account no longer exists."}), 401

        g.current_user = dict(user_row)
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require an admin user for management endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Must pass login_required first
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Unauthorized"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        payload, error = decode_auth_token(token)
        if error:
            return jsonify({"success": False, "error": error}), 401

        if payload.get("role") != "admin":
            return jsonify({"success": False, "error": "Admin privileges required."}), 403

        conn = get_db_connection()
        user_row = conn.execute(
            "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
            (payload["user_id"],)
        ).fetchone()
        conn.close()

        if not user_row or user_row["role"] != "admin":
            return jsonify({"success": False, "error": "Admin privileges required."}), 403

        g.current_user = dict(user_row)
        return f(*args, **kwargs)
    return decorated_function
