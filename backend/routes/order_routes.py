"""
Kesava Cleaning - Eco-Product Order & Cart Endpoints
Handles e-commerce transactions for botanical starter kits, refills, and zero-waste supplies.
"""

import json
import time
import random
from flask import Blueprint, request, jsonify, g
from database import get_db_connection
from auth import get_current_user_from_request

order_bp = Blueprint("orders", __name__)

@order_bp.route("", methods=["POST"])
def create_order():
    """Create a new eco-product order from cart items."""
    data = request.get_json(silent=True) or {}
    current_user = get_current_user_from_request()

    items = data.get("items", [])
    shipping_address = data.get("shipping_address") or "742 Evergreen Terrace, Austin TX"
    discount_code = (data.get("discount_code") or "").strip().upper()

    if not items or len(items) == 0:
        return jsonify({"success": False, "error": "Cart is empty. Please add items before checking out."}), 400

    if current_user:
        user_id = current_user["id"]
        customer_name = current_user["name"]
        customer_email = current_user["email"]
    else:
        user_id = None
        customer_name = data.get("customer_name") or "Eco Conscious Customer"
        customer_email = data.get("customer_email") or "guest@kesavacleaning.com"

    # Calculate item totals
    subtotal = 0.0
    for item in items:
        unit_price = float(item.get("price", 0.0))
        qty = int(item.get("qty", 1))
        subtotal += unit_price * qty

    # Calculate shipping
    shipping_cost = 0.0 if subtotal >= 30.0 else 4.95

    # Promo discount code
    discount_amount = 0.0
    if discount_code in ["CLEAN15", "KESAVA15", "EARTH"]:
        discount_amount = subtotal * 0.15

    total_amount = round(subtotal - discount_amount + shipping_cost, 2)

    # Order Number generation (e.g. KC-20261108-9284)
    order_num = f"KC-{time.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO orders (
            order_number, user_id, customer_name, customer_email,
            shipping_address, items_json, total_amount, payment_status, fulfillment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Paid (Simulated Eco-Pay)', 'Processing')
    """, (
        order_num,
        user_id,
        customer_name,
        customer_email,
        shipping_address,
        json.dumps(items),
        total_amount
    ))
    conn.commit()
    new_order_id = cursor.lastrowid
    row = cursor.execute("SELECT * FROM orders WHERE id = ?", (new_order_id,)).fetchone()
    conn.close()

    result = dict(row)
    result["items"] = json.loads(result["items_json"])

    return jsonify({
        "success": True,
        "message": f"Order #{order_num} confirmed! Carbon-neutral shipping scheduled within 24h.",
        "order": result
    }), 201

@order_bp.route("", methods=["GET"])
def list_orders():
    """Retrieve orders for the authenticated user or by email."""
    current_user = get_current_user_from_request()
    conn = get_db_connection()

    if current_user:
        if current_user.get("role") == "admin":
            rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC",
                (current_user["id"], current_user["email"])
            ).fetchall()
    else:
        email = request.args.get("email")
        if not email:
            conn.close()
            return jsonify({"success": False, "error": "Sign in or provide an email to view orders."}), 401
        rows = conn.execute(
            "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC",
            (email.strip().lower(),)
        ).fetchall()

    conn.close()

    orders = []
    for r in rows:
        d = dict(r)
        try:
            d["items"] = json.loads(d["items_json"])
        except Exception:
            d["items"] = []
        orders.append(d)

    return jsonify({
        "success": True,
        "orders": orders
    }), 200
