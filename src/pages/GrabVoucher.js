import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AVAILABLE_VOUCHERS = [
  { id: 1, value: "$5 Discount", description: "Get $5 off your next purchase." },
  { id: 2, value: "$10 Discount", description: "Get $10 off your next purchase." },
  { id: 3, value: "Free Coffee", description: "Enjoy a free coffee on us." },
];

function getGrabbedVouchers() {
  const data = localStorage.getItem("grabbedVouchers");
  return data ? JSON.parse(data) : [];
}

function saveGrabbedVoucher(voucher) {
  const current = getGrabbedVouchers();
  localStorage.setItem("grabbedVouchers", JSON.stringify([...current, voucher]));
}

function GrabVoucher() {
  const [grabbed, setGrabbed] = useState(getGrabbedVouchers());
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleGrab = (voucher) => {
    setSelectedVoucher(voucher);
    setShowModal(true);
    setError("");
    setSuccess("");
    setIsMember(false);
  };

  const confirmGrab = () => {
    if (!isMember) {
      setError("You must confirm you are a CRM member to grab this voucher.");
      return;
    }
    if (grabbed.find(v => v.id === selectedVoucher.id)) {
      setError("You have already grabbed this voucher.");
      return;
    }
    saveGrabbedVoucher(selectedVoucher);
    setGrabbed(getGrabbedVouchers());
    setSuccess("Voucher successfully grabbed!");
    setShowModal(false);
  };

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "20px 0", position: "relative" }}>
      {/* Close Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: 12,
          right: 8,
          background: "#f5f8fa",
          color: "#888",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          fontSize: 18,
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          transition: "background 0.2s",
        }}
        title="Close"
      >
        ×
      </button>
      <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18 }}>Grab Voucher</h2>
      {AVAILABLE_VOUCHERS.map(voucher => (
        <div key={voucher.id} style={{
          background: "#1890ff",
          color: "#fff",
          borderRadius: 10,
          padding: "14px 12px",
          marginBottom: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{voucher.value}</div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>{voucher.description}</div>
          <button
            style={{
              background: grabbed.find(v => v.id === voucher.id) ? "#b0b0b0" : "#2db7f5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 0",
              fontWeight: 600,
              fontSize: 14,
              cursor: grabbed.find(v => v.id === voucher.id) ? "not-allowed" : "pointer",
              width: "100%",
            }}
            disabled={grabbed.find(v => v.id === voucher.id)}
            onClick={() => handleGrab(voucher)}
          >
            {grabbed.find(v => v.id === voucher.id) ? "Already Grabbed" : "Grab Now"}
          </button>
        </div>
      ))}
      {/* Modal for CRM member confirmation */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              minWidth: 220,
              maxWidth: "95vw",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 10, fontSize: 16, textAlign: "center" }}>Confirm Membership</h3>
            <div style={{ marginBottom: 10 }}>
              <input
                type="checkbox"
                id="isMember"
                checked={isMember}
                onChange={e => setIsMember(e.target.checked)}
              />
              <label htmlFor="isMember" style={{ marginLeft: 8, fontSize: 14 }}>
                I confirm I am a CRM member
              </label>
            </div>
            {error && <div style={{ color: "#d32f2f", marginBottom: 8, fontSize: 13 }}>{error}</div>}
            <button
              style={{
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                marginRight: 8,
                width: "100%",
              }}
              onClick={confirmGrab}
            >
              Confirm & Grab
            </button>
            <button
              style={{
                background: "#f5f8fa",
                color: "#1890ff",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                width: "100%",
                marginTop: 8,
              }}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {success && <div style={{ color: "#388e3c", marginTop: 14, fontSize: 14 }}>{success}</div>}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="close-bottom-btn spin-style" onClick={() => navigate("/")}>Close</button>
      </div>
    </div>
  );
}

export default GrabVoucher; 