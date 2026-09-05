import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native';
import { authService } from '../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('aadhar'); // 'aadhar' | 'kisan'
  const [userData, setUserData] = useState('');
  const [otp, setOtp] = useState('');
  
  // Flow states
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Feedback & error states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Resend OTP countdown timer
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputRef = useRef(null);

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Reset errors when inputs change
  const handleUserDataChange = (text) => {
    // Only allow numeric digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setUserData(cleaned);
    if (errorMessage) setErrorMessage('');
  };

  const handleOtpChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setOtp(cleaned);
    if (errorMessage) setErrorMessage('');
  };

  const handleTabChange = (tab) => {
    if (isOtpSent) return; // Don't switch tabs while in OTP state unless reset
    setActiveTab(tab);
    setUserData('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Step 1: Send OTP to backend /api/auth/register
  const handleSendOtp = async () => {
    Keyboard.dismiss();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedData = userData.trim();

    // Client-side format validations matching backend logic
    if (activeTab === 'aadhar') {
      if (trimmedData.length !== 12) {
        setErrorMessage('Please enter a valid 12-digit Aadhar Number.');
        return;
      }
    } else {
      if (trimmedData.length !== 11) {
        setErrorMessage('Please enter a valid 11-digit Kisan ID.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await authService.requestOtp(trimmedData);

      if (response.success && response.present) {
        setIsOtpSent(true);
        setRegisteredPhone(response.phoneNumber || '');
        setSuccessMessage(`OTP sent successfully to registered number.`);
        setResendCountdown(30); // 30-second cooldown
        // Focus OTP field after a short delay
        setTimeout(() => {
          if (otpInputRef.current) {
            otpInputRef.current.focus();
          }
        }, 300);
      } else if (response.present === false) {
        setErrorMessage('Farmer not found in the database. Please verify your ID.');
      } else {
        setErrorMessage(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP via backend /api/auth/verify-otp
  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    setErrorMessage('');

    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter the 4-digit OTP sent to your phone.');
      return;
    }

    if (!registeredPhone) {
      setErrorMessage('Session expired. Please request a new OTP.');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await authService.verifyOtp(registeredPhone, otp);

      if (response.success && response.token) {
        // Successful verification -> navigate to success screen
        onLoginSuccess({
          token: response.token,
          farmer: response.farmer,
        });
      } else {
        setErrorMessage(response.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset to change Aadhar / Kisan ID
  const handleReset = () => {
    setIsOtpSent(false);
    setOtp('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Mask phone number for display (e.g. +91 ******4321)
  const formatMaskedPhone = (phone) => {
    if (!phone || phone.length < 4) return phone;
    const last4 = phone.slice(-4);
    return `+91 ******${last4}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF3E6" />

      {/* BACKGROUND DECORATIONS (pointerEvents="none" to prevent blocking touch events on Android) */}
      <Text pointerEvents="none" style={styles.topLeftLeaf}>🌿</Text>
      <Text pointerEvents="none" style={styles.topRightLeaf}>🌿</Text>

      {/* BOTTOM LANDSCAPE SCENE */}
      <View pointerEvents="none" style={styles.landscapeContainer}>
        <View style={styles.hillBackRight} />
        <View style={styles.hillFrontLeft} />
        <View style={styles.hillFrontRight} />
        <Text style={styles.bgTractor}>🚜</Text>
        <Text style={styles.bgWheatLeft}>🌾</Text>
        <Text style={styles.bgWheatRight}>🌾🌾</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* LOGO SECTION */}
          <View style={styles.logoSection}>
            <View style={styles.logoIconRow}>
              <Text style={styles.logoLeaf}>🌱</Text>
              <Text style={styles.logoTractor}>🚜</Text>
              <Text style={styles.logoShield}>🛡️</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Kisan Mitra</Text>
              <Text style={styles.logoSubtitle}>किसान मित्र | Farmer Portal</Text>
            </View>
          </View>

          {/* HEADER SECTION */}
          <Text style={styles.screenTitle}>Farmer Login</Text>

          {/* TAB TOGGLE SECTION */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'aadhar' && styles.activeToggleButton,
                isOtpSent && styles.disabledTab,
              ]}
              onPress={() => handleTabChange('aadhar')}
              disabled={isOtpSent}
              activeOpacity={0.8}
            >
              <Text style={activeTab === 'aadhar' ? styles.activeToggleIcon : styles.inactiveToggleIcon}>
                🪪
              </Text>
              <Text style={activeTab === 'aadhar' ? styles.activeToggleText : styles.inactiveToggleText}>
                {' '}Aadhar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'kisan' && styles.activeToggleButton,
                isOtpSent && styles.disabledTab,
              ]}
              onPress={() => handleTabChange('kisan')}
              disabled={isOtpSent}
              activeOpacity={0.8}
            >
              <Text style={activeTab === 'kisan' ? styles.activeToggleIcon : styles.inactiveToggleIcon}>
                🚜
              </Text>
              <Text style={activeTab === 'kisan' ? styles.activeToggleText : styles.inactiveToggleText}>
                {' '}Kisan ID
              </Text>
            </TouchableOpacity>
          </View>

          {/* PREVIOUSLY ENTERED USER DATA INPUT SECTION */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>
                {activeTab === 'aadhar' ? 'Aadhar Number (12 digits)' : 'Kisan ID (11 digits)'}
              </Text>
              {isOtpSent && (
                <TouchableOpacity onPress={handleReset} style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>✏️ Change</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.inputContainer, isOtpSent && styles.inputContainerLocked]}>
              <View style={styles.inputIconWrapper}>
                <Text style={styles.inputIcon}>
                  {activeTab === 'aadhar' ? '🪪' : '🚜'}
                </Text>
              </View>
              <TextInput
                style={[styles.textInput, isOtpSent && styles.textInputLocked]}
                placeholder={
                  activeTab === 'aadhar'
                    ? 'Enter your 12-digit Aadhar Number'
                    : 'Enter your 11-digit Kisan ID'
                }
                placeholderTextColor="#7A8B7A"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
                maxLength={activeTab === 'aadhar' ? 12 : 11}
                value={userData}
                onChangeText={handleUserDataChange}
                editable={!isOtpSent && !isLoading}
              />
              {isOtpSent && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockBadgeText}>✓ Entered</Text>
                </View>
              )}
            </View>
          </View>

          {/* OTP INPUT SECTION - APPEARS DIRECTLY BELOW USER DATA BOX */}
          {isOtpSent && (
            <View style={styles.otpSection}>
              {/* OTP Info banner */}
              <View style={styles.otpNotificationPill}>
                <Text style={styles.otpNotificationText}>
                  📩 OTP sent to {formatMaskedPhone(registeredPhone)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Enter 4-Digit OTP</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconWrapper}>
                  <Text style={styles.inputIcon}>🔑</Text>
                </View>
                <TextInput
                  ref={otpInputRef}
                  style={[styles.textInput, styles.otpTextInput]}
                  placeholder="• • • •"
                  placeholderTextColor="#7A8B7A"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyOtp}
                  maxLength={4}
                  value={otp}
                  onChangeText={handleOtpChange}
                  editable={!isVerifying}
                />
              </View>

              {/* Resend OTP Row */}
              <View style={styles.resendRow}>
                {resendCountdown > 0 ? (
                  <Text style={styles.resendCountdownText}>
                    Resend OTP in <Text style={styles.boldTimer}>{resendCountdown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendActionText}>🔄 Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* ERROR / SUCCESS NOTIFICATION BANNER */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage && !errorMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successMessageText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* ACTION BUTTON SECTION */}
          {!isOtpSent ? (
            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.actionButtonText}> Sending OTP...</Text>
                </View>
              ) : (
                <Text style={styles.actionButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, isVerifying && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isVerifying}
              activeOpacity={0.8}
            >
              {isVerifying ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.actionButtonText}> Verifying OTP...</Text>
                </View>
              ) : (
                <Text style={styles.actionButtonText}>Verify & Login</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF3E6',
  },
  keyboardView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    paddingVertical: 30,
  },

  /* --- BACKGROUND DECORATIONS --- */
  topLeftLeaf: {
    position: 'absolute',
    top: 20,
    left: -10,
    fontSize: 50,
    opacity: 0.15,
    transform: [{ rotate: '120deg' }],
    zIndex: 0,
  },
  topRightLeaf: {
    position: 'absolute',
    top: 100,
    right: -20,
    fontSize: 60,
    opacity: 0.15,
    transform: [{ rotate: '-45deg' }],
    zIndex: 0,
  },
  landscapeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 0,
    overflow: 'hidden',
  },
  hillBackRight: {
    position: 'absolute',
    bottom: -150,
    right: -50,
    width: 400,
    height: 300,
    borderRadius: 200,
    backgroundColor: '#E8DEC4',
    borderWidth: 2,
    borderColor: '#DFD2B5',
  },
  hillFrontLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 350,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#EAE1CA',
    borderWidth: 2,
    borderColor: '#DFD2B5',
  },
  hillFrontRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 150,
    borderRadius: 150,
    backgroundColor: '#E3D7BA',
  },
  bgTractor: {
    position: 'absolute',
    bottom: 70,
    left: 60,
    fontSize: 45,
    opacity: 0.15,
  },
  bgWheatLeft: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    fontSize: 30,
    opacity: 0.15,
  },
  bgWheatRight: {
    position: 'absolute',
    bottom: 60,
    right: 50,
    fontSize: 35,
    opacity: 0.15,
  },

  /* --- LOGO SECTION --- */
  logoSection: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: -10,
  },
  logoIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  logoLeaf: {
    position: 'absolute',
    top: -15,
    left: 5,
    fontSize: 20,
    zIndex: 2,
  },
  logoTractor: {
    fontSize: 40,
    color: '#1B5E20',
  },
  logoShield: {
    fontSize: 28,
    marginLeft: 2,
    marginBottom: 5,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  logoSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3B2E',
    marginTop: -2,
  },

  /* --- HEADER SECTION --- */
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* --- TAB TOGGLE SECTION --- */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F6EB',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#A8C3A8',
    height: 55,
    marginBottom: 22,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  activeToggleButton: {
    backgroundColor: '#1B5E20',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  disabledTab: {
    opacity: 0.6,
  },
  activeToggleIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  inactiveToggleIcon: {
    fontSize: 18,
    marginRight: 6,
    opacity: 0.8,
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inactiveToggleText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },

  /* --- INPUT SECTION --- */
  inputSection: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3B2E',
  },
  changeButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  changeButtonText: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6EB',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#A8C3A8',
    height: 55,
    paddingHorizontal: 15,
  },
  inputContainerLocked: {
    backgroundColor: '#EBEFE3',
    borderColor: '#8CAE8C',
  },
  inputIconWrapper: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#7A8B7A',
    borderRadius: 6,
    padding: 3,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1B5E20',
    fontWeight: '600',
    height: '100%',
  },
  textInputLocked: {
    color: '#2E3B2E',
    fontWeight: '700',
  },
  lockBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  lockBadgeText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: 'bold',
  },

  /* --- OTP SECTION (APPEARS BELOW) --- */
  otpSection: {
    marginBottom: 16,
    marginTop: 4,
    backgroundColor: '#FAF7EE',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C8DEC8',
  },
  otpNotificationPill: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    alignSelf: 'center',
  },
  otpNotificationText: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '600',
  },
  otpTextInput: {
    letterSpacing: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  resendCountdownText: {
    fontSize: 13,
    color: '#667C66',
  },
  boldTimer: {
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  resendActionText: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* --- BANNERS --- */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorMessageText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  successMessageText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  /* --- BUTTONS --- */
  actionButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
