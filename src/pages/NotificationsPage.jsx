import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/notifications", { token });
      setList(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(n) {
    if (n.read_at) return;
    try {
      await apiFetch(`/notifications/${n.id}/read`, { method: "PATCH", token });
      setList((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
        )
      );
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    try {
      await apiFetch("/notifications/read-all", { method: "POST", token });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark [font-family:var(--font-syne)]">
          Notifications
        </h1>
        <button
          type="button"
          onClick={markAllRead}
          className="text-sm font-medium text-green hover:text-green-light"
        >
          Mark all read
        </button>
      </div>
      <p className="mt-2 text-sm text-brand-gray">
        Alerts when someone responds to your listing, when your claim is reviewed, or when our
        matcher finds a strong overlap with another post.
      </p>

      {error && (
        <div className="mt-6 rounded-lg bg-brand-red-pale px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-center text-brand-gray">Loading…</p>
      ) : list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-gray-light px-6 py-14 text-center text-brand-gray">
          No notifications yet.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n)}
                className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                  n.read_at
                    ? "border-brand-gray-light bg-white"
                    : "border-green-mid/50 bg-green-pale/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    {n.type?.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-brand-gray">{formatTime(n.created_at)}</span>
                </div>
                <p className="mt-1 font-semibold text-dark">{n.title}</p>
                <p className="mt-1 text-sm text-dark-2">{n.body}</p>
                {n.item_id ? (
                  <Link
                    to={`/items/${n.item_id}`}
                    className="mt-3 inline-block text-sm font-semibold text-green hover:text-green-light"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View listing →
                  </Link>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
