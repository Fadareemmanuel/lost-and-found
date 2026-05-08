/**
 * Relevance scoring for lost ↔ found pairs. Tunable weights; swap in embeddings / LLM later
 * by replacing `diceSimilarity` or adding a `semantic` term in `scorePair`.
 */
import { CATEGORY_SYNONYMS } from "./itemConstants.js";

/** Max points per dimension (sums to 100). */
export const WEIGHTS = {
  category: 28,
  color: 27,
  size: 15,
  title: 15,
  description: 15,
};

function tokenizeForDice(text) {
  if (!text || typeof text !== "string") return new Set();
  const stop = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "is", "was", "are", "been", "be", "have", "has", "had", "it", "its", "this", "that", "my",
    "found", "lost", "item", "please", "contact",
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stop.has(w))
  );
}

/** Sørensen–Dice style similarity on word sets → 0..1 */
export function diceSimilarity(a, b) {
  const A = tokenizeForDice(a);
  const B = tokenizeForDice(b);
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter++;
  }
  return (2 * inter) / (A.size + B.size);
}

function normalizeCategorySlug(cat) {
  if (!cat || typeof cat !== "string") return null;
  const c = cat.trim().toLowerCase().replace(/\s+/g, "_");
  return c || null;
}

/** Resolve text to canonical slug if it matches synonyms. */
function inferCanonicalCategory(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [canonical, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const syn of synonyms) {
      if (syn.includes(" ") ? lower.includes(syn) : new RegExp(`\\b${syn}\\b`, "i").test(lower)) {
        return canonical;
      }
    }
  }
  return normalizeCategorySlug(text);
}

function categoryScore(a, b) {
  const ca = inferCanonicalCategory(a?.category || "") || normalizeCategorySlug(a?.category);
  const cb = inferCanonicalCategory(b?.category || "") || normalizeCategorySlug(b?.category);
  if (!ca && !cb) return 0.55 * WEIGHTS.category;
  if (!ca || !cb) return 0.35 * WEIGHTS.category;
  if (ca === cb) return WEIGHTS.category;
  if (ca.includes(cb) || cb.includes(ca)) return 0.72 * WEIGHTS.category;
  return 0;
}

function colorTokens(colorStr) {
  if (!colorStr || typeof colorStr !== "string") return [];
  return colorStr
    .toLowerCase()
    .replace(/grey/g, "gray")
    .split(/\s+/)
    .filter(Boolean);
}

/** Partial / fuzzy color match: shared tokens, substring overlap. */
function colorScore(a, b) {
  const hasA = !!(a?.color && String(a.color).trim());
  const hasB = !!(b?.color && String(b.color).trim());
  if (!hasA && !hasB) return 0.6 * WEIGHTS.color;
  if (!hasA || !hasB) return 0.38 * WEIGHTS.color;

  const ta = new Set(colorTokens(a.color));
  const tb = new Set(colorTokens(b.color));
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  const sa = [...ta].join(" ");
  const sb = [...tb].join(" ");
  if (overlap > 0) {
    const base = (overlap / Math.max(ta.size, tb.size)) * WEIGHTS.color;
    return Math.min(WEIGHTS.color, base + (overlap > 1 ? 4 : 0));
  }
  if (sa.includes(sb) || sb.includes(sa) || sa.includes(sb.slice(0, 3))) {
    return 0.65 * WEIGHTS.color;
  }
  const da = diceSimilarity(sa, sb);
  return da * WEIGHTS.color * 0.85;
}

function sizeScore(a, b) {
  const sa = a?.size_bucket || null;
  const sb = b?.size_bucket || null;
  if (!sa && !sb) return 0.65 * WEIGHTS.size;
  if (!sa || !sb) return 0.45 * WEIGHTS.size;
  if (sa === sb) return WEIGHTS.size;
  return 0;
}

/**
 * Score how well `candidate` matches `subject` (lost vs found pairing).
 * @returns {{ total: number, breakdown: Record<string, number>, components: Record<string, number> }}
 */
export function scorePair(subject, candidate) {
  const cat = categoryScore(subject, candidate);
  const col = colorScore(subject, candidate);
  const siz = sizeScore(subject, candidate);
  const tit = diceSimilarity(subject.title || "", candidate.title || "") * WEIGHTS.title;
  const des = diceSimilarity(subject.description || "", candidate.description || "") * WEIGHTS.description;

  const total = Math.round((cat + col + siz + tit + des) * 100) / 100;
  const breakdown = {
    category: Math.round(cat * 100) / 100,
    color: Math.round(col * 100) / 100,
    size: Math.round(siz * 100) / 100,
    title: Math.round(tit * 100) / 100,
    description: Math.round(des * 100) / 100,
  };

  return {
    total,
    breakdown,
    components: {
      categoryW: WEIGHTS.category,
      colorW: WEIGHTS.color,
      sizeW: WEIGHTS.size,
      titleW: WEIGHTS.title,
      descriptionW: WEIGHTS.description,
    },
  };
}

/**
 * Find ranked opposite-type open items for matching.
 * @param {import("better-sqlite3").Database} database
 * @param {object} subjectRow — full item row including id, type
 * @param {{ limit?: number }} opts
 */
export function findSimilarItems(database, subjectRow, opts = {}) {
  const limit = opts.limit ?? 12;
  const wantType = subjectRow.type === "lost" ? "found" : "lost";

  const candidates = database
    .prepare(
      `SELECT * FROM items WHERE type = ? AND status = 'open' AND id != ? ORDER BY created_at DESC LIMIT 500`
    )
    .all(wantType, subjectRow.id);

  const scored = candidates
    .map((row) => {
      const { total, breakdown } = scorePair(subjectRow, row);
      return {
        item: row,
        score: total,
        breakdown,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
