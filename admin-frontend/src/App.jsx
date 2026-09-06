import React, { useState } from "react";
import { AdminLogin } from "./components/AdminLogin";
import { SuccessPage } from "./components/SuccessPage";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = ({ admin }) => {
    setCurrentUser(admin);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app-root">
      {currentUser ? (
        <SuccessPage admin={currentUser} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
