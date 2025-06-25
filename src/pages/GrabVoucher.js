import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [spinPrize, setSpinPrize] = useState(localStorage.getItem('spinPrize') || '');
  const [showModal, setShowModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPoster, setShowPoster] = useState(false);
  const navigate = useNavigate();

  const handleGrab = () => {
    setShowModal(true);
    setError("");
    setSuccess("");
    setIsMember(false);
  };

  const confirmGrab = () => {
    if (!isMember) {
      setError("You must confirm you are a Goba! member to grab this voucher.");
      return;
    }
    if (!spinPrize) {
      setError("Please spin the wheel to get a prize before grabbing a voucher.");
      return;
    }
    // Prevent duplicate grab for same prize (optional: can allow multiple)
    if (grabbed.find(v => v.value === spinPrize)) {
      setError("You have already grabbed this voucher.");
      return;
    }
    const voucherWithPrize = {
      id: Date.now(),
      value: spinPrize,
      description: 'Won from Spin',
      prize: spinPrize,
      status: 'Pending',
    };
    // Save to backend
    fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherWithPrize)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save voucher to server');
        return res.json();
      })
      .then(data => {
        saveGrabbedVoucher(voucherWithPrize); // still save to localStorage for user's own view
        setGrabbed(getGrabbedVouchers());
        setSuccess("Voucher successfully grabbed!");
        setShowModal(false);
        localStorage.removeItem('spinPrize');
        setSpinPrize('');
        setError("");
      })
      .catch(err => {
        setError("Failed to save voucher. Please try again.");
      });
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
      <div style={{
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
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {spinPrize ? spinPrize : 'Please spin the wheel to get a prize!'}
        </div>
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          {spinPrize ? 'You can grab this voucher.' : 'You must spin the wheel to get a voucher.'}
        </div>
        <button
          style={{
            background: spinPrize ? '#2db7f5' : '#b0b0b0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 0',
            fontWeight: 600,
            fontSize: 14,
            cursor: spinPrize ? 'pointer' : 'not-allowed',
            width: '100%',
          }}
          disabled={!spinPrize}
          onClick={handleGrab}
        >
          {spinPrize ? 'Grab Now' : 'Grab Disabled'}
        </button>
      </div>
      {/* Modal for Goba! member confirmation */}
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
                I confirm I am a <b>Goba!</b> member
              </label>
            </div>
            <div style={{ color: '#d32f2f', fontSize: 13, marginBottom: 8 }}>
              * If you are not a Goba! member, your voucher will be voided and not issued.
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
                cursor: isMember ? "pointer" : "not-allowed",
                marginRight: 8,
                width: "100%",
                opacity: isMember ? 1 : 0.6,
              }}
              onClick={confirmGrab}
              disabled={!isMember}
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
            <button
              style={{
                marginTop: 10,
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                width: "100%",
                fontWeight: 600,
                fontSize: 14,
              }}
              onClick={() => setShowPoster(true)}
            >
              I am not a member. Join Now
            </button>
          </div>
        </div>
      )}
      {/* Modal for QR poster */}
      {showPoster && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
          onClick={() => setShowPoster(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              maxWidth: 400,
              width: "90vw",
              textAlign: "center",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <img src="/goba-poster.jpg" alt="Goba! Membership Poster" style={{ width: "100%", borderRadius: 8 }} />
            <p style={{ marginTop: 10, fontWeight: 600 }}>
              Not our member yet? <br />
              Scan the QR code to sign up and enjoy instant rewards!
            </p>
            <button
              style={{
                marginTop: 10,
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                cursor: "pointer",
              }}
              onClick={() => setShowPoster(false)}
            >
              Close
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