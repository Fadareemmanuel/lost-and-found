import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import db from "../db.js";
import {
  getAllowedEmailDomains,
  isAllowedSchoolEmail,
  isWorkspaceDomainAllowed,
} from "../lib/schoolEmail.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

router.post("/register", (req, res) => {
  if (process.env.DISABLE_PASSWORD_REGISTER === "true") {
    return res.status(403).json({
      error: "Password sign-up is disabled. Use Google with your school email.",
    });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;
  const domains = getAllowedEmailDomains();
  if (domains.length && !isAllowedSchoolEmail(email)) {
    return res.status(403).json({
      error: `Only school email addresses (${domains.map((d) => `@${d}`).join(", ")}) are allowed.`,
    });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, auth_provider) VALUES (?, ?, ?, 'password')"
    )
    .run(name, email, passwordHash);

  const token = issueToken({
    id: Number(result.lastInsertRowid),
    email,
    role: "student",
  });

  res.status(201).json({ token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  if (user.auth_provider === "google") {
    return res.status(401).json({
      error: "This account uses Google sign-in. Use the Google button instead.",
    });
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: issueToken(user) });
});

const googleBodySchema = z.object({
  credential: z.string().min(10),
});

router.post("/google", async (req, res) => {
  const parsed = googleBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return res.status(500).json({ error: "Server missing GOOGLE_CLIENT_ID" });
  }

  const domains = getAllowedEmailDomains();
  if (!domains.length) {
    return res.status(500).json({
      error: "Server missing ALLOWED_EMAIL_DOMAIN or ALLOWED_EMAIL_DOMAINS",
    });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: parsed.data.credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: "Google token had no email" });
    }
    if (payload.email_verified !== true) {
      return res.status(403).json({ error: "Your Google email is not verified." });
    }

    if (!isAllowedSchoolEmail(payload.email)) {
      return res.status(403).json({
        error: `Only school Google accounts are allowed (${domains.map((d) => `@${d}`).join(", ")}).`,
      });
    }

    if (!isWorkspaceDomainAllowed(payload.hd)) {
      return res.status(403).json({
        error: "Your Google Workspace domain is not permitted for this app.",
      });
    }

    const name = (payload.name || payload.email.split("@")[0] || "Student").slice(0, 200);
    const email = payload.email.toLowerCase();

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      const passwordHash = bcrypt.hashSync(
        `__google_oauth__${email}__${crypto.randomBytes(16).toString("hex")}`,
        10
      );
      const result = db
        .prepare(
          "INSERT INTO users (name, email, password_hash, auth_provider) VALUES (?, ?, ?, 'google')"
        )
        .run(name, email, passwordHash);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(result.lastInsertRowid));
    } else {
      db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, user.id);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    }

    res.json({ token: issueToken(user) });
  } catch (e) {
    console.error("Google auth error:", e);
    return res.status(401).json({ error: "Invalid or expired Google sign-in" });
  }
});

export default router;
