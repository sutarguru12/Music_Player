import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(401).json({ message: "not authorized, missing Token" });
  }
  const token = authHeaders.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Token verification Failed", error.message);
    res.status(401).json({ message: "Invallid or Expired Token" });
  }
};
