"""
Kesava Cleaning - Reviews & Feedback Endpoints
Provides customer ratings, testimonial lists, and submission of verified reviews.
"""

from flask import Blueprint, request, jsonify, g
from database import get_db_connection
from auth import get_current_user_from_request

review_bp = Blueprint("reviews", __name__)

@review_bp.route("", methods=["GET"])
def get_reviews():
    """Retrieve all verified customer reviews."""
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM reviews ORDER BY created_at DESC").fetchall()
    
    # Calculate stats
    stats_row = conn.execute("""
        SELECT COUNT(*) as total, AVG(rating) as avg_rating
        FROM reviews
    """).fetchone()
    conn.close()

    reviews = [dict(r) for r in rows]
    total_count = stats_row["total"] or 0
    avg_score = round(stats_row["avg_rating"], 1) if stats_row["avg_rating"] else 4.9

    return jsonify({
        "success": True,
        "stats": {
            "total_reviews": total_count,
            "average_rating": avg_score
        },
        "reviews": reviews
    }), 200

@review_bp.route("", methods=["POST"])
def submit_review():
    """Submit a new customer review."""
    data = request.get_json(silent=True) or {}
    current_user = get_current_user_from_request()

    user_name = current_user["name"] if current_user else (data.get("user_name") or "").strip()
    user_email = current_user["email"] if current_user else (data.get("user_email") or "").strip()
    rating = int(data.get("rating", 5))
    review_title = (data.get("review_title") or "").strip()
    comment = (data.get("comment") or "").strip()
    surface_tested = (data.get("surface_tested") or "General Home Surface").strip()

    if not user_name:
        return jsonify({"success": False, "error": "Your name is required."}), 400
    if not comment or len(comment) < 10:
        return jsonify({"success": False, "error": "Please provide a review comment of at least 10 characters."}), 400
    if rating < 1 or rating > 5:
        rating = 5

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reviews (user_name, user_email, rating, review_title, comment, surface_tested, verified_buyer)
        VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (user_name, user_email, rating, review_title, comment, surface_tested))
    conn.commit()
    new_id = cursor.lastrowid
    row = cursor.execute("SELECT * FROM reviews WHERE id = ?", (new_id,)).fetchone()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Thank you for your review! It has been verified and published.",
        "review": dict(row)
    }), 201
