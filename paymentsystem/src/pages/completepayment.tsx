import React from "react";
import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import StepBox from "./stepbox";
import paymentlogo from "../assets/paymentlogo.png";
import { useNavigate } from "react-router-dom";

function CompletePayment() {
  const currentStep = 3; // Step 3: Complete Payment
  const navigate = useNavigate();

  const renderCompleteBox = () => (
    <div
      style={{
        borderRadius: 8,
        padding: 24,
        fontFamily: "Arial, sans-serif",
        fontSize: 14,
        color: "#000",
        lineHeight: 1.8,
        width: "100%",
        height: 503,
        boxSizing: "border-box",
        border: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
      <h2>Payment Successful!</h2>
      <p>Your payment has been completed successfully.</p>
      <Button
        type="primary"
        style={{
          borderRadius: 12,
          fontWeight: 600,
          padding: "10px 24px",
          boxShadow: "0 6px 18px rgba(24,144,255,0.4)",
        }}
        onClick={() => navigate("/home")} // Navigate to homepage
      >
        Back to Home
      </Button>
    </div>
  );

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={paymentlogo} alt="Payment Method Icon" style={{ width: 68 }} />
          <h1 style={{ margin: 0 }}>COMPLETE PAYMENT</h1>
        </div>
        <StepBox currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ flex: 1, maxWidth: 600 }}>{renderCompleteBox()}</div>
      </div>
    </div>
  );
}

export default CompletePayment;
