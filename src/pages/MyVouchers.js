import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function getGrabbedVouchers() {
  const data = localStorage.getItem("grabbedVouchers");
  return data ? JSON.parse(data) : [];
}

function MyVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setVouchers(getGrabbedVouchers());
  }, []);

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
      <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18 }}>My Vouchers</h2>
      {vouchers.length === 0 ? (
        <div style={{ color: "#b0b0b0", fontSize: 15 }}>No vouchers grabbed yet.</div>
      ) : (
        vouchers.map(voucher => (
          <div key={voucher.id} style={{
            background: "#2db7f5",
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
            <div style={{ fontSize: 13 }}>{voucher.description}</div>
          </div>
        ))
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="close-bottom-btn spin-style" onClick={() => navigate("/")}>Close</button>
      </div>
    </div>
  );
}

export default MyVouchers; 