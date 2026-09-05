import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import SuccessScreen from './src/screens/SuccessScreen';

/**
 * Root Application Component
 * Controls screen routing between Farmer Login / OTP flow and Success screen.
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN'); // 'LOGIN' | 'SUCCESS'
  const [authSession, setAuthSession] = useState(null); // { token, farmer }

  // Callback when OTP verification succeeds
  const handleLoginSuccess = (data) => {
    setAuthSession(data);
    setCurrentScreen('SUCCESS');
  };

  // Callback to log out and return to the login screen
  const handleLogout = () => {
    setAuthSession(null);
    setCurrentScreen('LOGIN');
  };

  if (currentScreen === 'SUCCESS') {
    return (
      <SuccessScreen
        farmerData={authSession?.farmer}
        token={authSession?.token}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}