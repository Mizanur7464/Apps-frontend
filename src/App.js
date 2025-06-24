import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import GrabVoucher from "./pages/GrabVoucher";
import MyVouchers from "./pages/MyVouchers";
import Referral from "./pages/Referral";

const cardData = [
  {
    title: "Grab Voucher",
    desc: "Get your free voucher now!",
    route: "/grab"
  },
  {
    title: "Spin & Win",
    desc: "Try your luck and win vouchers!",
    // route: "/spin" // keep for future
  },
  {
    title: "Referrals",
    desc: "Invite friends and earn rewards!",
    route: "/referral"
  },
  {
    title: "My Vouchers",
    desc: "View and manage your vouchers",
    route: "/my-vouchers"
  },
];

const cardColors = [
  "#2db7f5",
  "#1890ff",
  "#1890ff",
  "#1890ff"
];

// ১০টা সেগমেন্টের ডাটা
const wheelData = [
  { option: "20% Off\nYour Total Bill" },
  { option: "5% Cashback\non Your Bill" },
  { option: "Free Topping\nof Your Choice" },
  { option: "50% Bill Rebate\nLimited Time!" },
  { option: "Claim Any\nTopping Free" },
  { option: "10% Discount\nExclusive Coupon" },
  { option: "Complimentary\nJin Xuan Tea" },
  { option: "10% Off\nSpecial Coupon" },
  { option: "Free Topping\nTreat Yourself!" },
  { option: "5% Instant\nBill Rebate" },
];

const backgroundColors = [
  "#f7931e", // Orange
  "#ffb84d", // Yellow-Orange
  "#ffe066", // Yellow
  "#fff799", // Light Yellow
  "#d9f99d", // Light Green
  "#a7e9f9", // Light Blue
  "#5dade2", // Blue
  "#b39ddb", // Purple
  "#f8bbd0", // Pink
  "#f06292", // Red-Pink
];

function HomeCards() {
  const navigate = useNavigate();
  const [showWheel, setShowWheel] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [prize, setPrize] = useState(null);

  // Responsive wheel size for mobile (smaller)
  const wheelSize = typeof window !== 'undefined' ? Math.min(window.innerWidth, 240) - 32 : 120;

  const handleSpinClick = () => {
    // Calculate which segment the pointer will land on based on rotation
    const segments = wheelData.length;
    const segmentAngle = 360 / segments;
    const newPrizeNumber = Math.floor(Math.random() * segments);
    
    // Since pointer is at bottom, we need to adjust the calculation
    // The segment at the bottom (6 o'clock position) should be the result
    const adjustedPrizeNumber = (segments - newPrizeNumber) % segments;
    
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setPrize(null);
  };

  const handleCloseWheel = () => {
    setShowWheel(false);
    setPrize(null);
  };

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "20px 0" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 20, padding: "0 12px", fontSize: 20 }}>
        Welcome!
      </h2>
      {cardData.map((card, idx) => (
        <div
          key={card.title}
          style={{
            background: cardColors[idx],
            color: "#fff",
            borderRadius: 12,
            padding: "14px 12px",
            margin: "0 8px 14px 8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            cursor: card.route ? "pointer" : "default",
            fontWeight: 500,
            transition: "transform 0.1s",
            width: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            opacity: card.route ? 1 : 0.7,
          }}
          onClick={() => {
            if (card.route) navigate(card.route);
            if (card.title === "Spin & Win") setShowWheel(true);
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
            {card.title}
          </div>
          <div style={{ fontSize: 14, fontWeight: 400 }}>{card.desc}</div>
        </div>
      ))}

      {/* Wheel Modal */}
      {showWheel && (
        <div
          style={{
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
          onClick={handleCloseWheel}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              minWidth: 280,
              maxWidth: 480,
              width: "96vw",
              minHeight: 520,
              height: "96vh",
              boxSizing: "border-box",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              position: "relative",
              overflow: "visible",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 style={{ marginBottom: 12, textAlign: "center", fontSize: 16 }}>
                Spin the Wheel!
              </h3>
              <div style={{ margin: "0 auto" }}>
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  backgroundColors={backgroundColors}
                  textColors={["#333"]}
                  fontSize={12}
                  width={40}
                  height={40}
                  outerBorderWidth={0}
                  innerBorderWidth={0}
                  segmentBorderWidth={0}
                  outerBorderColor="#eee"
                  innerBorderColor="#eee"
                  segmentBorderColor="#eee"
                  pointerLocation="bottom"
                  pointerProps={{
                    style: {
                      top: '95%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '15px solid transparent',
                      borderRight: '15px solid transparent',
                      borderBottom: '50px solid #1890ff',
                      backgroundColor: 'transparent',
                    }
                  }}
                  spinDuration={0.9}
                  spins={300}
                  onStopSpinning={() => {
                    setMustSpin(false);
                    const segments = wheelData.length;
                    const winningSegment = (prizeNumber + Math.ceil(segments / 2)) % segments;
                    setPrize(wheelData[winningSegment].option);
                  }}
                />
              </div>
              {prize && (
                <div
                  style={{
                    marginTop: 55,
                    marginBottom: 4,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#1890ff",
                  }}
                >
                  You won: <span>{prize}</span>
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: 55 }}>
                <button
                  style={{
                    padding: "10px 20px",
                    background: "#1890ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={handleSpinClick}
                  disabled={mustSpin}
                >
                  {mustSpin ? "Spinning..." : "Spin Now"}
                </button>
              </div>
            </div>
            <button
              style={{
                width: "100%",
                padding: "8px 0",
                background: "#f5f8fa",
                color: "#1890ff",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
              onClick={handleCloseWheel}
              disabled={mustSpin}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [showWheel, setShowWheel] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [prize, setPrize] = useState(null);

  const handleSpinClick = () => {
    // Calculate which segment the pointer will land on based on rotation
    const segments = wheelData.length;
    const segmentAngle = 360 / segments;
    const newPrizeNumber = Math.floor(Math.random() * segments);
    
    // Since pointer is at bottom, we need to adjust the calculation
    // The segment at the bottom (6 o'clock position) should be the result
    const adjustedPrizeNumber = (segments - newPrizeNumber) % segments;
    
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setPrize(null);
  };

  const handleCloseWheel = () => {
    setShowWheel(false);
    setPrize(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/grab" element={<GrabVoucher />} />
        <Route path="/my-vouchers" element={<MyVouchers />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/" element={<HomeCards />} />
      </Routes>
    </Router>
  );
}

export default App;
