import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import claimRoutes from "./routes/claims.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
import { initDb } from "./db.js";
import { upload } from "./lib/upload.js";

dotenv.config();
initDb();

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

const PORT = Number(process.env.PORT) || 4000;
const server = app.listen(PORT);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n[!] Port ${PORT} is already in use. Another process may be answering requests (often an old API without newer routes — e.g. "Cannot POST /api/auth/google").\n` +
        `    Stop it:  lsof -iTCP:${PORT} -sTCP:LISTEN   then kill that PID, or set PORT in .env to a free port (and set VITE_DEV_API_URL on the frontend to match).\n`
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

server.on("listening", () => {
  const addr = server.address();
  const p = typeof addr === "object" && addr && "port" in addr ? addr.port : PORT;
  console.log(`API running on http://localhost:${p}`);
});