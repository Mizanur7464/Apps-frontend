import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Simulate a user id/username for demo
const USER_KEY = "demoUser";

function getReferralData() {
  const data = localStorage.getItem("referralData");
  return data ? JSON.parse(data) : {};
}

function setReferralData(data) {
  localStorage.setItem("referralData", JSON.stringify(data));
}

function getGrabbedVouchers() {
  const data = localStorage.getItem("grabbedVouchers");
  return data ? JSON.parse(data) : [];
}

function saveGrabbedVoucher(voucher) {
  const current = getGrabbedVouchers();
  localStorage.setItem("grabbedVouchers", JSON.stringify([...current, voucher]));
}

function getTopReferrers() {
  // Demo data for top referrers
  return [
    { name: "user123", referrals: 8 },
    { name: "alice", referrals: 5 },
    { name: "bob", referrals: 3 },
  ];
}

function Referral() {
  const [referralCode] = useState(USER_KEY); // Simulate unique code
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralData, setReferralDataState] = useState(getReferralData());
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user has already entered a referral code
  const alreadyReferred = !!referralData.referredBy;
  const successfulReferrals = referralData.successfulReferrals || [];

  useEffect(() => {
    setReferralDataState(getReferralData());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + "/referral?code=" + referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReferralSubmit = e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!referralInput.trim()) {
      setError("Please enter a referral code.");
      return;
    }
    if (referralInput === referralCode) {
      setError("You cannot refer yourself.");
      return;
    }
    if (alreadyReferred) {
      setError("You have already used a referral code.");
      return;
    }
    // Mark as referred
    const newData = { ...referralData, referredBy: referralInput };
    setReferralData(newData);
    setReferralDataState(newData);
    // Give both users a voucher (simulate)
    saveGrabbedVoucher({
      id: "referral-" + Date.now(),
      value: "50% Discount Voucher",
      description: "Reward for successful referral.",
    });
    setSuccess("Referral successful! You have received a 50% voucher.");
    setReferralInput("");
    // Simulate updating the referrer's count (in real app, backend would handle this)
    let allReferralStats = JSON.parse(localStorage.getItem("allReferralStats") || "{}")
    if (!allReferralStats[referralInput]) allReferralStats[referralInput] = [];
    allReferralStats[referralInput].push(USER_KEY);
    localStorage.setItem("allReferralStats", JSON.stringify(allReferralStats));
  };

  // Get number of successful referrals for this user
  let allReferralStats = JSON.parse(localStorage.getItem("allReferralStats") || "{}")
  const myReferrals = allReferralStats[referralCode] || [];
  const myVouchers = getGrabbedVouchers().filter(v => v.id && v.id.toString().startsWith("referral-"));
  // Demo: rank is 1 if top, 2 if second, etc.
  const topReferrers = getTopReferrers();
  let rank = "-";
  const found = topReferrers.findIndex(r => r.name === referralCode);
  if (found !== -1) rank = found + 1;

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
      {/* Claim Reward Card */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #e0e0e0",
        borderRadius: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 28,
        marginBottom: 22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>🤝</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#1890ff", marginBottom: 6, textAlign: "center" }}>
          Claim Your Referral Reward
        </div>
        <div style={{ color: "#555", fontSize: 15, marginBottom: 18, textAlign: "center" }}>
          Join our CRM as a store member to claim your referral reward and unlock more perks!
        </div>
        <button
          style={{
            background: "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(24,144,255,0.08)"
          }}
          onClick={() => alert("Redirect to CRM join page (to be implemented)")}
        >
          Join CRM & Claim Reward
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
        <div style={{ flex: 1, background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 2 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1890ff" }}>{myReferrals.length}</div>
          <div style={{ fontSize: 13, color: "#888" }}>Referrals</div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 2 }}>🥇</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1890ff" }}>{myVouchers.length}</div>
          <div style={{ fontSize: 13, color: "#888" }}>Vouchers</div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 2 }}>🏆</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1890ff" }}>{rank}</div>
          <div style={{ fontSize: 13, color: "#888" }}>Rank</div>
        </div>
      </div>

      {/* Top Referrers Section */}
      <div style={{ background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 18, marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#222", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="trophy">🏆</span> Top Referrers
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, color: "#333", fontSize: 15 }}>
          {topReferrers.map((r, idx) => (
            <li key={r.name} style={{ marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: idx === 0 ? "#faad14" : "#1890ff" }}>{r.name}</span> — {r.referrals} referrals
            </li>
          ))}
        </ol>
      </div>

      {/* Referral Link & Input Section */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: 20, marginBottom: 18, border: "1px solid #e0e0e0" }}>
        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Your Referral Link</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            value={window.location.origin + "/referral?code=" + referralCode}
            readOnly
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #b0b0b0",
              fontSize: 15,
              background: copied ? "#e6f7ff" : "#f5f8fa",
              color: "#333",
              outline: "none"
            }}
            onFocus={e => e.target.select()}
          />
          <button
            style={{
              background: copied ? "#2db7f5" : "#1890ff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "7px 14px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <span role="img" aria-label="success">✅</span> : <span role="img" aria-label="copy">📋</span>}
            <span style={{ marginLeft: 6 }}>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        {copied && <div style={{ color: "#2db7f5", fontSize: 13, marginTop: 4 }}>Link copied to clipboard!</div>}
      </div>

      {/* Referral Input Card */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 20, border: "1px solid #e0e0e0" }}>
        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>Were you referred by someone?</div>
        {alreadyReferred ? (
          <div style={{ color: "#388e3c", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
            <span role="img" aria-label="success">🎉</span> You have already used a referral code.
          </div>
        ) : (
          <form onSubmit={handleReferralSubmit} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              placeholder="Enter referral code"
              value={referralInput}
              onChange={e => setReferralInput(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #b0b0b0",
                fontSize: 15,
                width: 180,
              }}
            />
            <button
              type="submit"
              style={{
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span role="img" aria-label="gift">🎁</span>
              <span style={{ marginLeft: 6 }}>Submit</span>
            </button>
          </form>
        )}
        {error && <div style={{ color: "#d32f2f", marginTop: 10, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}><span role="img" aria-label="error">❌</span>{error}</div>}
        {success && <div style={{ color: "#388e3c", marginTop: 10, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}><span role="img" aria-label="success">✅</span>{success}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, marginBottom: 24 }}>
        <button className="close-bottom-btn spin-style" onClick={() => navigate("/")}>Close</button>
      </div>
    </div>
  );
}

export default Referral; 