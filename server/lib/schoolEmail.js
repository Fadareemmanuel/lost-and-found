/**
 * Allowed school domains from env (lowercase, no @).
 * Set either ALLOWED_EMAIL_DOMAIN=lasu.edu.ng or
 * ALLOWED_EMAIL_DOMAINS=lasu.edu.ng,mail.lasu.edu.ng
 */
export function getAllowedEmailDomains() {
  const list = process.env.ALLOWED_EMAIL_DOMAINS?.trim();
  if (list) {
    return list
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
  }
  const single = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();
  return single ? [single] : [];
}

export function isAllowedSchoolEmail(email) {
  if (!email || typeof email !== "string") return false;
  const domains = getAllowedEmailDomains();
  if (!domains.length) return false;
  const e = email.trim().toLowerCase();
  return domains.some((d) => e.endsWith(`@${d}`));
}

/** If set, Google JWT hosted domain (hd) must match (Workspace / school Google). */
export function isWorkspaceDomainAllowed(hd) {
  const required = process.env.REQUIRE_GOOGLE_WORKSPACE_DOMAIN?.trim().toLowerCase();
  if (!required) return true;
  if (!hd || typeof hd !== "string") return false;
  return hd.trim().toLowerCase() === required;
}
