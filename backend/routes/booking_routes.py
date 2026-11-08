"""
Kesava Cleaning - Service Booking Endpoints
Handles scheduling of professional eco-cleaning services, price calculation, and appointment management.
"""

import json
from flask import Blueprint, request, jsonify, g
from database import get_db_connection
from auth import get_current_user_from_request, login_required

booking_bp = Blueprint("bookings", __name__)

BASE_SERVICE_RATES = {
    "Residential Deep Clean": 129.0,
    "Kitchen & Appliance Restoration": 99.0,
    "Bathroom Mineral & Scale Sanitization": 89.0,
    "Move-in / Move-out Sanitization": 169.0,
    "Eco Commercial & Office": 199.0
}

ADDON_RATES = {
    "Inside Oven Degreasing": 35.0,
    "Inside Refrigerator": 30.0,
    "Eco Aromatherapy Room Mist": 15.0,
    "Interior Windows Polish": 25.0,
    "Carpet Deep Bio-Extract": 45.0
}

def calculate_service_quote(service_type, rooms=2, bathrooms=1, sqft=1200, addons=None, frequency="One-time"):
    """Server-side calculation of cleaning quotes."""
    base = BASE_SERVICE_RATES.get(service_type, 129.0)
    
    # Room and bathroom scaling
    room_charge = max(0, int(rooms) - 1) * 20.0
    bath_charge = max(0, int(bathrooms) - 1) * 25.0
    
    # Sqft factor
    sqft_charge = 0.0
    if int(sqft) > 1000:
        sqft_charge = ((int(sqft) - 1000) / 500) * 18.0

    addons_total = 0.0
    if addons and isinstance(addons, list):
        for a in addons:
            addons_total += ADDON_RATES.get(a, 0.0)

    subtotal = base + room_charge + bath_charge + sqft_charge + addons_total

    # Frequency discount
    discount_pct = 0.0
    if "Bi-Weekly" in frequency:
        discount_pct = 0.15
    elif "Monthly" in frequency:
        discount_pct = 0.10

    total = subtotal * (1.0 - discount_pct)
    return round(total, 2)

@booking_bp.route("", methods=["POST"])
def create_booking():
    """Create a new cleaning service appointment."""
    data = request.get_json(silent=True) or {}
    current_user = get_current_user_from_request()

    service_type = data.get("service_type") or "Residential Deep Clean"
    service_date = data.get("service_date")
    service_time = data.get("service_time") or "09:00 AM"
    address = data.get("address")
    rooms = int(data.get("rooms", 2))
    bathrooms = int(data.get("bathrooms", 1))
    sqft = int(data.get("sqft", 1200))
    addons = data.get("addons", [])
    frequency = data.get("frequency", "One-time")
    special_notes = data.get("special_notes", "")

    # Customer info: take from session or form input
    if current_user:
        user_id = current_user["id"]
        customer_name = current_user["name"]
        customer_email = current_user["email"]
        customer_phone = data.get("customer_phone") or current_user.get("phone") or ""
    else:
        user_id = None
        customer_name = data.get("customer_name")
        customer_email = data.get("customer_email")
        customer_phone = data.get("customer_phone", "")

    if not service_date:
        return jsonify({"success": False, "error": "Please select a preferred service date."}), 400
    if not address or len(address) < 5:
        return jsonify({"success": False, "error": "Please provide a valid service address."}), 400
    if not customer_name or not customer_email:
        return jsonify({"success": False, "error": "Customer name and email are required."}), 400

    total_price = calculate_service_quote(service_type, rooms, bathrooms, sqft, addons, frequency)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO bookings (
            user_id, customer_name, customer_email, customer_phone,
            service_type, service_date, service_time, address,
            rooms, bathrooms, sqft, addons, frequency, total_price, status, special_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
    """, (
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        service_type,
        service_date,
        service_time,
        address,
        rooms,
        bathrooms,
        sqft,
        json.dumps(addons),
        frequency,
        total_price,
        special_notes
    ))
    conn.commit()
    booking_id = cursor.lastrowid

    booking_row = cursor.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()
    conn.close()

    result = dict(booking_row)
    result["addons"] = json.loads(result["addons"])

    return jsonify({
        "success": True,
        "message": f"Appointment booked successfully for {service_date} at {service_time}!",
        "booking": result
    }), 201

@booking_bp.route("", methods=["GET"])
def list_bookings():
    """Retrieve bookings for the current user or by customer email."""
    current_user = get_current_user_from_request()
    conn = get_db_connection()

    if current_user:
        if current_user.get("role") == "admin":
            rows = conn.execute("SELECT * FROM bookings ORDER BY created_at DESC").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM bookings WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC",
                (current_user["id"], current_user["email"])
            ).fetchall()
    else:
        email = request.args.get("email")
        if not email:
            conn.close()
            return jsonify({"success": False, "error": "Sign in or provide an email to view bookings."}), 401
        rows = conn.execute(
            "SELECT * FROM bookings WHERE customer_email = ? ORDER BY created_at DESC",
            (email.strip().lower(),)
        ).fetchall()

    conn.close()

    bookings = []
    for r in rows:
        d = dict(r)
        try:
            d["addons"] = json.loads(d["addons"])
        except Exception:
            d["addons"] = []
        bookings.append(d)

    return jsonify({
        "success": True,
        "bookings": bookings
    }), 200

@booking_bp.route("/<int:booking_id>/cancel", methods=["PATCH"])
def cancel_booking(booking_id):
    """Cancel a booking by ID."""
    current_user = get_current_user_from_request()
    conn = get_db_connection()
    booking = conn.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()

    if not booking:
        conn.close()
        return jsonify({"success": False, "error": "Booking not found."}), 404

    # Permission check: must be owner or admin
    if current_user and current_user["role"] != "admin":
        if booking["user_id"] != current_user["id"] and booking["customer_email"] != current_user["email"]:
            conn.close()
            return jsonify({"success": False, "error": "Unauthorized to cancel this booking."}), 403

    conn.execute("UPDATE bookings SET status = 'Cancelled' WHERE id = ?", (booking_id,))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Appointment has been cancelled successfully."
    }), 200
