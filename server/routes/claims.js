import { Router } from "express";
import db from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { createNotification } from "../lib/notificationService.js";

const router = Router();

function requireClaimReviewer(req, res, next) {
  const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(req.params.id);
  if (!claim) return res.status(404).json({ error: "Claim not found" });
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(claim.item_id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  if (req.user.role === "admin" || item.posted_by === req.user.id) {
    req.claimContext = { claim, item };
    return next();
  }
  return res.status(403).json({ error: "Only the listing owner or an admin can review this claim" });
}

/** Submit a response: claim a found item, or say you found a lost item */
router.post("/:itemId", requireAuth, (req, res) => {
  const { message } = req.body;
  if (!message || message.length < 5) {
    return res.status(400).json({ error: "Please add at least 5 characters (identifying details)." });
  }

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });
  if (item.status !== "open") {
    return res.status(400).json({ error: "This listing is closed." });
  }
  if (item.posted_by === req.user.id) {
    return res.status(400).json({ error: "You cannot respond to your own listing here." });
  }

  const pending = db
    .prepare(
      `SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status = 'pending'`
    )
    .get(req.params.itemId, req.user.id);
  if (pending) {
    return res.status(409).json({ error: "You already have a pending response for this listing." });
  }

  const claimType = item.type === "found" ? "claim_found" : "found_lost";

  const result = db
    .prepare(
      `INSERT INTO claims (item_id, claimant_id, message, claim_type, status)
       VALUES (?, ?, ?, ?, 'pending')`
    )
    .run(req.params.itemId, req.user.id, message, claimType);

  const claimId = Number(result.lastInsertRowid);
  const claimant = db.prepare("SELECT name, email FROM users WHERE id = ?").get(req.user.id);

  if (claimType === "claim_found") {
    createNotification({
      userId: item.posted_by,
      type: "claim_on_found",
      title: "Someone says this found item is theirs",
      body: `${claimant?.name || "A user"} submitted a claim with details. Review and accept or reject.`,
      itemId: item.id,
      claimId,
    });
  } else {
    createNotification({
      userId: item.posted_by,
      type: "found_lost_response",
      title: "Someone may have found your lost item",
      body: `${claimant?.name || "A user"} indicated they found something matching your lost listing.`,
      itemId: item.id,
      claimId,
    });
  }

  res.status(201).json({ id: claimId, claim_type: claimType });
});

/** Claims on my listings (I am the poster) */
router.get("/incoming", requireAuth, (req, res) => {
  const status = req.query.status || "pending";
  let sql = `
    SELECT c.*, i.title AS item_title, i.type AS item_type, u.name AS claimant_name, u.email AS claimant_email
    FROM claims c
    JOIN items i ON i.id = c.item_id
    JOIN users u ON u.id = c.claimant_id
    WHERE i.posted_by = ?
  `;
  const params = [req.user.id];
  if (status !== "all") {
    sql += " AND c.status = ?";
    params.push(status);
  }
  sql += " ORDER BY c.created_at DESC";
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

/** My submitted claims */
router.get("/outgoing", requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, i.title AS item_title, i.type AS item_type, i.status AS item_status
    FROM claims c
    JOIN items i ON i.id = c.item_id
    WHERE c.claimant_id = ?
    ORDER BY c.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

/** Claims for one item (owner or admin) */
router.get("/item/:itemId", requireAuth, (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });
  if (req.user.role !== "admin" && item.posted_by !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const rows = db.prepare(`
    SELECT c.*, u.name AS claimant_name, u.email AS claimant_email
    FROM claims c
    JOIN users u ON u.id = c.claimant_id
    WHERE c.item_id = ?
    ORDER BY c.created_at DESC
  `).all(req.params.itemId);
  res.json(rows);
});

router.get("/", requireAuth, requireAdmin, (_req, res) => {
  const claims = db
    .prepare(
      `
    SELECT c.*, i.title AS item_title, i.type AS item_type, u.name AS claimant_name
    FROM claims c
    JOIN items i ON i.id = c.item_id
    JOIN users u ON u.id = c.claimant_id
    ORDER BY c.created_at DESC
  `
    )
    .all();

  res.json(claims);
});

router.patch("/:id", requireAuth, requireClaimReviewer, (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const { claim, item } = req.claimContext;

  if (claim.status !== "pending") {
    return res.status(400).json({ error: "This claim was already resolved." });
  }

  db.prepare("UPDATE claims SET status = ? WHERE id = ?").run(status, req.params.id);

  const claimant = db.prepare("SELECT id, name FROM users WHERE id = ?").get(claim.claimant_id);

  if (status === "approved") {
    db.prepare("UPDATE items SET status = 'returned' WHERE id = ?").run(claim.item_id);
    createNotification({
      userId: claimant.id,
      type: "claim_resolved",
      title: "Your claim was accepted",
      body: `The owner accepted your ${claim.claim_type === "found_lost" ? '"I found it"' : "ownership"} request for “${item.title}”.`,
      itemId: item.id,
      claimId: claim.id,
    });
  } else {
    createNotification({
      userId: claimant.id,
      type: "claim_resolved",
      title: "Your claim was not accepted",
      body: `The listing owner did not accept your request regarding “${item.title}”.`,
      itemId: item.id,
      claimId: claim.id,
    });
  }

  res.json({ ok: true });
});

export default router;
