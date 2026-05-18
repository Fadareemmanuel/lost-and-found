import { Router } from "express";
import { z } from "zod";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { extractFromText, mergeStructuredFields } from "../lib/extractAttributes.js";
import { findSimilarItems } from "../lib/matching.js";
import {
  createNotification,
  MATCH_NOTIFY_MIN_SCORE,
} from "../lib/notificationService.js";

const router = Router();

const optionalUrl = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().url().optional()
);

const createSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.preprocess(
    (v) => (v === "" || v == null || v === undefined ? undefined : String(v).trim().toLowerCase()),
    z.string().min(1).optional()
  ),
  color: z.preprocess(
    (v) => (v === "" || v == null ? undefined : String(v).trim()),
    z.string().max(120).optional()
  ),
  size_bucket: z.preprocess(
    (v) => (!v || v === "" ? undefined : v),
    z.enum(["small", "medium", "large"]).optional()
  ),
  location: z.string().optional(),
  date: z.string().optional(),
  image_url: optionalUrl,
  latitude: z.preprocess(
  (v) => (v == null || v === "" ? undefined : Number(v)),
  z.number().optional()
),
longitude: z.preprocess(
  (v) => (v == null || v === "" ? undefined : Number(v)),
  z.number().optional()
),
});

router.get("/", (req, res) => {
  const { q = "", type, status = "open", color, size_bucket, category } = req.query;
  let sql = "SELECT * FROM items WHERE 1=1";
  const params = [];

  if (q) {
    sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  if (status && status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }
  if (color && String(color).trim()) {
    sql += " AND LOWER(color) LIKE ?";
    params.push(`%${String(color).trim().toLowerCase()}%`);
  }
  if (size_bucket && ["small", "medium", "large"].includes(String(size_bucket))) {
    sql += " AND size_bucket = ?";
    params.push(size_bucket);
  }
  if (category && String(category).trim()) {
    sql += " AND LOWER(category) = ?";
    params.push(String(category).trim().toLowerCase());
  }

  sql += " ORDER BY created_at DESC";
  const items = db.prepare(sql).all(...params);
  res.json(items);
});

router.get("/:id/similar", (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  const suggestedMatches = findSimilarItems(db, item, { limit: 15 });
  res.json({ itemId: item.id, suggestedMatches });
});

router.get("/:id", (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

router.post("/", requireAuth, (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  const extracted = extractFromText({
    title: data.title,
    description: data.description,
    category: data.category,
  });
  const merged = mergeStructuredFields(
    {
      color: data.color,
      size_bucket: data.size_bucket,
      category: data.category,
    },
    extracted
  );

  const result = db
  .prepare(
    `INSERT INTO items (
      type, title, description, category, color, size_bucket,
      location, date, image_url, posted_by, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  .run(
    data.type,
    data.title,
    data.description,
    merged.category,
    merged.color,
    merged.size_bucket,
    data.location ?? null,
    data.date ?? null,
    data.image_url ?? null,
    req.user.id,
    data.latitude ?? null,
    data.longitude ?? null
  );

  const newId = Number(result.lastInsertRowid);
  const row = db.prepare("SELECT * FROM items WHERE id = ?").get(newId);

  const suggestedMatches = findSimilarItems(db, row, { limit: 12 });

  const notifiedUsers = new Set();
  for (const m of suggestedMatches) {
    if (m.score < MATCH_NOTIFY_MIN_SCORE) continue;
    const other = m.item;
    const uid = other.posted_by;
    if (uid === req.user.id || notifiedUsers.has(uid)) continue;
    notifiedUsers.add(uid);
    createNotification({
      userId: uid,
      type: "strong_match",
      title: "Strong match with a new listing",
      body: `A new ${row.type} post (“${row.title.substring(0, 80)}${row.title.length > 80 ? "…" : ""}”) scores ${m.score}/100 against your ${other.type} listing “${other.title}”.`,
      itemId: other.id,
      claimId: null,
    });
  }

  res.status(201).json({
    id: newId,
    extractedHints: {
      color: extracted.color,
      size_bucket: extracted.size_bucket,
      category_hint: extracted.category_hint,
    },
    appliedAttributes: {
      color: row.color,
      size_bucket: row.size_bucket,
      category: row.category,
    },
    suggestedMatches,
  });
});

export default router;
