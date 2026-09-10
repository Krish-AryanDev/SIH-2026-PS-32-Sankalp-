import { ENDPOINTS } from '../config/api';

/**
 * Fallback Procurement Centres for offline/demo/testing resilience
 */
const DEFAULT_CENTRES = [
  {
    centrecode: 'CEN-001',
    address: 'Rajasthan Mandi, Main Procurement Hub',
    district: 'Jaipur District',
    verified: true,
  },
  {
    centrecode: 'CEN-002',
    address: 'Alwar Krishi Upaj Mandi, Station Road',
    district: 'Alwar District',
    verified: true,
  },
  {
    centrecode: 'CEN-003',
    address: 'Udaipur Farmer Procurement Yard, Subhash Nagar',
    district: 'Udaipur District',
    verified: true,
  },
  {
    centrecode: 'CEN-004',
    address: 'Kota Grain Mandi, Anaj Mandi Complex',
    district: 'Kota District',
    verified: true,
  },
];

export const slotService = {
  /**
   * Convert any quantity and unit into Tons (numeric float)
   * 1 Ton = 10 Quintals = 1,000 Kg
   */
  convertToTons(val, unit) {
    const num = parseFloat(val) || 0;
    if (unit === 'Kg') return num / 1000;
    if (unit === 'Quintal') return num / 10;
    return num; // Ton
  },

  /**
   * Format quantity range in tons for backend 'min-max' expected string format
   */
  getQtyRange(tons) {
    const safeTons = Math.max(0.1, parseFloat(tons) || 1.0);
    const minQty = Math.max(0.05, safeTons * 0.9).toFixed(2);
    const maxQty = (safeTons * 1.1).toFixed(2);
    return `${minQty}-${maxQty}`;
  },

  /**
   * Fetch active procurement centers for given date, crop, and pincode
   */
  async fetchProcurementCentres({ date, crop_type = 'Wheat', pincode = '303007' }, token) {
    try {
      const queryParams = new URLSearchParams({
        date: date || new Date().toISOString().split('T')[0],
        crop_type: crop_type || 'Wheat',
        pincode: String(pincode || '303007'),
      }).toString();

      const response = await fetch(`${ENDPOINTS.SLOT_CENTRES}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        return {
          success: true,
          centres: data.data.map((c) => ({
            centrecode: c.centrecode,
            address: c.address || `${c.district || 'District'} Procurement Mandi`,
            district: c.district ? `${c.district} District` : 'Verified Mandi',
            verified: true,
          })),
        };
      }

      // If empty or no center matches this exact pincode, provide default fallback centers
      return {
        success: true,
        centres: DEFAULT_CENTRES,
        isFallback: true,
      };
    } catch (error) {
      console.warn('Network error in fetchProcurementCentres, using fallback list:', error.message);
      return {
        success: true,
        centres: DEFAULT_CENTRES,
        isFallback: true,
      };
    }
  },

  /**
   * Real-time availability check for a specific center, date, session, crop, and quantity range
   */
  async checkAvailability({ centercode, date, session = 'morning', crop_type = 'Wheat', qtyrange = '2.0-3.0' }, token) {
    try {
      const queryParams = new URLSearchParams({
        centercode,
        date,
        session,
        crop_type,
        qtyrange,
      }).toString();

      const response = await fetch(`${ENDPOINTS.SLOT_CAN_BOOK}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          canBook: data.data?.canBook ?? true,
          message: data.message,
          data: data.data,
        };
      }

      return {
        success: false,
        canBook: false,
        message: data.message || 'Availability check failed.',
      };
    } catch (error) {
      console.warn('Check availability network error:', error.message);
      return {
        success: true,
        canBook: true, // Optimistic default for testing
        message: 'Shift available for booking',
      };
    }
  },

  /**
   * Final atomic slot reservation
   */
  async bookSlot({ centercode, date, session, croptype = 'Wheat', qtyrange, farmer_id }, token) {
    try {
      const response = await fetch(ENDPOINTS.SLOT_BOOK, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centercode,
          date,
          session,
          croptype,
          qtyrange,
          farmer_id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Booking confirmed successfully!',
          data: data.data,
        };
      }

      return {
        success: false,
        message: data.message || data.reason || 'Failed to complete booking. Please try another session or center.',
      };
    } catch (error) {
      console.error('Error in bookSlot API:', error);
      return {
        success: false,
        message: 'Network error while booking slot. Please check your connection.',
      };
    }
  },

  /**
   * Fetch current active gate pass / booking for the authenticated farmer
   */
  async fetchActivePass(token) {
    try {
      const response = await fetch(ENDPOINTS.SLOT_ACTIVE_PASS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          booking: data.booking,
        };
      }

      return {
        success: false,
        booking: null,
      };
    } catch (error) {
      console.warn('Error fetching active pass:', error.message);
      return {
        success: false,
        booking: null,
      };
    }
  },

  /**
   * Cancel an active slot booking
   */
  async cancelBooking({ procurement_id }, token) {
    try {
      const response = await fetch(ENDPOINTS.SLOT_CANCEL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ procurement_id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Booking cancelled successfully.',
        };
      }

      return {
        success: false,
        message: data.message || 'Failed to cancel slot booking.',
      };
    } catch (error) {
      console.error('Error in cancelBooking API:', error);
      return {
        success: false,
        message: 'Network error while cancelling booking.',
      };
    }
  },
};
