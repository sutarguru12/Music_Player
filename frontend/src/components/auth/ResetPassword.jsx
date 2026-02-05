import React, { use, useState } from "react";
import axios from "axios";
import "../../css/auth/ResetPassword.css";
import Input from "../common/Input";
import { useNavigate, useParams } from "react-router-dom";

const resetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setpassword] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setStatus("error");
      setMessage("Password must be atleast 6 characters");
      return;
    }
    try {
      setLoading(true);
      setStatus("info");
      setMessage("Resetting Password");

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/reset-password/${token}`,
        { password },
      );

      setStatus("success");
      setMessage("Password reset successfully!. ReDirecting...");

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setStatus("error");
      setMessage(error?.response?.data?.message || "Reset failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <h3 className="reset-title">Reset Password</h3>
      <p className="reset-subtitle">Enter your new Password to regain access</p>
      <div className="reset-form">
        <Input
          label={"New Password"}
          type={"password"}
          placeholder={"Enter a new password"}
          value={password}
          onChange={(e) => {
            setpassword(e.target.value);
          }}
        />

        {status === "error" && <div className="reset-error">{message}</div>}
        {status === "success" && <div className="reset-success">{message}</div>}

        <button
          className="reset-submit-btn"
          onClick={handleReset}
          disabled={loading}
        >
          <span>{loading ? "Resetting" : "Reset password"}</span>
        </button>
      </div>
    </div>
  );
};

export default resetPassword;
