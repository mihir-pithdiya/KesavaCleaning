#!/usr/bin/env python3
"""
Kesava Cleaning - Full Stack Application Runner
Launches the Flask backend REST API and serves the modern frontend interface.
"""

import os
import sys

# Ensure backend directory is in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

from app import create_app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")

    print("\n" + "=" * 65)
    print("      🌿 KESAVA CLEANING — FULL STACK SYSTEM STARTED 🌿")
    print("=" * 65)
    print(f"  • Web Application URL : http://{host}:{port}")
    print(f"  • API Health Check    : http://{host}:{port}/api/health")
    print(f"  • Demo Customer Login : demo@kesavacleaning.com / Clean@2026")
    print(f"  • Admin Portal Login  : admin@kesavacleaning.com / Kesava@2026")
    print("=" * 65)
    print("  Press Ctrl+C to stop the server\n")

    app.run(host=host, port=port, debug=True)
