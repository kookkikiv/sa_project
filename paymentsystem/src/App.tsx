import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import "./App.css";
import paymentlogo from "./assets/paymentlogo.png";

import {
  CreditCardUI,
  PromptpayUI,
  PaypalUI,
  OtherUI,
} from "./payment/payment";

const PAYMENT_METHODS = ["Credit card", "Promptpay", "Paypal", "Other"];

function App() {
  const [activeMethod, setActiveMethod] = useState(PAYMENT_METHODS[0]);
  const currentStep = 1;

function StepBox({ currentStep }: { currentStep: number }) {
  const steps = ["Select Payment", "Check payment status", "Complete Payment"];

  return (
    <div style={{
      display: "flex",
      gap: 16,
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      alignItems: "center",
    }}>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: isActive ? "#007bff" : isCompleted ? "#28a745" : "#ccc",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              userSelect: "none",
            }}>
              {stepNum}
            </div>
            <span style={{
              marginLeft: 8,
              color: isActive || isCompleted ? "#000" : "#777",
              fontWeight: isActive ? "bold" : "normal",
              userSelect: "none",
            }}>
              {label}
            </span>
            {/* Add arrow except for last step */}
            {stepNum < steps.length && (
              <div style={{
                width: 20,
                height: 2,
                backgroundColor: isCompleted ? "#28a745" : "#ccc",
                marginLeft: 12,
                marginRight: 12,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
  // Store left and width for the underline
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // Ref for the container div holding buttons
  const containerRef = useRef<HTMLDivElement>(null);

  // Update underline position when activeMethod changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Find the active button element inside container
    const activeButton = Array.from(containerRef.current.children).find(
      (el) => el.textContent === activeMethod
    ) as HTMLElement | undefined;

    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeButton.getBoundingClientRect();

      setUnderlineStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeMethod]);

   function renderActiveUI() {
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
  }

function renderFixedBox() {
  return (
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
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* Payment Time */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span><strong>Payment Time:</strong></span>
          <span>07 August 2025, 11:15 AM</span>
        </div>

        {/* Payment ID */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span><strong>Payment ID:</strong></span>
          <span>#PAY-3921-TH</span>
        </div>

        <hr style={{ borderColor: "#ccc", margin: "20px 0" }} />

        {/* Amount */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span><strong>Amount:</strong></span>
          <span>฿2,750.00</span>
        </div>

        {/* Discount */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span><strong>Discount:</strong></span>
          <span>฿0.00</span>
        </div>
      </div>

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><strong>Total:</strong></span>
        <span style={{ fontSize: 18, fontWeight: "bold" }}>฿2,750.00</span>
      </div>
    </div>
  );
}



  return (
    <div className="payment-container">
      <div
  className="payment-header"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
  }}
>
  {/* Left side: logo + title */}
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <img src={paymentlogo} alt="Payment Method Icon" className="payment-icon" />
    <h1 style={{ margin: 0 }}>SELECT PAYMENT METHOD</h1>
  </div>

  {/* Right side: Step box */}
  <StepBox currentStep={1} />
</div>

      <div className="payment-methods" ref={containerRef}>
        {PAYMENT_METHODS.map((method) => (
          <Button
            key={method}
            className={`payment-button ${activeMethod === method ? "selected" : ""}`}
            onClick={() => setActiveMethod(method)}
          >
            {method}
          </Button>
        ))}

        {/* The sliding underline */}
        <div
          className="payment-underline"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
            position: "absolute",
          }}
        />
      </div>
       <div
  style={{
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    marginTop: "20px",  // <-- space between buttons and boxes
  }}
>
  <div className="payment-ui-container" style={{ flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: 20 }}>
    {renderActiveUI()}
  </div>

  <div style={{ flex: 1 }}>{renderFixedBox()}</div>
</div>
    </div>
  );
}

export default App;
