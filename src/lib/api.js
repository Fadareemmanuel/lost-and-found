/**
 * - Production: set VITE_API_BASE to your public API root (e.g. https://api.example.com/api).
 * - Local dev: call Express on :4000 directly so we do not depend on the Vite proxy (avoids 404
 *   when the proxy is stale or the dev server was started without proxy config).
 */
function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE?.replace(/\/$/, "")?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) {
    // Match server PORT if not 4000: set VITE_DEV_API_URL=http://localhost:YOUR_PORT (no trailing /api)
    const origin = (
      import.meta.env.VITE_DEV_API_URL || "http://localhost:4000"
    )
      .replace(/\/$/, "")
      .trim();
    return `${origin}/api`;
  }
  return "https://lasu-lost-and-found-api.onrender.com/api".
}

const API_BASE = getApiBase();

function joinUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function formatError(data) {
  const err = data?.error;
  if (!err) return "Something went wrong.";
  if (typeof err === "string") return err;
  if (err.formErrors?.length) return err.formErrors.join(" ");
  const field = err.fieldErrors;
  if (field && typeof field === "object") {
    const msgs = Object.values(field).flat().filter(Boolean);
    if (msgs.length) return msgs.join(" ");
  }
  return "Please check your input and try again.";
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(joinUrl(path), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Network error. Please try again.");
  }

  if (res.status === 401) {
    window.location.href = "/login?session=expired";
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatError(data));
  return data;
}