import mastercardlogo from "../assets/mastercard.png";
import visalogo from "../assets/visa.png";
import "./payment.css"
import { Input } from "antd";
import { Button } from "antd";
import { useState } from "react";



export function CreditCardUI() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    // Group digits into chunks of 4 separated by spaces
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");

    // Limit to max 4 digits (MMYY)
    if (digits.length === 0) return "";
    if (digits.length < 3) return digits;
    return digits.substring(0, 2) + "/" + digits.substring(2, 4);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format the input value
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

   const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, max 3 or 4 depending on card type (here max 4)
    const digits = e.target.value.replace(/\D/g, "");
    setCvv(digits.substring(0, 4));
  };

  return (
    
    <div className="payment-container">
      <h2>Credit Card Payment</h2>
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <img src={mastercardlogo} alt="Mastercard" className="payment-icon" />
        <img src={visalogo} alt="Visa" className="payment-icon" />
      </div>

     <div style={{ marginBottom: "12px" }}>
        <Input
        placeholder="Card Number"
        value={cardNumber}
        onChange={handleChaange}
        maxLength={19} // 16 digits + 3 spaces
        inputMode="numeric"
        autoComplete="cc-number"
      />
      </div>

      <div>
        <p>Enter card holder name</p>
        <Input placeholder="Card Holder Name" />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: "12px" }}>
  <div style={{ width: "50%" }}>
    <p>Expiration date (MM/YY):</p>
    <Input
      placeholder="MM/YY"
      value={expiry}
      onChange={handleExpiryChange}
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
      onChange={handleCvvChange}
      maxLength={4}
      inputMode="numeric"
      autoComplete="cc-csc"
    />
  </div>

  
</div>

<div style={{
  marginTop: 24,
  display: "flex",
  justifyContent: "left",  
  padding: "10px 1px",
  
  borderRadius: 8,
  
}}>
  <Button style={{
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 25px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
    transition: "background-color 0.3s ease"
  }}
  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0056b3"}
  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#007bff"}>
    Pay
  </Button>
</div>
    </div>
  );
}

export function OtherUI() {
  return (
    <div>
      <h2>Other Payment Methods</h2>
      <p>Please contact support for other payment options.</p>
    </div>
  );
}

export function PaypalUI() {
  return (
    <div>
      <h2>Paypal Payment</h2>
      {/* Paypal-specific UI */}
      <p>Log in to your Paypal account to pay.</p>
    </div>
  );
}

export function PromptpayUI() {
  return (
    <div>
      <h2>Promptpay Payment</h2>
      {/* Promptpay instructions or form */}
      <p>Scan the QR code or enter your Promptpay ID.</p>
    </div>
  );
}
