/** Canonical categories for matching (stored lowercase). */
export const CATEGORY_CANONICAL = [
  "phone",
  "bag",
  "wallet",
  "document",
  "keys",
  "clothing",
  "electronics",
  "jewelry",
  "id_card",
  "bottle",
  "headphones",
  "laptop",
  "watch",
  "other",
];

/** Map keywords / phrases → canonical category slug. */
export const CATEGORY_SYNONYMS = {
  phone: ["phone", "smartphone", "iphone", "android", "mobile", "cell"],
  bag: ["bag", "backpack", "rucksack", "purse", "handbag", "tote"],
  wallet: ["wallet", "purse"],
  document: ["document", "paper", "papers", "certificate", "file", "folder"],
  keys: ["key", "keys", "keychain"],
  clothing: ["shirt", "trousers", "jeans", "jacket", "cap", "hat", "shoe", "sneaker", "cloth"],
  electronics: ["charger", "cable", "adapter", "tablet", "ipad", "camera", "usb"],
  jewelry: ["ring", "necklace", "bracelet", "earring"],
  id_card: ["id", "id card", "student id", "lasu id", "license", "licence"],
  bottle: ["bottle", "water bottle", "flask"],
  headphones: ["headphones", "earbuds", "airpods"],
  laptop: ["laptop", "macbook", "notebook pc"],
  watch: ["watch", "wristwatch", "smartwatch"],
};

export const SIZE_BUCKETS = ["small", "medium", "large"];
