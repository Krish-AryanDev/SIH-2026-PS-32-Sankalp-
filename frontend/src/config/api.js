/**
 * Backend API Configuration
 * 
 * USB Debugging (Physical Phone):
 * Routes via USB cable when `adb reverse tcp:5000 tcp:5000` is run.
 * 
 * If running on Android Emulator without adb reverse, you can switch to: http://10.0.2.2:5000
 * If testing over local Wi-Fi without USB cable, use your PC's IP: http://192.168.X.X:5000
 */
// For USB debugging on physical device (with `adb reverse tcp:5000 tcp:5000`), use localhost:5000
// If on Android Emulator without adb reverse, you can switch to: http://10.0.2.2:5000
const DEFAULT_HOST = 'http://localhost:5000';

export const API_BASE_URL = `${DEFAULT_HOST}/api`;

export const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  ME: `${API_BASE_URL}/auth/me`,
  SLOT_CENTRES: `${API_BASE_URL}/slot_book/slot`,
  SLOT_CAN_BOOK: `${API_BASE_URL}/slot_book/can_book`,
  SLOT_BOOK: `${API_BASE_URL}/slot_book/book`,
  SLOT_ACTIVE_PASS: `${API_BASE_URL}/slot_book/active_pass`,
  SLOT_CANCEL: `${API_BASE_URL}/slot_book/cancel`,
};
