"""
Kesava Cleaning - Authentication API Endpoints
Handles user registration, sign-in, session profile checks, and credential updates.
"""

import re
from flask import Blueprint, request, jsonify, g
from database import get_db_connection
from auth import (
    hash_password,
    verify_password,
    generate_auth_token,
    login_required
)

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new customer account."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()

    # Validations
    if not name or len(name) < 2:
        return jsonify({"success": False, "error": "Please enter your full name."}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"success": False, "error": "Please provide a valid email address."}), 400
    if not password or len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters long."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check for existing email
    existing = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"success": False, "error": "An account with this email already exists. Please sign in."}), 409

    hashed = hash_password(password)
    try:
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, phone, address, role)
            VALUES (?, ?, ?, ?, ?, 'customer')
        """, (name, email, hashed, phone, address))
        conn.commit()
        new_user_id = cursor.lastrowid
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "error": f"Registration failed: {str(e)}"}), 500

    user_row = cursor.execute("SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?", (new_user_id,)).fetchone()
    conn.close()

    user_dict = dict(user_row)
    token = generate_auth_token(user_dict["id"], user_dict["email"], user_dict["role"])

    return jsonify({
        "success": True,
        "message": f"Welcome to Kesava Cleaning, {user_dict['name']}! Your account is created.",
        "token": token,
        "user": user_dict
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate existing user credentials and return an auth token."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "error": "Please provide both email and password."}), 400

    conn = get_db_connection()
    user_row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user_row:
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    if not verify_password(user_row["password_hash"], password):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    user_dict = {
        "id": user_row["id"],
        "name": user_row["name"],
        "email": user_row["email"],
        "phone": user_row["phone"],
        "address": user_row["address"],
        "role": user_row["role"],
        "created_at": user_row["created_at"]
    }
    token = generate_auth_token(user_dict["id"], user_dict["email"], user_dict["role"])

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user_dict['name']}!",
        "token": token,
        "user": user_dict
    }), 200

@auth_bp.route("/me", methods=["GET"])
@login_required
def get_current_user_profile():
    """Returns the authenticated user's profile and summary counts."""
    user = g.current_user
    conn = get_db_connection()

    # Get active bookings count
    bookings_count = conn.execute(
        "SELECT COUNT(*) as count FROM bookings WHERE user_id = ?",
        (user["id"],)
    ).fetchone()["count"]

    # Get orders count
    orders_count = conn.execute(
        "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
        (user["id"],)
    ).fetchone()["count"]
    conn.close()

    return jsonify({
        "success": True,
        "user": user,
        "stats": {
            "total_bookings": bookings_count,
            "total_orders": orders_count
        }
    }), 200

@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    """Updates user contact details."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()

    if not name:
        return jsonify({"success": False, "error": "Name cannot be empty."}), 400

    conn = get_db_connection()
    conn.execute("""
        UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?
    """, (name, phone, address, g.current_user["id"]))
    conn.commit()

    updated = conn.execute(
        "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
        (g.current_user["id"],)
    ).fetchone()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "user": dict(updated)
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Client-side token disposal confirmation endpoint."""
    return jsonify({
        "success": True,
        "message": "You have been logged out successfully."
    }), 200
