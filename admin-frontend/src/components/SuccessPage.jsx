import React from "react";
import "../styles/SuccessPage.css";

export const SuccessPage = ({ admin, onLogout }) => {
  return (
    <div className="success-page-container">
      <div className="success-card">
        <p className="success-paragraph">Successful Login</p>
        
        {admin && (
          <div className="admin-session-details">
            <div className="detail-row">
              <span className="detail-label">Admin Email / ID:</span>
              <span className="detail-value">{admin.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Centre Code:</span>
              <span className="detail-value">{admin.centerCode}</span>
            </div>
          </div>
        )}

        <button type="button" className="signout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};
