import React, { useEffect, useState } from "react";

const apiUrl = process.env.REACT_APP_API_URL || "";

function AdminDashboard() {
  const [vouchers, setVouchers] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // New states for voucher campaigns
  const [voucherCampaigns, setVoucherCampaigns] = useState([]);
  const [spinConfigs, setSpinConfigs] = useState([]);
  const [referralRewards, setReferralRewards] = useState([]);

  // New states for voucher form
  const [voucherForm, setVoucherForm] = useState({ content: '', quantity: 1, status: 'active' });
  const [spinForm, setSpinForm] = useState([{ prize_label: '', win_chance: 0 }]);
  const [referralForm, setReferralForm] = useState({ content: '', status: 'active' });

  // Referral Admin Features
  const [referrals, setReferrals] = useState([]);

  // New state for active spin config
  const [activeSpinConfigId, setActiveSpinConfigId] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/admin/vouchers`)
      .then(res => res.json())
      .then(data => setVouchers(data));
    fetch(`${apiUrl}/api/admin/voucher-campaigns`).then(r => r.json()).then(setVoucherCampaigns);
    fetch(`${apiUrl}/api/admin/spin-wheel`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setSpinConfigs(data);
      } else if (data && Array.isArray(data.prizes)) {
        setSpinConfigs(data.prizes);
      } else {
        setSpinConfigs([]);
      }
    });
    fetch(`${apiUrl}/api/admin/referrals`).then(r => r.json()).then(setReferrals);
    fetch(`${apiUrl}/api/admin/referral-reward`).then(r => r.json()).then(setReferralRewards);
    fetch(`${apiUrl}/api/spin-wheel/active`).then(r => r.json()).then(data => {
      if (data && data.activeSpinConfigId) {
        setActiveSpinConfigId(data.activeSpinConfigId);
      } else {
        setActiveSpinConfigId(null);
      }
    });
  }, []);

  const handleStatusChange = (id, newStatus) => {
    fetch(`${apiUrl}/api/voucher/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        setVouchers(vouchers =>
          vouchers.map(v => v._id === id ? { ...v, status: newStatus } : v)
        );
      });
  };

  const filtered = vouchers.filter(v =>
    (filter === "" || (v.user && v.user.toLowerCase().includes(filter.toLowerCase()))) &&
    (statusFilter === "" || v.status === statusFilter)
  );

  // Handlers for voucher campaigns
  const handleVoucherSubmit = (e) => {
    e.preventDefault();
    fetch(`${apiUrl}/api/admin/voucher-campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherForm)
    })
      .then(r => r.json())
      .then(() => {
        fetch(`${apiUrl}/api/admin/voucher-campaigns`).then(r => r.json()).then(setVoucherCampaigns);
        setVoucherForm({ content: '', quantity: 1, status: 'active' });
      });
  };

  const handleSpinFormChange = (idx, field, value) => {
    setSpinForm(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addSpinPrize = () => {
    if (spinForm.length < 10) setSpinForm([...spinForm, { prize_label: '', win_chance: 0 }]);
  };
  const removeSpinPrize = (idx) => {
    setSpinForm(spinForm.filter((_, i) => i !== idx));
  };
  const handleSpinSubmit = (e) => {
    e.preventDefault();
    // Ensure each prize has a status field
    const prizesWithStatus = spinForm.map(prize => ({ ...prize, status: prize.status || 'active' }));
    fetch(`${apiUrl}/api/admin/spin-wheel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prizes: prizesWithStatus })
    })
      .then(r => r.json())
      .then(() => {
        fetch(`${apiUrl}/api/admin/spin-wheel`).then(r => r.json()).then(data => {
          if (Array.isArray(data)) {
            setSpinConfigs(data);
          } else if (data && Array.isArray(data.prizes)) {
            setSpinConfigs(data.prizes);
          } else {
            setSpinConfigs([]);
          }
        });
        setSpinForm([{ prize_label: '', win_chance: 0 }]);
      });
  };

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    fetch(`${apiUrl}/api/admin/referral-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referralForm)
    })
      .then(r => r.json())
      .then(() => {
        fetch(`${apiUrl}/api/admin/referral-reward`).then(r => r.json()).then(setReferralRewards);
        setReferralForm({ content: '', status: 'active' });
      });
  };

  // Spin wheel prize status toggle
  const handleSpinStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    fetch(`${apiUrl}/api/admin/spin-wheel/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetch(`${apiUrl}/api/admin/spin-wheel`).then(r => r.json()).then(data => {
          if (Array.isArray(data)) {
            setSpinConfigs(data);
          } else if (data && Array.isArray(data.prizes)) {
            setSpinConfigs(data.prizes);
          } else {
            setSpinConfigs([]);
          }
        });
      });
  };

  // Add this handler for deleting a campaign
  const handleDeleteCampaign = (id) => {
    fetch(`${apiUrl}/api/admin/voucher-campaigns/${id}`, {
      method: 'DELETE',
    })
      .then(r => r.json())
      .then(() => {
        fetch(`${apiUrl}/api/admin/voucher-campaigns`).then(r => r.json()).then(setVoucherCampaigns);
      });
  };

  // Delete referral reward
  const handleDeleteReferralReward = (id) => {
    fetch(`${apiUrl}/api/admin/referral-reward/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => fetch(`${apiUrl}/api/admin/referral-reward`).then(r => r.json()).then(setReferralRewards));
  };

  // Referral count per referrer
  const refCount = {};
  referrals.forEach(r => {
    refCount[r.referrer] = (refCount[r.referrer] || 0) + 1;
  });

  // Add a reload handler
  const handleReload = () => {
    fetch(`${apiUrl}/api/admin/vouchers`)
      .then(res => res.json())
      .then(data => setVouchers(data));
    fetch(`${apiUrl}/api/admin/voucher-campaigns`).then(r => r.json()).then(setVoucherCampaigns);
    fetch(`${apiUrl}/api/admin/spin-wheel`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setSpinConfigs(data);
      } else if (data && Array.isArray(data.prizes)) {
        setSpinConfigs(data.prizes);
      } else {
        setSpinConfigs([]);
      }
    });
    fetch(`${apiUrl}/api/admin/referrals`).then(r => r.json()).then(setReferrals);
    fetch(`${apiUrl}/api/admin/referral-reward`).then(r => r.json()).then(setReferralRewards);
  };

  // Add a reload handler for referrals only
  const handleReloadReferrals = () => {
    fetch(`${apiUrl}/api/admin/referrals`).then(r => r.json()).then(setReferrals);
  };

  // Start Spin Config with confirmation
  const handleStartSpinConfig = () => {
    if (window.confirm("Are you sure you want to start the spin?")) {
      fetch(`${apiUrl}/api/admin/spin-wheel/start`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          alert(data.message || "Spin is now started. Admin rewards are active.");
          // Always reload spin configs from correct response
          fetch(`${apiUrl}/api/admin/spin-wheel`).then(r => r.json()).then(data => {
            if (data && Array.isArray(data.prizes)) {
              setSpinConfigs(data.prizes);
            } else if (Array.isArray(data)) {
              setSpinConfigs(data);
            } else {
              setSpinConfigs([]);
            }
          });
          // --- NEW: Broadcast to all tabs to clear lastSpinConfigVersion ---
          localStorage.removeItem('lastSpinConfigVersion');
          window.dispatchEvent(new Event('storage'));
        })
        .catch(err => {
          alert("Failed to start spin: " + err.message);
        });
    }
  };
  // Stop Spin Config with confirmation
  const handleStopSpinConfig = () => {
    if (window.confirm("Are you sure you want to stop the spin?")) {
      fetch(`${apiUrl}/api/admin/spin-wheel/stop`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          alert(data.message || "Spin is now stopped. Default rewards will be shown.");
          // Always reload spin configs from correct response
          fetch(`${apiUrl}/api/admin/spin-wheel`).then(r => r.json()).then(data => {
            let configs = [];
            if (data && Array.isArray(data.prizes)) {
              configs = data.prizes;
            } else if (Array.isArray(data)) {
              configs = data;
            }
            // Force all to inactive if not already
            if (configs.length && configs.some(sc => sc.status === 'active')) {
              configs = configs.map(sc => ({ ...sc, status: 'inactive' }));
            }
            setSpinConfigs(configs);
          });
        })
        .catch(err => {
          alert("Failed to stop spin: " + err.message);
        });
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 30 }}>
      <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by user"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #b0b0b0", minWidth: 180 }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #b0b0b0" }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Issued">Issued</option>
          <option value="Void">Void</option>
        </select>
        <button
          onClick={handleReload}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            border: 'none',
            background: '#1890ff',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            marginLeft: 8
          }}
        >
          Load
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <thead>
          <tr style={{ background: "#1890ff", color: "#fff" }}>
            <th style={{ padding: 10 }}>User</th>
            <th>Voucher</th>
            <th>Prize</th>
            <th>Status</th>
            <th>Claimed At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: 20 }}>No vouchers found.</td>
            </tr>
          ) : (
            filtered.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{v.username || "N/A"}</td>
                <td>{v.value}</td>
                <td>{v.prize || "-"}</td>
                <td style={{ fontWeight: 600, color: v.status === "Issued" ? "#388e3c" : v.status === "Void" ? "#d32f2f" : "#faad14" }}>
                  {v.status}
                </td>
                <td>{v.claimedAt ? new Date(v.claimedAt).toLocaleString() : "-"}</td>
                <td>
                  {v.status === "Pending" && (
                    <>
                      <button
                        style={{ background: "#388e3c", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", marginRight: 6, cursor: "pointer" }}
                        onClick={() => handleStatusChange(v._id, "Issued")}
                      >Issue</button>
                      <button
                        style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
                        onClick={() => handleStatusChange(v._id, "Void")}
                      >Void</button>
                    </>
                  )}
                  {v.status !== "Pending" && <span style={{ color: "#888" }}>—</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Voucher Campaigns */}
      <section style={{ marginBottom: 40 }}>
        <h2>Voucher Campaigns</h2>
        <form onSubmit={handleVoucherSubmit} style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Voucher Content"
            value={voucherForm.content}
            onChange={e => setVoucherForm({ ...voucherForm, content: e.target.value })}
            required
            style={{ marginRight: 8 }}
          />
          <input
            type="number"
            min={1}
            placeholder="Quantity"
            value={voucherForm.quantity}
            onChange={e => setVoucherForm({ ...voucherForm, quantity: e.target.value })}
            required
            style={{ marginRight: 8, width: 80 }}
          />
          <select
            value={voucherForm.status}
            onChange={e => setVoucherForm({ ...voucherForm, status: e.target.value })}
            style={{ marginRight: 8 }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit">Add Campaign</button>
        </form>
        <table border="1" cellPadding="6" style={{ width: '100%', background: '#fafafa' }}>
          <thead>
            <tr>
              <th>ID</th><th>Content</th><th>Quantity</th><th>Status</th><th>Created</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {voucherCampaigns.map(vc => (
    <tr key={vc._id}>
                <td>{vc._id}</td>
                <td>{vc.content}</td>
                <td>{vc.quantity}</td>
                <td>{vc.status}</td>
                <td>{vc.created_at}</td>
                <td>
                  <button
                    style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                    onClick={() => handleDeleteCampaign(vc._id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Spin Wheel Config */}
      <section style={{ marginBottom: 40 }}>
        <h2>Spin Wheel Config</h2>
        <form onSubmit={handleSpinSubmit} style={{ marginBottom: 16 }}>
          {spinForm.map((prize, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <input
                type="text"
                placeholder={`Prize #${idx + 1}`}
                value={prize.prize_label}
                onChange={e => handleSpinFormChange(idx, 'prize_label', e.target.value)}
                required
                style={{ marginRight: 8 }}
              />
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Win %"
                value={prize.win_chance}
                onChange={e => handleSpinFormChange(idx, 'win_chance', e.target.value)}
                required
                style={{ marginRight: 8, width: 80 }}
              />
              {spinForm.length > 1 && (
                <button type="button" onClick={() => removeSpinPrize(idx)} style={{ marginRight: 8 }}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSpinPrize} disabled={spinForm.length >= 10} style={{ marginRight: 8 }}>+ Add Prize</button>
          <button type="submit">Save Spin Config</button>
        </form>
        {/* Start/Stop buttons side by side, no dropdown */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={handleStartSpinConfig}
            disabled={spinConfigs.length === 0 || spinConfigs.every(sc => sc.status === 'active')}
            style={{ background: '#388e3c', color: '#fff', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}
          >
            Start
          </button>
          <button
            onClick={handleStopSpinConfig}
            disabled={spinConfigs.length === 0 || spinConfigs.every(sc => sc.status !== 'active')}
            style={{ background: '#d32f2f', color: '#fff', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}
          >
            Stop
          </button>
        </div>
        <table border="1" cellPadding="6" style={{ width: '100%', background: '#fafafa' }}>
          <thead>
            <tr>
              <th>ID</th><th>Prize</th><th>Win %</th><th>Campaign</th><th>Status</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {spinConfigs.map(sc => (
              <tr key={sc._id} style={
                sc.status === 'active'
                  ? { background: '#e0ffe0' }
                  : { background: '#ffe0e0' }
              }>
                <td>{sc._id}</td>
                <td>{sc.prize_label}</td>
                <td>{sc.win_chance}</td>
                <td>{sc.campaign_id}</td>
                <td style={{ fontWeight: 600, color: sc.status === 'active' ? '#388e3c' : '#d32f2f' }}>{sc.status || 'active'}</td>
                <td>{sc.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Referral Report/List */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h2 style={{ margin: 0 }}>Referral Report</h2>
        <button
          onClick={handleReloadReferrals}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#1890ff',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            marginLeft: 4
          }}
        >
          Load
        </button>
      </div>
      <table border="1" cellPadding="6" style={{ width: '100%', background: '#fafafa', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Referrer</th><th>Referred</th><th>Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map(r => (
            <tr key={r.id}>
              <td>{r.referrer}</td>
              <td>{r.referred}</td>
              <td>{r.created_at}</td>
              <td>{r.status || 'Success'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Referral Count per Referrer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, marginTop: 16 }}>
        <h3 style={{ margin: 0 }}>Top Referrers</h3>
        <button
          onClick={handleReloadReferrals}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#1890ff',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            marginLeft: 4
          }}
        >
          Load
        </button>
      </div>
      <table border="1" cellPadding="6" style={{ width: '100%', background: '#fafafa', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Referrer</th><th>Referral Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(refCount).map(([ref, count]) => (
            <tr key={ref}>
              <td>{ref}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Referral Reward Configuration */}
      <h2>Referral Rewards</h2>
      <form onSubmit={handleReferralSubmit} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Reward Content"
          value={referralForm.content}
          onChange={e => setReferralForm({ ...referralForm, content: e.target.value })}
          required
          style={{ marginRight: 8 }}
        />
        <select
          value={referralForm.status}
          onChange={e => setReferralForm({ ...referralForm, status: e.target.value })}
          style={{ marginRight: 8 }}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit">Add Reward</button>
      </form>
      <table border="1" cellPadding="6" style={{ width: '100%', background: '#fafafa' }}>
        <thead>
          <tr>
            <th>ID</th><th>Content</th><th>Status</th><th>Created</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {referralRewards.map(rw => (
            <tr key={rw._id}>
              <td>{rw._id}</td>
              <td>{rw.content}</td>
              <td>{rw.status}</td>
              <td>{rw.created_at}</td>
              <td>
                <button
                  style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                  onClick={() => handleDeleteReferralReward(rw._id)}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard; 