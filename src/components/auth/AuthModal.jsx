import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, signup, quickLoginDemo } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up inputs
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("customer"); // 'customer' or 'admin'
  const [adminSecret, setAdminSecret] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const result = login(loginEmail, loginPassword);
    if (result.success) {
      if (onSuccess) onSuccess(`Welcome back, ${result.user.name}!`);
      onClose();
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    // If attempting to register as admin, verify admin security token
    if (signupRole === 'admin' && adminSecret !== 'kesavaadmin' && adminSecret !== 'admin123') {
      setErrorMessage("Invalid Admin Registration Passcode. Use 'admin123' for verification.");
      return;
    }

    const result = signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      phone: signupPhone,
      address: signupAddress,
      role: signupRole
    });

    if (result.success) {
      if (onSuccess) onSuccess(`Account created! Logged in as ${result.user.name}`);
      onClose();
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleDemoClick = (role) => {
    const user = quickLoginDemo(role);
    if (user) {
      if (onSuccess) onSuccess(`Logged in as Demo ${role === 'admin' ? 'Admin' : 'Customer'} (${user.name})`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
            {mode === 'login' ? 'Sign In to KesavaCleaning' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {mode === 'login' 
              ? 'Access your orders, saved cart items, and account dashboard.' 
              : 'Join KesavaCleaning for special trade discounts and rapid reorders.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@kesavacleaning.com or your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-xl text-xs sm:text-sm border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-100 rounded-xl text-xs sm:text-sm border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md shadow-emerald-600/30 transition text-sm flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-400 block mb-2 font-medium">
                Testing the app? Instant 1-click Demo Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoClick('admin')}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Demo Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('customer')}
                  className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-neutral-200"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demo Customer</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* 2. SIGN UP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-xl text-xs border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-xl text-xs border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Contact Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-100 rounded-xl text-xs border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Account Role
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full p-2 bg-neutral-100 rounded-xl text-xs border border-neutral-200 font-bold focus:bg-white"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Store Admin</option>
                </select>
              </div>
            </div>

            {signupRole === 'admin' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <label className="block text-[11px] font-bold text-amber-900">
                  Admin Passcode (Security Check)
                </label>
                <input
                  type="password"
                  placeholder="Enter 'admin123'"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg text-xs border border-amber-300 font-mono"
                />
                <span className="text-[10px] text-amber-700 block">Default passcode is <strong>admin123</strong></span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Delivery Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Street, Area, City, Pin"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-100 rounded-xl text-xs border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Create Password (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-neutral-100 rounded-xl text-xs border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow transition text-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>Complete Registration & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
