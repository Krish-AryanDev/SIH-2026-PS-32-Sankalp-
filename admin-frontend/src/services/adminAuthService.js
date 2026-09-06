import { APP_CONFIG } from "../config/appConfig";

/**
 * Admin Authentication Service
 */
export const loginAdminApi = async ({ adminId, centerCode, password }) => {
  try {
    const response = await fetch(`${APP_CONFIG.apiBaseUrl}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: adminId, // Admin ID maps to email / identifier
        centerCode: centerCode,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign in. Please check your credentials.");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error("Unable to connect to the server. Please ensure the backend is running on port 5000.");
    }
    throw error;
  }
};
