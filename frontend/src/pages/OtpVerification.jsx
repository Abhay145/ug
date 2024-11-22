import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

emailjs.init("u8QLKD8IPFnergZTP"); // Replace with your public key

export default function OtpVerification() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const sendOTP = () => {
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate OTP
    setGeneratedOtp(otpCode);

    const params = {
      email,
      message: otpCode.toString(),
    };

    emailjs
      .send("service_7tmrt7f", "template_kzedwdg", params)
      .then(() => {
        alert(`OTP sent to ${email}`);
        setIsOtpSent(true);
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        setError("Failed to send OTP. Please try again.");
      });
  };

  const verifyOTP = () => {
    if (otp === generatedOtp?.toString()) {
      const username = email.split("@")[0]; // Extract username from email
      alert("Email verified successfully!");

      localStorage.setItem("isVerified", "true"); // Save verification status
      localStorage.setItem("username", username); // Save the username

      navigate("/Register", { state: { email } }); // Redirect with email info
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Verify Your Email
      </h1>
      <input
        type="email"
        placeholder="Enter Email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {!isOtpSent && (
        <button
          onClick={sendOTP}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Send OTP
        </button>
      )}

      {isOtpSent && (
        <>
          <input
            type="text"
            placeholder="Enter OTP sent to your email"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={verifyOTP}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Verify OTP
          </button>
        </>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
