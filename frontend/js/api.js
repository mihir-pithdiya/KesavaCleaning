/**
 * Kesava Cleaning - API Client
 * Manages communication with Flask backend REST API and authentication token storage.
 */

const API_BASE_URL = (window.location.protocol.startsWith("http")) 
  ? "" 
  : "http://127.0.0.1:5000";

const STORAGE_KEYS = {
  TOKEN: "kesava_auth_token",
  USER: "kesava_user_data",
  CART: "kesava_cart_items"
};

const api = {
  // Token & User Storage Helpers
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Base fetch handler
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[Kesava API Error on ${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Authentication API
  async login(email, password) {
    const result = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (result.token && result.user) {
      this.setToken(result.token);
      this.setUser(result.user);
    }
    return result;
  },

  async register(name, email, password, phone = "", address = "") {
    const result = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone, address })
    });
    if (result.token && result.user) {
      this.setToken(result.token);
      this.setUser(result.user);
    }
    return result;
  },

  async getCurrentUser() {
    if (!this.getToken()) return null;
    try {
      const result = await this.request("/api/auth/me");
      if (result.user) {
        this.setUser(result.user);
        return result;
      }
      return null;
    } catch (e) {
      this.clearAuth();
      return null;
    }
  },

  async logout() {
    try {
      await this.request("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearAuth();
    }
  },

  // Service Bookings API
  async getBookings() {
    return await this.request("/api/bookings");
  },

  async createBooking(bookingData) {
    return await this.request("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData)
    });
  },

  async cancelBooking(bookingId) {
    return await this.request(`/api/bookings/${bookingId}/cancel`, {
      method: "PATCH"
    });
  },

  // Eco-Product Orders API
  async getOrders() {
    return await this.request("/api/orders");
  },

  async createOrder(orderData) {
    return await this.request("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData)
    });
  },

  // Reviews API
  async getReviews() {
    return await this.request("/api/reviews");
  },

  async submitReview(reviewData) {
    return await this.request("/api/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData)
    });
  }
};
