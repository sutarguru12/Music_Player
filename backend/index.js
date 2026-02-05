import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import router from "./routes/authRoutes.js";
import songRouter from "./routes/songRoutes.js";

dotenv.config(".env");
const PORT = process.env.PORT || 5001;

const app = express();
app.use(express.json());

// connect database
connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use("/api/auth", router);
app.use("/api/songs", songRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "server is working" });
});

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
