import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Card, Typography } from "antd";
import { motion } from "framer-motion";
import paymentlogo from "../assets/paymentlogo.png";
import mastercardlogo from "../assets/mastercard.png";
import visalogo from "../assets/visa.png";
import StepBox from "./stepbox"; // <-- import your StepBox

const { Title } = Typography;
const PAYMENT_METHODS = ["Credit card", "Promptpay", "Paypal", "Other"];

// Payment UIs
function CreditCardUI() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length < 3) return digits;
    return digits.substring(0, 2) + "/" + digits.substring(2, 4);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2>Credit Card Payment</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <img src={mastercardlogo} alt="Mastercard" style={{ width: 50 }} />
        <img src={visalogo} alt="Visa" style={{ width: 50 }} />
      </div>
      <p>Enter card number</p>
      <Input
        placeholder="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        maxLength={19}
        inputMode="numeric"
        autoComplete="cc-number"
        style={{ marginBottom: 12 }}
      />
      <p>Enter card holder name</p>
      <Input placeholder="Card Holder Name" />
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <div style={{ width: "50%" }}>
          <p>Expiration date (MM/YY):</p>
          <Input
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </div>
        <div style={{ width: "50%" }}>
          <p>CVV:</p>
          <Input
            placeholder="CVV"
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))
            }
            maxLength={4}
            inputMode="numeric"
            autoComplete="cc-csc"
          />
        </div>
      </div>
      <Button
        type="primary"
        style={{
          marginTop: 20,
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: "0 6px 18px rgba(24,144,255,0.3)",
        }}
      >
        Pay
      </Button>
    </div>
  );
}

function PaypalUI() {
  return <p>Paypal Payment UI</p>;
}

function PromptpayUI() {
  return <p>Promptpay Payment UI</p>;
}

function OtherUI() {
  return <p>Other Payment UI</p>;
}

// Main Payments Component
function Payments() {
  const [activeMethod, setActiveMethod] = useState(PAYMENT_METHODS[0]);
  const [currentStep, setCurrentStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeButton = Array.from(containerRef.current.children).find(
      (el) => el.textContent === activeMethod
    ) as HTMLElement | undefined;
    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeButton.getBoundingClientRect();
      setUnderlineStyle({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }
  }, [activeMethod]);

  const renderActiveUI = () => {
    switch (activeMethod) {
      case "Credit card":
        return <CreditCardUI />;
      case "Promptpay":
        return <PromptpayUI />;
      case "Paypal":
        return <PaypalUI />;
      case "Other":
        return <OtherUI />;
      default:
        return null;
    }
  };

  const renderFixedBox = () => (
    <Card
      style={{
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <Title level={4}>Payment Details</Title>
      <p>Payment Time: 07 August 2025, 11:15 AM</p>
      <p>Payment ID: #PAY-3921-TH</p>
      <p>Amount: ฿2,750.00</p>
      <p>Discount: ฿0.00</p>
      <hr />
      <p>
        <strong>Total: ฿2,750.00</strong>
      </p>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: 24 }}
    >
      <motion.div
        whileHover={{ scale: 1.01, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
        style={{
          backgroundColor: "#fff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header with StepBox on the right */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    marginBottom: 32,
  }}
>
  {/* Logo + Title on the left */}
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <img src={paymentlogo} alt="Payment" style={{ width: 68 }} />
    <Title level={3} style={{ margin: 0 }}>
      SELECT PAYMENT METHOD
    </Title>
  </div>

  {/* StepBox on the right */}
  <StepBox currentStep={currentStep} />
</div>

{/* Payment Method Tabs below header */}
<div
  ref={containerRef}
  style={{
    display: "flex",
    gap: 16,
    position: "relative",
    marginBottom: 24,
  }}
>
  {PAYMENT_METHODS.map((method) => (
    <Button
      key={method}
      type="text"
      style={{
        fontWeight: activeMethod === method ? "bold" : "normal",
        color: activeMethod === method ? "#000" : "#555",
      }}
      onClick={() => setActiveMethod(method)}
    >
      {method}
    </Button>
  ))}

  {/* Underline */}
  <div
    style={{
      position: "absolute",
      bottom: -4,
      left: underlineStyle.left,
      width: underlineStyle.width,
      height: 3,
      backgroundColor: "#52c41a",
      borderRadius: 3,
      transition: "left 0.3s, width 0.3s",
    }}
  />
</div>

        {/* Payment UI + Fixed Box */}
        <div style={{ display: "flex", gap: 24 }}>
          <Card
            style={{
              flex: 1,
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            {renderActiveUI()}
            <Button
              type="default"
              style={{ marginTop: 24 }}
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
            >
              Next Step
            </Button>
          </Card>

          <div style={{ flex: 1 }}>{renderFixedBox()}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Payments;
