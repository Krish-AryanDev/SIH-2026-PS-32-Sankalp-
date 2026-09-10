import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ComingSoonScreen from './src/screens/ComingSoonScreen';
import SlotBookingScreen from './src/screens/SlotBookingScreen';

/**
 * Root Application Component
 * Controls screen routing between Farmer Login / OTP flow, Home Screen, Slot Booking, and Feature modules.
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN'); // 'LOGIN' | 'HOME' | 'SLOT_BOOK' | 'COMING_SOON'
  const [comingSoonFeature, setComingSoonFeature] = useState('Feature');
  const [authSession, setAuthSession] = useState(null); // { token, farmer }
  const [activeBooking, setActiveBooking] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'

  // Callback when OTP verification succeeds
  const handleLoginSuccess = (data) => {
    setAuthSession(data);
    setCurrentScreen('HOME');
  };

  // Navigation router
  const handleNavigate = (destination) => {
    switch (destination) {
      case 'SLOT_BOOK':
        setCurrentScreen('SLOT_BOOK');
        break;
      case 'PAYMENT':
        setComingSoonFeature('Payment');
        setCurrentScreen('COMING_SOON');
        break;
      case 'QUEUE':
        setComingSoonFeature('Queue Tracking');
        setCurrentScreen('COMING_SOON');
        break;
      case 'NOTIFICATIONS':
        setComingSoonFeature('Notifications');
        setCurrentScreen('COMING_SOON');
        break;
      case 'PROCUREMENT':
        setComingSoonFeature('Procurement Status');
        setCurrentScreen('COMING_SOON');
        break;
      case 'HELP':
        setComingSoonFeature('Help & Support');
        setCurrentScreen('COMING_SOON');
        break;
      default:
        setCurrentScreen('HOME');
        break;
    }
  };

  // Return to Home Screen
  const handleBackToHome = () => {
    setCurrentScreen('HOME');
  };

  // Booking completion handler
  const handleBookingComplete = (bookingData) => {
    setActiveBooking(bookingData);
    setCurrentScreen('HOME');
  };

  // Callback to log out and return to the login screen
  const handleLogout = () => {
    setAuthSession(null);
    setActiveBooking(null);
    setCurrentScreen('LOGIN');
  };

  if (currentScreen === 'HOME') {
    return (
      <HomeScreen
        farmerData={authSession?.farmer}
        token={authSession?.token}
        activeBooking={activeBooking}
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onCancelBooking={() => setActiveBooking(null)}
      />
    );
  }

  if (currentScreen === 'SLOT_BOOK') {
    return (
      <SlotBookingScreen
        farmerData={authSession?.farmer}
        token={authSession?.token}
        activeBooking={activeBooking}
        language={language}
        onLanguageChange={setLanguage}
        onBack={handleBackToHome}
        onBookingComplete={handleBookingComplete}
      />
    );
  }

  if (currentScreen === 'COMING_SOON') {
    return (
      <ComingSoonScreen
        title={comingSoonFeature}
        language={language}
        onLanguageChange={setLanguage}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <LoginScreen
      language={language}
      onLanguageChange={setLanguage}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}