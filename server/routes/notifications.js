import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/unread-count", requireAuth, (req, res) => {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL`
    )
    .get(req.user.id);
  res.json({ count: row?.n ?? 0 });
});

router.get("/", requireAuth, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const rows = db
    .prepare(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(req.user.id, limit);
  res.json(rows);
});

router.patch("/:id/read", requireAuth, (req, res) => {
  const n = db
    .prepare(`SELECT id FROM notifications WHERE id = ? AND user_id = ?`)
    .get(req.params.id, req.user.id);
  if (!n) return res.status(404).json({ error: "Not found" });

  db.prepare(`UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
    req.params.id
  );
  res.json({ ok: true });
});

router.post("/read-all", requireAuth, (_req, res) => {
  db.prepare(
    `UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL`
  ).run(_req.user.id);
  res.json({ ok: true });
});

export default router;
