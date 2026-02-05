import imageKit from "../config/imageKit.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendMail from "../utils/sendEmail.js";

dotenv.config();

// Create Token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup
const signup = async (req, res) => {
  try {
    // get the data from frontend
    const { name, email, password, avatar } = req.body;

    //check the data is correct or not
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, password are required" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "EmailId already exists" });
    }

    let avatarUrl = "";
    if (avatar) {
      const uploadResponse = await imageKit.upload({
        file: avatar,
        fileName: `avatar${Date.now()}.jpg`,
        folder: "/mern-music-player",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    const token = createToken(user._id);

    res.status(201).json({
      message: "user created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("signup not successfull", error);
    res.status(500).json({ message: "signup failed", error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password both required." });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Email id doesn't exists." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid credentials." });
    }

    const token = createToken(user._id);

    res.status(200).json({
      message: "user logged in successfully",
      user: {
        name: user.name,
        id: user._id,
        email: user.email,
        password: user.password,
      },
      token,
    });
  } catch (error) {
    console.error("login not successfull", error);
    res.status(500).json({
      message: "login failed",
      error: error.message,
    });
  }
};

// Protected Controller
const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not Authenticated" });
  }
  res.status(200).json({ user: req.user });
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "no user found" });
    }

    // resetToken generated
    const resetToken = crypto.randomBytes(32).toString("hex");

    // hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // send Email

    await sendMail({
      to: user.email,
      subject: "Reset your Password",
      html: `
      <h3>Reset Password</h3>
      <p>Click on the link below to reset your password</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 10 minutes</p>`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error", error.message);
    res
      .status(500)
      .json({ message: "something went wrong", error: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ messsage: "Token is invalid or expired" });
    }

    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error", error.message);
    res
      .status(500)
      .json({ message: "something went wrong", error: error.message });
  }
};

// Edit Profile
const editProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "Not Authenticated" });
    }

    const { name, email, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Both current and new password are required" });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "password must be atleast 6 characters" });
      }
      user.password = newPassword;
    }

    if (avatar) {
      const uploadResponse = await imageKit.upload({
        file: avatar,
        fileName: `avatar_${userId}_${Date.now()}.jpg`,
        folder: "/mern-music-player",
      });

      user.avatar = uploadResponse.url;
    }
    await user.save();

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Edit profile error", error.message);
    return res.status(500).json({ message: "Error in updating data" });
  }
};
export { signup, login, getMe, forgotPassword, resetPassword, editProfile };
