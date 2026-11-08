# KesavaCleaning - Pure Liquid Formulations Platform

An enterprise-grade, high-security modular React e-commerce and store operations platform designed specifically for bottled hard-surface hygiene formulations.

---

## 🔒 Security & Role Protections

1. **Strict Admin Verification (No 1-Click Bypass)**
   - To unlock the Admin Control Center, users must authenticate with their verified **Admin Email**, **Password**, and **2FA Security PIN** (`admin123`).
   - Casual 1-click bypass buttons have been removed.

2. **Customer Account Restriction (Disabled Admin Button)**
   - When a user is signed in with a **Customer Account**, the Admin Panel buttons in the top navbar and mobile bottom bar are **strictly disabled** with a lock indicator.
   - Any direct navigation to `/admin` while signed in as a customer triggers a **403 Forbidden Access Denied** barrier explaining that customer privileges cannot access administrative controls.

3. **Product Image File Upload (No URL Pasting)**
   - In the Admin Panel, adding or updating a formulation uses a **native file picker** (`<input type="file" accept="image/*" />`).
   - Images are read via `FileReader` and saved as local Base64 data URLs in `localStorage`.

4. **Multi-Tier Discount System + Preserved Coupon Codes**
   - **Individual Product Discounts**: Set specific discounts (% or ₹ offer price) on any individual product. Change discounts inline in the inventory table.
   - **Store-Wide Promotional Engine**: Activate global promotional discounts (e.g. 10%, 15%, 20% OFF) that apply across all catalog formulations simultaneously with a live header announcement banner.
   - **Active Coupon Section**: The coupon management system (`KESAVA10`, `CLEAN50`, `FREESHIP`) remains fully active in the admin portal and cart hub, stacking with individual and store-wide sales.

---

## 🔑 Credentials

| Role | Email | Password | 2FA Security PIN |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `admin@kesavacleaning.com` | `admin123` | `admin123` |
| **Customer** | `priya@example.com` | `user123` | — |

---

## 🚀 How to Run in Windows CMD

```cmd
cd C:\Users\mihir\.gemini\antigravity\scratch\kesavacleaning
npm run dev
```
Open **`http://localhost:5173`** in your browser.

*(Or double-click `kesavacleaning_standalone.html` to run in any browser with zero installation!)*
