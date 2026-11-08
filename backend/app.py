"""
Kesava Cleaning - Main Flask Application Server
Serves both the REST API and the responsive Single Page Application frontend.
"""

import os
import sys
from flask import Flask, send_from_directory, jsonify, request

# Add parent directory to sys.path so imports work cleanly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(CURRENT_DIR)

from database import init_db, get_db_connection
from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.order_routes import order_bp
from routes.review_routes import review_bp
from routes.catalog_routes import catalog_bp

FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

def create_app():
    """Application factory for Kesava Cleaning full-stack server."""
    app = Flask(__name__, static_folder=FRONTEND_DIR)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "kesava-cleaning-botanical-secret-key-2026-xyz789")

    # Initialize SQLite Database on startup
    init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(booking_bp, url_prefix="/api/bookings")
    app.register_blueprint(order_bp, url_prefix="/api/orders")
    app.register_blueprint(review_bp, url_prefix="/api/reviews")
    app.register_blueprint(catalog_bp, url_prefix="/api/catalog")

    # Cross-Origin Resource Sharing (CORS) Middleware
    @app.after_request
    def handle_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response

    # API Health Check Endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        try:
            conn = get_db_connection()
            user_count = conn.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
            conn.close()
            return jsonify({
                "status": "healthy",
                "app": "Kesava Cleaning Full-Stack Server",
                "version": "2.4.0",
                "database": "sqlite_connected",
                "registered_users": user_count
            }), 200
        except Exception as e:
            return jsonify({"status": "degraded", "error": str(e)}), 500

    # Serve Frontend Single Page Application
    @app.route("/", methods=["GET"])
    def serve_frontend_index():
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.route("/<path:path>", methods=["GET"])
    def serve_frontend_static(path):
        # If file exists in frontend, serve it
        full_path = os.path.join(FRONTEND_DIR, path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            return send_from_directory(FRONTEND_DIR, path)
        # Otherwise fallback to index.html for client-side routing
        return send_from_directory(FRONTEND_DIR, "index.html")

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    print(f"\n=======================================================")
    print(f"  🌿 KESAVA CLEANING SERVER RUNNING ON http://127.0.0.1:{port}")
    print(f"  API Endpoints at http://127.0.0.1:{port}/api/health")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=True)
