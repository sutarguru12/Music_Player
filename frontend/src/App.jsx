import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Homepage from "./pages/Homepage";
import ResetPassword from "./components/auth/ResetPassword";
// import Login from "./pages/Login";
// import Register from "./pages/Register";

import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  setError,
  setLoading,
  setUser,
  logout,
} from "./redux/slices/authSlice";
import axios from "axios";

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = token || localStorage.getItem("token");
    if (!storedToken || user) return;

    const fetchUser = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );

        dispatch(setUser({ user: res.data, token: storedToken }));
      } catch (error) {
        console.error("get me failed", error);
        dispatch(logout());

        dispatch(
          setError(
            error?.response?.data?.message ||
              "Session expired. Please log in again",
          ),
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch, token, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Homepage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* <Route path="/" element={<Signup />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
