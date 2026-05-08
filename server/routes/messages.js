import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Get all messages for a claim
router.get("/:claimId", requireAuth, (req, res) => {
  const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(req.params.claimId);
  if (!claim) return res.status(404).json({ error: "Claim not found" });

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(claim.item_id);
  if (claim.claimant_id !== req.user.id && item.posted_by !== req.user.id) {
    return res.status(403).json({ error: "Not allowed" });
  }

  const messages = db.prepare(
    "SELECT messages.*, users.name as sender_name FROM messages JOIN users ON messages.sender_id = users.id WHERE claim_id = ? ORDER BY created_at ASC"
  ).all(req.params.claimId);

  res.json(messages);
});

// Send a message
router.post("/:claimId", requireAuth, (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: "Message cannot be empty" });

  const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(req.params.claimId);
  if (!claim) return res.status(404).json({ error: "Claim not found" });

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(claim.item_id);
  if (claim.claimant_id !== req.user.id && item.posted_by !== req.user.id) {
    return res.status(403).json({ error: "Not allowed" });
  }

  db.prepare("INSERT INTO messages (claim_id, sender_id, body) VALUES (?, ?, ?)").run(
    req.params.claimId, req.user.id, body.trim()
  );

  res.status(201).json({ ok: true });
});

export default router;