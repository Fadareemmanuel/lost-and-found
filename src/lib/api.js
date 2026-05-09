/**
 * - Production: set VITE_API_BASE to your public API root (e.g. https://api.example.com/api).
 * - Local dev: call Express on :4000 directly so we do not depend on the Vite proxy (avoids 404
 *   when the proxy is stale or the dev server was started without proxy config).
 */
function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, "").trim();
  }
  if (import.meta.env.DEV) {
    return "http://localhost:4000/api";
  }
  return "https://lasu-lost-and-found-api.onrender.com/api";
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
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      window.location.href = "/login?session=expired";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatError(data));
  return data;
}
