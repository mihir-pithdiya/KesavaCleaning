import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // All registered accounts database
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('kesava_users_db');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kesava_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync users DB to localStorage
  useEffect(() => {
    localStorage.setItem('kesava_users_db', JSON.stringify(users));
  }, [users]);

  // Sync active session user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kesava_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kesava_auth_user');
    }
  }, [currentUser]);

  // Login handler
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const matchedUser = users.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (matchedUser) {
      const sessionUser = { ...matchedUser };
      delete sessionUser.password; // Do not keep password in active session state
      setCurrentUser(sessionUser);
      return { success: true, user: sessionUser };
    }

    return { 
      success: false, 
      error: "Invalid email or password. Please check your credentials." 
    };
  };

  // Sign up (Registration) handler
  const signup = ({ name, email, password, phone = "", address = "", role = "customer" }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return { success: false, error: "Name, email, and password are required." };
    }

    if (cleanPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: role === 'admin' ? 'admin' : 'customer',
      phone: phone.trim() || "+91 90000 00000",
      address: address.trim() || "Address not provided",
      joinedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setUsers(prev => [...prev, newUser]);

    // Automatically log in the new user
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setCurrentUser(sessionUser);

    return { success: true, user: sessionUser };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
  };

  // Quick Demo account switcher
  const quickLoginDemo = (role = 'admin') => {
    const targetEmail = role === 'admin' ? 'admin@kesavacleaning.com' : 'priya@example.com';
    const target = users.find(u => u.email.toLowerCase() === targetEmail);
    if (target) {
      const sessionUser = { ...target };
      delete sessionUser.password;
      setCurrentUser(sessionUser);
      return sessionUser;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      setUsers,
      isAuthenticated: !!currentUser,
      isAdmin: currentUser?.role === 'admin',
      login,
      signup,
      logout,
      quickLoginDemo
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
