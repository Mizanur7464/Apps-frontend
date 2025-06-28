import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// Add: get or set unique userId in localStorage
function getOrCreateUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "user-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    localStorage.setItem("userId", userId);
  }
  return userId;
}

// Add bot username for Telegram deep link
const botUsername = "GobaFriendsBot"; // without @

function Referral() {
  const navigate = useNavigate();
  const [userId] = useState(getOrCreateUserId());
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralData, setReferralDataState] = useState(getReferralData());
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [topReferrers, setTopReferrers] = useState([]);
  const [loadingReferrers, setLoadingReferrers] = useState(true);
  const [referrerError, setReferrerError] = useState("");
  const [referralVoucherOptions] = useState([
    { value: '20% Discount', description: 'Enjoy 20% off your next purchase.' },
    { value: 'Free Drink', description: 'Get a free drink of your choice.' },
    { value: 'Free Topping', description: 'Enjoy a free topping with your drink.' },
    { value: 'Free Up-size', description: 'Get a free up-size on your drink.' },
  ]);
  const [referralRewards, setReferralRewards] = useState([]);

  // Check if user has already entered a referral code
  const alreadyReferred = !!referralData.referredBy;

  // Handle referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");
    if (codeFromUrl && !alreadyReferred && codeFromUrl !== userId) {
      // Auto-fill and submit referral code if not self
      const newData = { ...getReferralData(), referredBy: codeFromUrl };
      setReferralData(newData);
      setReferralDataState(newData);
    }
    setReferralDataState(getReferralData());
  }, [userId, alreadyReferred]);

  // Fetch top referrers from backend
  useEffect(() => {
    setLoadingReferrers(true);
    const apiUrl = process.env.REACT_APP_API_URL || "";
    fetch(apiUrl + "/api/top-referrers")
      .then(res => res.json())
      .then(data => {
        setTopReferrers(data);
        setLoadingReferrers(false);
      })
      .catch(err => {
        setReferrerError("Top referrers লোড করা যাচ্ছে না");
        setLoadingReferrers(false);
      });
  }, []);

  // Fetch referral rewards from backend
  useEffect(() => {
    fetch('/api/admin/referral-reward')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setReferralRewards(data.filter(item => item.status === 'active'));
        }
      });
  }, []);

  // Generate Telegram deep link
  const telegramLink = `https://t.me/${botUsername}?start=${userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramLink);
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
    if (referralInput === userId) {
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
    // Give both users a random voucher (simulate)
    const randomVoucher = referralVoucherOptions[Math.floor(Math.random() * referralVoucherOptions.length)];
    saveGrabbedVoucher({
      id: "referral-" + Date.now(),
      value: randomVoucher.value,
      description: randomVoucher.description,
      prize: randomVoucher.value,
      status: 'Pending',
    });
    setSuccess(`Referral successful! You have received a voucher: ${randomVoucher.value}`);
    setReferralInput("");
    // Simulate updating the referrer's count (in real app, backend would handle this)
    let allReferralStats = JSON.parse(localStorage.getItem("allReferralStats") || "{}")
    if (!allReferralStats[referralInput]) allReferralStats[referralInput] = [];
    allReferralStats[referralInput].push(userId);
    localStorage.setItem("allReferralStats", JSON.stringify(allReferralStats));
  };

  // Get number of successful referrals for this user
  let allReferralStats = JSON.parse(localStorage.getItem("allReferralStats") || "{}")
  const myReferrals = allReferralStats[userId] || [];
  const myVouchers = getGrabbedVouchers().filter(v => v.id && v.id.toString().startsWith("referral-"));

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "20px 0", position: "relative" }}>
      {/* Show referral rewards at the very top, styled as a professional card */}
      {referralRewards.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(24,144,255,0.10)',
          marginBottom: 24,
          padding: 0,
          overflow: 'hidden',
          border: '1.5px solid #e0e0e0',
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #1890ff 60%, #2db7f5 100%)',
            color: '#fff',
            padding: '16px 20px 10px 20px',
            fontWeight: 700,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          }}>
            <span role="img" aria-label="gift" style={{ fontSize: 24 }}>🎁</span>
            Referral Rewards
          </div>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: '16px 20px',
            background: '#f8fbff',
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}>
            {referralRewards.map(rw => (
              <li key={rw.id} style={{
                fontSize: 15,
                marginBottom: 8,
                color: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span role="img" aria-label="star" style={{ fontSize: 18 }}>⭐</span>
                <span>{rw.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* New Claim Referral Card (matches provided image) */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #e0e0e0",
        borderRadius: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 28,
        marginBottom: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>🤝</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#1890ff", marginBottom: 6, textAlign: "center" }}>
          Claim Your Referral Reward
        </div>
        <div style={{ color: "#555", fontSize: 15, marginBottom: 18, textAlign: "center" }}>
          If you are not a Goba! member, you must become a member to get a referral voucher.<br />
          Click the link below.
        </div>
        <form onSubmit={handleReferralSubmit} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
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
            disabled={alreadyReferred}
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
              cursor: alreadyReferred ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center"
            }}
            disabled={alreadyReferred}
          >
            <span role="img" aria-label="gift">🎁</span>
            <span style={{ marginLeft: 6 }}>Submit</span>
          </button>
        </form>
        {alreadyReferred && (
          <div style={{ color: "#388e3c", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span role="img" aria-label="success">🎉</span> You have already used a referral code.
          </div>
        )}
        {error && <div style={{ color: "#d32f2f", marginTop: 2, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}><span role="img" aria-label="error">❌</span>{error}</div>}
        {success && <div style={{ color: "#388e3c", marginTop: 2, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}><span role="img" aria-label="success">✅</span>{success}</div>}
        <a
          href="https://members.mintycrm.com/goba/sign-in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            background: '#1890ff',
            color: '#fff',
            borderRadius: 8,
            padding: '14px 0',
            fontWeight: 700,
            fontSize: 18,
            textDecoration: 'none',
            marginTop: 18,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(24,144,255,0.08)'
          }}
        >
          Join Goba! Membership Now
        </a>
      </div>
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
      </div>

      {/* Top Referrers Section */}
      <div style={{ background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 18, marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#222", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="trophy">🏆</span> Top Referrers
        </div>
        {loadingReferrers ? (
          <div style={{ color: '#888', fontSize: 15 }}>Loading...</div>
        ) : referrerError ? (
          <div style={{ color: '#d32f2f', fontSize: 15 }}>{referrerError}</div>
        ) : topReferrers.length === 0 ? (
          <div style={{ color: '#b0b0b0', fontSize: 15 }}>No referrers yet.</div>
        ) : (
          <ol style={{ margin: 0, paddingLeft: 20, color: "#333", fontSize: 15 }}>
            {topReferrers.map((r, idx) => (
              <li key={r.referrer} style={{ marginBottom: 2 }}>
                <span style={{ fontWeight: 600, color: idx === 0 ? "#faad14" : "#1890ff" }}>{r.referrer}</span> — {r.referrals} referral{r.referrals > 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Referral Link & Input Section */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: 20, marginBottom: 18, border: "1px solid #e0e0e0" }}>
        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Your Referral Link</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            value={telegramLink}
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

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, marginBottom: 24 }}>
        <button className="close-bottom-btn spin-style" onClick={() => navigate("/")}>Close</button>
      </div>
    </div>
  );
}

export default Referral; 