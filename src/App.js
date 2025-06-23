import React from "react";

const cardData = [
  {
    title: "Grab Voucher",
    desc: "Get your free voucher now!",
  },
  {
    title: "Spin & Win",
    desc: "Try your luck and win vouchers!",
  },
  {
    title: "Referrals",
    desc: "Invite friends and earn rewards!",
  },
  {
    title: "My Vouchers",
    desc: "View and manage your vouchers",
  },
];

const cardColors = [
  "#2db7f5",
  "#1890ff",
  "#1890ff",
  "#1890ff"
];

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8fa",
        padding: "30px 0",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Welcome, Mizan!</h2>
        {cardData.map((card, idx) => (
          <div
            key={card.title}
            style={{
              background: cardColors[idx],
              color: "#fff",
              borderRadius: 12,
              padding: "24px 20px",
              marginBottom: 18,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              cursor: "pointer",
              transition: "transform 0.1s",
              fontWeight: 500,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 16, fontWeight: 400 }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
