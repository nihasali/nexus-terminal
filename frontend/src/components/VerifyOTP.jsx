import React, { useState } from "react";
import { verifyOtp } from "../api/authService";
import { useNavigate } from "react-router-dom";

function VerifyOTP() {

  const [data, setData] = useState({
    email: "",
    otp: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sending OTP data:", data);

    try {
      await verifyOtp(data);
      alert("Account Verified Successfully");
      navigate("/login");
    } catch (error) {
      alert(JSON.stringify(error.response?.data));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Verify OTP</h2>

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        value={data.email}
      />

      <input
        name="otp"
        placeholder="OTP"
        onChange={handleChange}
        value={data.otp}
      />

      <button type="submit">Verify</button>
    </form>
  );
}

export default VerifyOTP;
