import React, { useState } from "react";
import { User, MapPin, Lock, Eye, EyeOff, Globe, ChevronDown } from "lucide-react";
import { APP_CONFIG } from "../config/appConfig";
import { loginAdminApi } from "../services/adminAuthService";
import "../styles/AdminLogin.css";

export const AdminLogin = ({ onLoginSuccess }) => {
  const [adminId, setAdminId] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Language Selector state
  const [currentLanguage, setCurrentLanguage] = useState(APP_CONFIG.defaultLanguage);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!adminId.trim() || !centerCode.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginAdminApi({
        adminId: adminId.trim(),
        centerCode: centerCode.trim(),
        password
      });

      if (response.success) {
        if (onLoginSuccess) {
          onLoginSuccess({
            admin: response.admin,
            token: response.token
          });
        }
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLanguage = (lang) => {
    setCurrentLanguage(lang);
    setIsLangMenuOpen(false);
  };

  return (
    <div className="login-page-container">
      {/* Top Right Language Picker */}
      <header className="top-header-actions">
        <div className="language-dropdown-container">
          <button
            type="button"
            className="language-btn"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            aria-label="Select Language"
          >
            <Globe size={16} />
            <span>{currentLanguage}</span>
            <ChevronDown size={14} />
          </button>

          {isLangMenuOpen && (
            <div className="language-menu">
              {APP_CONFIG.supportedLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`language-item ${currentLanguage === lang ? "active" : ""}`}
                  onClick={() => handleSelectLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Center Login Card */}
      <main className="login-card-wrapper">
        <div className="login-card">
          {/* Logo & Header */}
          <div className="card-branding">
            <div className="logo-wrapper">
              <img
                src="/images/logo_main.png"
                alt="Main Logo"
                className="main-logo-img"
              />
            </div>
            <p className="app-subtitle">{APP_CONFIG.appName}</p>
            <h1 className="login-title">Admin Login</h1>
          </div>

          {/* Error Notice */}
          {error && <div className="error-banner">{error}</div>}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Admin ID Input */}
            <div className="form-group">
              <label htmlFor="adminId" className="form-label">
                Admin ID
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <User size={18} />
                </span>
                <input
                  id="adminId"
                  type="text"
                  className="form-input"
                  placeholder="Enter Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Centre Code Input */}
            <div className="form-group">
              <label htmlFor="centerCode" className="form-label">
                Centre Code
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <MapPin size={18} />
                </span>
                <input
                  id="centerCode"
                  type="text"
                  className="form-input"
                  placeholder="Enter Centre Code"
                  value={centerCode}
                  onChange={(e) => setCenterCode(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input (Masked as stars/dots by default) */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="signin-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
