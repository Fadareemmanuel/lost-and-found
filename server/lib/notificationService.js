import db from "../db.js";

/**
 * @param {object} p
 * @param {number} p.userId - recipient
 * @param {string} p.type - strong_match | claim_on_found | found_lost_response | claim_resolved
 * @param {string} p.title
 * @param {string} p.body
 * @param {number} [p.itemId]
 * @param {number} [p.claimId]
 */
export function createNotification({ userId, type, title, body, itemId, claimId }) {
  const result = db
    .prepare(
      `INSERT INTO notifications (user_id, type, title, body, item_id, claim_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, type, title, body, itemId ?? null, claimId ?? null);
  return Number(result.lastInsertRowid);
}

export const MATCH_NOTIFY_MIN_SCORE = 68;
