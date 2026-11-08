"""
Kesava Cleaning - SQLite Database Layer
Handles database initialization, schema creation, and seeding of initial demo data.
"""

import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "kesavacleaning.db")

def get_db_connection():
    """Returns a connection to the SQLite database with dictionary-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Creates tables if they don't already exist and seeds initial data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Bookings Table (Professional Cleaning Services)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        service_type TEXT NOT NULL,
        service_date TEXT NOT NULL,
        service_time TEXT NOT NULL,
        address TEXT NOT NULL,
        rooms INTEGER DEFAULT 2,
        bathrooms INTEGER DEFAULT 1,
        sqft INTEGER DEFAULT 1200,
        addons TEXT DEFAULT '[]',
        frequency TEXT DEFAULT 'One-time',
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'Confirmed',
        special_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
    """)

    # 3. Orders Table (Botanical Formulations & Refill Packs)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        shipping_address TEXT,
        items_json TEXT NOT NULL,
        total_amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'Paid (Simulated Eco-Pay)',
        fulfillment_status TEXT DEFAULT 'Processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
    """)

    # 4. Reviews Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        user_email TEXT,
        rating INTEGER NOT NULL DEFAULT 5,
        review_title TEXT,
        comment TEXT NOT NULL,
        surface_tested TEXT,
        verified_buyer INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()

    # Seed Default Users & Initial Reviews if not already present
    seed_initial_data(conn)
    conn.close()
    print("[Database] Kesava Cleaning SQLite initialized successfully.")

def seed_initial_data(conn):
    cursor = conn.cursor()

    # Check if admin user exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@kesavacleaning.com",))
    if not cursor.fetchone():
        admin_pass = generate_password_hash("Kesava@2026")
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, phone, role)
            VALUES (?, ?, ?, ?, ?)
        """, ("Kesava Administrator", "admin@kesavacleaning.com", admin_pass, "+1 (555) 019-2834", "admin"))
        print("[Database] Seeded Admin: admin@kesavacleaning.com / Kesava@2026")

    # Check if demo customer exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("demo@kesavacleaning.com",))
    if not cursor.fetchone():
        demo_pass = generate_password_hash("Clean@2026")
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, phone, address, role)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Sarah Jenkins", "demo@kesavacleaning.com", demo_pass, "+1 (555) 438-1192", "742 Evergreen Terrace, Austin TX", "customer"))
        print("[Database] Seeded Demo Customer: demo@kesavacleaning.com / Clean@2026")

    # Seed initial reviews if table is empty
    cursor.execute("SELECT COUNT(*) AS count FROM reviews")
    if cursor.fetchone()["count"] == 0:
        sample_reviews = [
            ("Sarah R.", "sarah@example.com", 5, "Safe for my twins and golden retrievers!",
             "I have two golden retrievers and an 11-month-old crawler. Conventional disinfectants gave me terrible anxiety about floor licking. Kesava Cleaning cleaned dried slobber effortlessly and smells like a luxury spa.",
             "Hardwood & Tile", 1),
            ("Marcus K.", "marcus@ecoshine.com", 5, "Transformed our commercial cleaning business",
             "As someone who cleans high-end residential homes for a living, my lungs used to burn by Friday. We transitioned our entire service to Kesava Cleaning pouches 6 months ago. Our clients consistently rave about how clean their marble counters feel.",
             "Carrara Marble & Induction Cooktop", 1),
            ("Elena L.", "elena@designstudio.org", 5, "Stunning frosted amber bottle & cuts grease!",
             "The amber glass spray bottle is stunning enough to leave permanently beside our kitchen sink instead of hiding it underneath. And it actually cuts burnt tomato sauce on our induction range without scrubbing.",
             "Induction Stovetop", 1),
            ("David Chen", "david@chentech.io", 5, "Best move-in deep cleaning service ever",
             "Booked Kesava Cleaning for our new 3-bedroom condo. The team showed up on time, used 100% plant-derived formulas, and the bathrooms were spotless with zero chemical fumes. Absolutely booking their bi-weekly service!",
             "Full Home Deep Clean", 1)
        ]
        cursor.executemany("""
            INSERT INTO reviews (user_name, user_email, rating, review_title, comment, surface_tested, verified_buyer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, sample_reviews)
        print("[Database] Seeded initial verified reviews.")

    # Seed sample booking for demo user
    cursor.execute("SELECT id FROM users WHERE email = ?", ("demo@kesavacleaning.com",))
    demo_user = cursor.fetchone()
    if demo_user:
        cursor.execute("SELECT COUNT(*) AS count FROM bookings WHERE user_id = ?", (demo_user["id"],))
        if cursor.fetchone()["count"] == 0:
            cursor.execute("""
                INSERT INTO bookings (
                    user_id, customer_name, customer_email, customer_phone,
                    service_type, service_date, service_time, address,
                    rooms, bathrooms, sqft, addons, frequency, total_price, status, special_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                demo_user["id"],
                "Sarah Jenkins",
                "demo@kesavacleaning.com",
                "+1 (555) 438-1192",
                "Residential Deep Clean",
                "2026-11-15",
                "10:00 AM",
                "742 Evergreen Terrace, Austin TX",
                3, 2, 1850,
                '["Inside Oven Degreasing", "Botanical Mist"]',
                "Bi-Weekly (15% Off)",
                189.00,
                "Confirmed",
                "Please ring doorbell. Keep gate latched for friendly golden retriever."
            ))
            print("[Database] Seeded sample booking for demo user.")

    conn.commit()

if __name__ == "__main__":
    init_db()
