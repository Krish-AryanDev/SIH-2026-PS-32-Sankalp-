import { ENDPOINTS } from '../config/api';

/**
 * Authentication Service for communicating with backend auth endpoints
 */
export const authService = {
  /**
   * Request OTP by sending farmerID (11 digits) or AadharNumber (12 digits)
   * @param {string} userData - 11-digit farmerID or 12-digit AadharNumber
   * @returns {Promise<{ success: boolean, present: boolean, phoneNumber?: string, message: string }>}
   */
  async requestOtp(userData) {
    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: userData.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          present: false,
          message: data.message || 'Failed to request OTP. Please try again.',
        };
      }

      return {
        success: true,
        present: data.present,
        phoneNumber: data.phoneNumber,
        message: data.message,
      };
    } catch (error) {
      console.error('Network/Request error in requestOtp:', error);
      return {
        success: false,
        present: null,
        message: 'Unable to connect to backend server. Please check your network and ensure backend is running.',
      };
    }
  },

  /**
   * Verify OTP sent to farmer's phone number
   * @param {string} phoneNumber - 10-digit phone number
   * @param {string} otp - 4-digit OTP
   * @returns {Promise<{ success: boolean, token?: string, farmer?: object, message: string }>}
   */
  async verifyOtp(phoneNumber, otp) {
    try {
      const response = await fetch(ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid or expired OTP. Please try again.',
        };
      }

      return {
        success: true,
        token: data.token,
        farmer: data.farmer,
        message: data.message,
      };
    } catch (error) {
      console.error('Network/Request error in verifyOtp:', error);
      return {
        success: false,
        message: 'Network error while verifying OTP. Please check your connection.',
      };
    }
  },

  /**
   * Fetch current authenticated farmer profile
   * @param {string} token - JWT bearer token
   * @returns {Promise<{ success: boolean, farmer?: object, message: string }>}
   */
  async getProfile(token) {
    try {
      const response = await fetch(ENDPOINTS.ME, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Failed to retrieve profile.',
        };
      }

      return {
        success: true,
        farmer: data.farmer,
        message: data.message,
      };
    } catch (error) {
      console.error('Network/Request error in getProfile:', error);
      return {
        success: false,
        message: 'Network error while fetching profile.',
      };
    }
  },
};
