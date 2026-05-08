import { CATEGORY_SYNONYMS } from "./itemConstants.js";

/** Multi-word colors first (longest match wins). */
const COMPOUND_COLORS = [
  "dark black",
  "dark blue",
  "light blue",
  "navy blue",
  "dark brown",
  "light brown",
  "dark green",
  "light green",
  "dark grey",
  "dark gray",
  "light grey",
  "light gray",
  "dark red",
  "rose gold",
  "jet black",
];

const SIMPLE_COLORS = [
  "black",
  "white",
  "red",
  "blue",
  "green",
  "yellow",
  "brown",
  "grey",
  "gray",
  "silver",
  "gold",
  "pink",
  "purple",
  "orange",
  "navy",
  "beige",
  "tan",
  "maroon",
  "cream",
  "khaki",
  "turquoise",
  "cyan",
  "magenta",
  "charcoal",
  "burgundy",
];

const SIZE_HINTS = {
  small: ["small", "tiny", "mini", "little", "compact", "slim"],
  medium: ["medium", "mid", "regular", "average", "normal"],
  large: ["large", "big", "huge", "xl", "oversized"],
};

function normalizeSpaces(s) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Pull color / size hints from free text. Category inference only when no explicit category.
 * @param {{ title?: string, description?: string, category?: string }} fields
 * @returns {{ color: string | null, size_bucket: string | null, category_hint: string | null }}
 */
export function extractFromText(fields) {
  const raw = normalizeSpaces(
    `${fields.title || ""} ${fields.description || ""}`.toLowerCase()
  );
  if (!raw) {
    return { color: null, size_bucket: null, category_hint: null };
  }

  let remainder = raw;
  let color = null;

  for (const phrase of COMPOUND_COLORS) {
    if (remainder.includes(phrase)) {
      color = phrase.replace(/\s+/g, " ");
      remainder = remainder.replaceAll(phrase, " ");
      break;
    }
  }
  if (!color) {
    for (const phrase of SIMPLE_COLORS) {
      const re = new RegExp(`\\b${phrase}\\b`, "i");
      if (re.test(raw)) {
        color = phrase === "gray" ? "grey" : phrase;
        break;
      }
    }
  }

  let size_bucket = null;
  for (const bucket of Object.keys(SIZE_HINTS)) {
    for (const hint of SIZE_HINTS[bucket]) {
      const re = new RegExp(`\\b${hint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(raw)) {
        size_bucket = bucket;
        break;
      }
    }
    if (size_bucket) break;
  }

  let category_hint = null;
  const explicit = fields.category?.trim().toLowerCase();
  if (explicit && explicit.length > 0) {
    category_hint = null;
  } else {
    for (const [canonical, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
      for (const syn of synonyms) {
        if (syn.includes(" ") ? raw.includes(syn) : new RegExp(`\\b${syn}\\b`, "i").test(raw)) {
          category_hint = canonical;
          break;
        }
      }
      if (category_hint) break;
    }
  }

  return { color, size_bucket, category_hint };
}

/**
 * Merge user-provided structured fields with extracted hints (explicit wins).
 */
export function mergeStructuredFields(body, extracted) {
  const cat =
    body.category?.trim() ||
    extracted.category_hint ||
    null;
  return {
    color: body.color?.trim() || extracted.color || null,
    size_bucket: body.size_bucket || extracted.size_bucket || null,
    category: cat ? cat.toLowerCase() : null,
  };
}
