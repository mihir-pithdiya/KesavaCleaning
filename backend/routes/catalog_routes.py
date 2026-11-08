"""
Kesava Cleaning - Service and Product Catalog Endpoints
Provides the list of available professional services, botanical products, and scents.
"""

from flask import Blueprint, jsonify

catalog_bp = Blueprint("catalog", __name__)

SERVICES = [
    {
        "id": "res-deep",
        "name": "Residential Deep Clean",
        "tagline": "Full Home Revival with Plant-Derived Surfactants",
        "base_price": 129.0,
        "features": [
            "All living areas, bedrooms, and baseboards wiped",
            "Kitchen surfaces, exterior appliances, and sink sanitized",
            "Full bathroom scale, grout, and glass descaling",
            "Non-toxic botanical aromatherapy diffuser pass included",
            "100% pet & infant crawl-safe surfaces"
        ],
        "badge": "Most Popular",
        "icon": "sparkles"
    },
    {
        "id": "kitchen-restore",
        "name": "Kitchen & Appliance Restoration",
        "tagline": "Bio-Enzyme Degreasing without Caustic Oven Fumes",
        "base_price": 99.0,
        "features": [
            "Heavy stove top, range hood, and backsplash degreasing",
            "Inside oven & microwave bio-dissolution",
            "Granite, quartz, or marble pH-balanced polishing",
            "Stainless steel streak-free botanical treatment"
        ],
        "badge": "Grease Buster",
        "icon": "flame"
    },
    {
        "id": "bath-sanitize",
        "name": "Bathroom Mineral & Scale Sanitization",
        "tagline": "Organic Citric Acid Descaling without Toxic Bleach",
        "base_price": 89.0,
        "features": [
            "Shower glass soap scum and hard water ring removal",
            "Porcelain and glazed tile deep sanitization",
            "Zero chlorine odors or caustic lung irritants",
            "Natural tea tree & eucalyptus antimicrobial barrier"
        ],
        "badge": "Limescale Slayer",
        "icon": "droplet"
    },
    {
        "id": "move-clean",
        "name": "Move-in / Move-out Sanitization",
        "tagline": "100% Guaranteed Deposit Return Standard",
        "base_price": 169.0,
        "features": [
            "Inside all empty cabinets, drawers, and closets",
            "Window tracks, light switch plates, and door frames",
            "High-temperature steam extraction on tile/grout",
            "Inspection report-ready cleanliness"
        ],
        "badge": "Turnkey Ready",
        "icon": "home"
    },
    {
        "id": "comm-clean",
        "name": "Eco Commercial & Office Spaces",
        "tagline": "Promote Workplace Wellness and Pure Indoor Air",
        "base_price": 199.0,
        "features": [
            "Desk, keyboard, and phone high-touch point sanitization",
            "Conference room glass and breakroom degreasing",
            "Zero synthetic fragrance migraines for your team",
            "Custom recurring night/weekend scheduling"
        ],
        "badge": "B-Corp Standard",
        "icon": "building"
    }
]

PRODUCTS = [
    {
        "id": "bundle",
        "name": "Kesava Starter Bundle",
        "subtitle": "Borosilicate Amber Glass Bottle + 4 Concentrate Pouches",
        "price": 34.0,
        "original_price": 48.0,
        "pods_included": 4,
        "badge": "Best Value",
        "description": "Everything needed to eliminate single-use plastic forever. Includes our heavy-duty amber glass spray flask, protective silicone base, and 4 bio-enzyme refill pouches."
    },
    {
        "id": "single",
        "name": "Everyday Glass Spray Flask",
        "subtitle": "500ml Heavy Borosilicate Glass + 1 Pod",
        "price": 22.0,
        "original_price": 28.0,
        "pods_included": 1,
        "badge": None,
        "description": "Ergonomic glass trigger bottle designed to sit beautifully beside your kitchen sink. Includes 1 concentrate pod."
    },
    {
        "id": "refills",
        "name": "Concentrate Refill Pouches (4x Pack)",
        "subtitle": "Makes 2 Litres of Active Plant-Enzyme Cleaner",
        "price": 18.0,
        "original_price": 24.0,
        "pods_included": 4,
        "badge": "Zero Waste",
        "description": "Just add tap water. Four compostable foil pouches that eliminate 94% of transit carbon emissions and save 4 single-use bottles."
    }
]

@catalog_bp.route("/services", methods=["GET"])
def get_services():
    return jsonify({"success": True, "services": SERVICES}), 200

@catalog_bp.route("/products", methods=["GET"])
def get_products():
    return jsonify({"success": True, "products": PRODUCTS}), 200
