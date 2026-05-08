import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AdminClaimsPage() {
  const { token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/claims", { token });
      setClaims(data);
    } catch (err) {
      setError(err.message);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateClaim(id, status) {
    setActionId(id);
    try {
      await apiFetch(`/claims/${id}`, { method: "PATCH", token, body: { status } });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  if (error && !loading && claims.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/" className="text-sm font-medium text-green hover:text-green-light">
          ← Back to listings
        </Link>
        <div className="mt-6 rounded-xl border border-brand-red/30 bg-brand-red-pale px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/" className="text-sm font-medium text-green hover:text-green-light">
        ← Back to listings
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-dark [font-family:var(--font-syne)]">
        Claim requests
      </h1>
      <p className="mt-2 text-sm text-brand-gray">
        List owners are notified and can accept or decline on the item page. Use this view to
        moderate if needed. Approving marks the item as returned and notifies the respondent.
      </p>

      {error && claims.length > 0 && (
        <div className="mt-6 rounded-xl border border-brand-red/30 bg-brand-red-pale px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-center text-brand-gray">Loading claims…</p>
      ) : claims.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-gray-light bg-white px-6 py-12 text-center text-brand-gray">
          No claims yet.
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {claims.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-brand-gray-light bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Item
                  </p>
                  <p className="font-semibold text-dark">{c.item_title}</p>
                  {c.item_type && (
                    <p className="text-xs text-brand-gray">
                      Listing: {c.item_type}
                      {c.claim_type
                        ? ` · ${c.claim_type === "found_lost" ? "I found (lost post)" : "Claim (found post)"}`
                        : ""}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    c.status === "pending"
                      ? "bg-gold-pale text-gold"
                      : c.status === "approved"
                        ? "bg-green-pale text-green"
                        : "bg-brand-gray-light text-brand-gray"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-brand-gray">
                <span className="font-medium text-dark-2">Claimant:</span> {c.claimant_name}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-dark-2">{c.message}</p>
              {c.status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionId === c.id}
                    onClick={() => updateClaim(c.id, "approved")}
                    className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-light disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={actionId === c.id}
                    onClick={() => updateClaim(c.id, "rejected")}
                    className="rounded-xl border border-brand-gray-light bg-white px-4 py-2 text-sm font-semibold text-dark-2 transition hover:bg-brand-gray-bg disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
