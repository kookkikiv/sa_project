// StepBox.tsx
import React from "react";

const steps = ["Select Payment", "Check payment status", "Complete Payment"];

interface StepBoxProps {
  currentStep: number;
}

const StepBox: React.FC<StepBoxProps> = ({ currentStep }) => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", fontFamily: "Arial, sans-serif", fontSize: 14 }}>
    {steps.map((label, idx) => {
      const stepNum = idx + 1;
      const isActive = stepNum === currentStep;
      const isCompleted = stepNum < currentStep;

      return (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
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
            }}
          >
            {stepNum}
          </div>
          <span
            style={{
              marginLeft: 8,
              color: isActive || isCompleted ? "#000" : "#777",
              fontWeight: isActive ? "bold" : "normal",
              userSelect: "none",
            }}
          >
            {label}
          </span>
          {stepNum < steps.length && (
            <div
              style={{
                width: 20,
                height: 2,
                backgroundColor: isCompleted ? "#28a745" : "#ccc",
                marginLeft: 12,
                marginRight: 12,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default StepBox;
