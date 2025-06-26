import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getGrabbedVouchers() {
  const data = localStorage.getItem("grabbedVouchers");
  return data ? JSON.parse(data) : [];
}

function saveGrabbedVoucher(voucher) {
  const current = getGrabbedVouchers();
  localStorage.setItem("grabbedVouchers", JSON.stringify([...current, voucher]));
}

// Helper to get all unclaimed spin prizes
function getSpinPrizes() {
  const data = localStorage.getItem("spinPrizes");
  return data ? JSON.parse(data) : [];
}

function addSpinPrize(prize) {
  const current = getSpinPrizes();
  localStorage.setItem("spinPrizes", JSON.stringify([...current, prize]));
}

function removeSpinPrize(prize) {
  const current = getSpinPrizes();
  const idx = current.indexOf(prize);
  if (idx !== -1) {
    current.splice(idx, 1);
    localStorage.setItem("spinPrizes", JSON.stringify(current));
  }
}

// Helper to get claimed voucher keys
function getClaimedVoucherKeys() {
  const data = localStorage.getItem("claimedVouchers");
  return data ? JSON.parse(data) : [];
}

function addClaimedVoucherKey(key) {
  const current = getClaimedVoucherKeys();
  if (!current.includes(key)) {
    localStorage.setItem("claimedVouchers", JSON.stringify([...current, key]));
  }
}

function GrabVoucher() {
  const [grabbed, setGrabbed] = useState(getGrabbedVouchers());
  const [spinPrizes, setSpinPrizes] = useState(getSpinPrizes());
  const [showModal, setShowModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPoster, setShowPoster] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null); // {type: 'campaign'|'spin', value: ...}
  const [claimedKeys, setClaimedKeys] = useState(getClaimedVoucherKeys());
  const [campaignClaims, setCampaignClaims] = useState({});
  const navigate = useNavigate();

  // Fetch active campaigns
  useEffect(() => {
    fetch('/api/admin/voucher-campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data.filter(c => c.status === 'active'));
      });
  }, []);

  // Fetch campaign claims on mount
  useEffect(() => {
    if (campaigns.length > 0) {
      Promise.all(campaigns.map(c =>
        fetch(`/api/vouchers/count?campaignId=${c.id}`).then(res => res.json())
      )).then(results => {
        const claims = {};
        campaigns.forEach((c, i) => {
          claims[c.id] = results[i].count;
        });
        setCampaignClaims(claims);
      });
    }
  }, [campaigns]);

  // Listen for spinPrize in localStorage (from spin wheel)
  useEffect(() => {
    // If a new spinPrize is set (old logic), add it to spinPrizes array and clear old key
    const singleSpinPrize = localStorage.getItem('spinPrize');
    if (singleSpinPrize) {
      addSpinPrize(singleSpinPrize);
      setSpinPrizes(getSpinPrizes());
      localStorage.removeItem('spinPrize');
    }
    // Listen for storage changes (if user spins in another tab)
    const onStorage = () => setSpinPrizes(getSpinPrizes());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleGrabVoucher = (voucherObj) => {
    setSelectedVoucher(voucherObj);
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
    let userName = localStorage.getItem('userName');
    if (!userName) {
      userName = prompt('Enter your name (or phone/email):');
      if (!userName) {
        setError('You must enter your name to grab a voucher.');
        return;
      }
      localStorage.setItem('userName', userName);
    }
    // If campaign selected
    if (selectedVoucher && selectedVoucher.type === 'campaign') {
      const campaign = selectedVoucher.value;
      const voucher = {
        id: Date.now(),
        username: userName,
        value: campaign.content,
        description: 'Campaign Voucher',
        prize: campaign.content,
        status: 'Pending',
      };
      fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucher)
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save voucher to server');
          return res.json();
        })
        .then(data => {
          saveGrabbedVoucher(voucher);
          setGrabbed(getGrabbedVouchers());
          setSuccess("Campaign voucher successfully grabbed!");
          setShowModal(false);
          setSelectedVoucher(null);
          setError("");
          addClaimedVoucherKey('campaign-' + campaign.id);
          setClaimedKeys(getClaimedVoucherKeys());
        })
        .catch(err => {
          setError("Failed to save voucher. Please try again.");
        });
      return;
    }
    // If spin prize selected
    if (selectedVoucher && selectedVoucher.type === 'spin') {
      const spinPrize = selectedVoucher.value;
      const voucherWithPrize = {
        id: Date.now(),
        username: userName,
        value: spinPrize,
        description: 'Won from Spin',
        prize: spinPrize,
        status: 'Pending',
      };
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
          saveGrabbedVoucher(voucherWithPrize);
          setGrabbed(getGrabbedVouchers());
          setSuccess("Voucher successfully grabbed!");
          setShowModal(false);
          setError("");
          removeSpinPrize(spinPrize);
          setSpinPrizes(getSpinPrizes());
          setSelectedVoucher(null);
          addClaimedVoucherKey('spin-' + spinPrize);
          setClaimedKeys(getClaimedVoucherKeys());
        })
        .catch(err => {
          setError("Failed to save voucher. Please try again.");
        });
      return;
    }
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
      {/* Show campaign vouchers as cards */}
      {campaigns.map(campaign => {
        const claimed = claimedKeys.includes('campaign-' + campaign.id);
        const claimedCount = campaignClaims[campaign.id] || 0;
        const outOfStock = claimedCount >= campaign.quantity;
        return (
          <div key={"campaign-"+campaign.id} style={{
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>{campaign.content}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Available: {Math.max(0, campaign.quantity - claimedCount)} left</div>
            <button
              style={{
                background: outOfStock || claimed ? '#b0b0b0' : '#2db7f5',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 0',
                fontWeight: 600,
                fontSize: 14,
                cursor: outOfStock || claimed ? 'not-allowed' : 'pointer',
                width: '100%',
                opacity: outOfStock || claimed ? 0.7 : 1,
              }}
              onClick={() => !outOfStock && !claimed && handleGrabVoucher({ type: 'campaign', value: campaign })}
              disabled={outOfStock || claimed}
            >
              {outOfStock ? 'Out of Stock' : claimed ? 'Claimed' : 'Grab Now'}
            </button>
          </div>
        );
      })}
      {/* Show all unclaimed spin prizes as cards */}
      {spinPrizes.map((prize, idx) => {
        const claimed = claimedKeys.includes('spin-' + prize);
        return (
          <div key={"spin-"+idx+"-"+prize} style={{
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>{prize}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>You can grab this spin voucher.</div>
            <button
              style={{
                background: claimed ? '#b0b0b0' : '#2db7f5',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 0',
                fontWeight: 600,
                fontSize: 14,
                cursor: claimed ? 'not-allowed' : 'pointer',
                width: '100%',
                opacity: claimed ? 0.7 : 1,
              }}
              onClick={() => !claimed && handleGrabVoucher({ type: 'spin', value: prize })}
              disabled={claimed}
            >
              {claimed ? 'Claimed' : 'Grab Now'}
            </button>
          </div>
        );
      })}
      {/* If no campaigns and no spin prizes, show message */}
      {campaigns.length === 0 && spinPrizes.length === 0 && (
        <div style={{ color: "#b0b0b0", fontSize: 15 }}>No vouchers available to grab right now.</div>
      )}
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