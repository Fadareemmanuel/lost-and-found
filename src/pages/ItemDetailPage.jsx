import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";
import MatchSuggestions from "../components/MatchSuggestions";

const inputClass =
  "w-full rounded-xl border border-brand-gray-light bg-white px-4 py-3 text-dark shadow-sm outline-none transition placeholder:text-brand-gray focus:border-green focus:ring-2 focus:ring-green/25";

function sameUser(a, b) {
  return Number(a) === Number(b);
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const { token, isAuthed, user } = useAuth();
  const [item, setItem] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [claimsOnItem, setClaimsOnItem] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [info, setInfo] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(null);

  const isOwner =
    item && user?.id != null && item.posted_by != null && sameUser(user.id, item.posted_by);

  const load = useCallback(async () => {
    setLoadError("");
    setSimilar([]);
    try {
      const data = await apiFetch(`/items/${id}`);
      setItem(data);
      try {
        const sim = await apiFetch(`/items/${id}/similar`);
        setSimilar(sim.suggestedMatches ?? []);
      } catch {
        setSimilar([]);
      }
      if (token && data.posted_by != null && sameUser(user?.id, data.posted_by)) {
        try {
          const cl = await apiFetch(`/claims/item/${id}`, { token });
          setClaimsOnItem(cl);
        } catch {
          setClaimsOnItem([]);
        }
      } else {
        setClaimsOnItem([]);
      }
    } catch (err) {
      setLoadError(err.message);
      setItem(null);
    }
  }, [id, token, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitResponse(e) {
    e.preventDefault();
    setInfo("");
    setSubmitLoading(true);
    try {
      await apiFetch(`/claims/${id}`, {
        method: "POST",
        token,
        body: { message: responseMsg },
      });
      setInfo(
        item?.type === "found"
          ? "Your claim was sent to the person who found this item. They will review and accept or decline."
          : "Your message was sent to the person who lost this item. They will review and accept or decline."
      );
      setResponseMsg("");
      await load();
    } catch (err) {
      setInfo(err.message);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function reviewClaim(claimId, status) {
    setReviewLoading(claimId);
    setInfo("");
    try {
      await apiFetch(`/claims/${claimId}`, {
        method: "PATCH",
        token,
        body: { status },
      });
      setInfo(status === "approved" ? "You accepted this response." : "You declined this response.");
      await load();
    } catch (err) {
      setInfo(err.message);
    } finally {
      setReviewLoading(null);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-brand-red/30 bg-brand-red-pale px-4 py-3 text-sm text-brand-red">
          {loadError}
        </div>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-green hover:text-green-light">
          ← Back to listings
        </Link>
      </div>
    );
  }

  if (!item) {
    return <p className="py-16 text-center text-brand-gray">Loading…</p>;
  }

  const isOpen = item.status === "open";

  const pendingClaims = claimsOnItem.filter((c) => c.status === "pending");
const myClaim = claimsOnItem?.find((c) => c.claimant_id === user?.id && c.status === "approved");
  const claimTypeLabel = (t) =>
    t === "found_lost" ? "Says they found your item" : "Says this found item is theirs";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/" className="inline-flex text-sm font-medium text-green hover:text-green-light">
        ← Back to listings
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-brand-gray-light bg-white shadow-sm">
        {item.image_url ? (
          <div className="aspect-[21/9] w-full bg-brand-gray-bg sm:aspect-[2/1]">
            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green ring-1 ring-green/20">
              {item.type}
            </span>
            <span className="rounded-full bg-brand-gray-light/80 px-3 py-1 text-xs font-medium capitalize text-dark-2">
              {item.status}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-dark [font-family:var(--font-syne)] sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-4 whitespace-pre-wrap text-dark-2">{item.description}</p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-brand-gray">Category</dt>
              <dd className="text-dark capitalize">
                {item.category?.replace(/_/g, " ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-gray">Colour</dt>
              <dd className="text-dark">{item.color?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-gray">Size</dt>
              <dd className="text-dark capitalize">{item.size_bucket || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-gray">Location</dt>
              <dd className="text-dark">{item.location?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-gray">Date</dt>
              <dd className="text-dark">{item.date?.trim() || "—"}</dd>
            </div>
          </dl>

          {similar.length > 0 && (
            <div className="mt-8 rounded-2xl border border-green-mid/40 bg-green-pale/30 p-5">
              <MatchSuggestions
                matches={similar}
                heading={
                  item.type === "lost"
                    ? "Possible matches — found items"
                    : "Possible matches — lost reports"
                }
                subheading="Ranked by relevance (category, colour, size, title & description)."
                emptyMessage=""
              />
            </div>
          )}

          {isOwner && isOpen && pendingClaims.length > 0 && (
            <div className="mt-8 rounded-2xl border border-gold/40 bg-gold-pale/50 p-5">
              <h2 className="text-lg font-semibold text-dark [font-family:var(--font-syne)]">
                Review responses
              </h2>
              <p className="mt-1 text-sm text-brand-gray">
                Confirm only when you are satisfied — nothing is finalised until you accept.
              </p>
              <ul className="mt-4 space-y-4">
                {pendingClaims.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-xl border border-brand-gray-light bg-white p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase text-brand-gray">
                      {claimTypeLabel(c.claim_type)}
                    </p>
                    <p className="mt-1 font-medium text-dark">{c.claimant_name}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-dark-2">{c.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={reviewLoading === c.id}
                        onClick={() => reviewClaim(c.id, "approved")}
                        className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-light disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={reviewLoading === c.id}
                        onClick={() => reviewClaim(c.id, "rejected")}
                        className="rounded-lg border border-brand-gray-light bg-white px-4 py-2 text-sm font-semibold text-dark-2 hover:bg-brand-gray-bg disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
       {isAuthed && !isOwner && myClaim?.status === "approved" && (
  <ChatBox claimId={myClaim.id} />
)}

{isOwner && pendingClaims?.filter(c => c.status === "approved").map(c => (
  <ChatBox key={c.id} claimId={c.id} />
))}

          <div className="mt-8 border-t border-brand-gray-light pt-8">
            {!isAuthed && (
              <p className="text-sm text-brand-gray">
                <Link to="/login" className="font-semibold text-green hover:text-green-light">
                  Log in
                </Link>{" "}
                or{" "}
                <Link to="/register" className="font-semibold text-green hover:text-green-light">
                  sign up
                </Link>{" "}
                to respond to this listing.
              </p>
            )}

            {isAuthed && isOwner && (
              <p className="text-sm text-brand-gray">
                This is your listing. Responses from others appear above when pending.
              </p>
            )}

            {isAuthed && !isOwner && !isOpen && (
              <p className="text-sm text-brand-gray">This listing is closed.</p>
            )}

            {isAuthed && !isOwner && isOpen && item.type === "found" && (
              <div>
                <h2 className="text-lg font-semibold text-dark [font-family:var(--font-syne)]">
                  This is mine
                </h2>
                <p className="mt-2 text-sm text-brand-gray">
                  The finder will be notified. Describe identifying details (colour, scratches,
                  lock screen, etc.) so they can verify you.
                </p>
                <form onSubmit={submitResponse} className="mt-4 space-y-3">
                  <textarea
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={responseMsg}
                    onChange={(e) => setResponseMsg(e.target.value)}
                    placeholder="Details only you would know…"
                    required
                    minLength={5}
                  />
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-dark shadow-sm transition hover:bg-gold-light disabled:opacity-60"
                  >
                    {submitLoading ? "Sending…" : "Submit claim to finder"}
                  </button>
                </form>
              </div>
            )}

            {isAuthed && !isOwner && isOpen && item.type === "lost" && (
              <div>
                <h2 className="text-lg font-semibold text-dark [font-family:var(--font-syne)]">
                  I found this item
                </h2>
                <p className="mt-2 text-sm text-brand-gray">
                  The person who lost it will be notified. Say where you have it and how to
                  recognise it.
                </p>
                <form onSubmit={submitResponse} className="mt-4 space-y-3">
                  <textarea
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={responseMsg}
                    onChange={(e) => setResponseMsg(e.target.value)}
                    placeholder="How to verify, where you are holding it…"
                    required
                    minLength={5}
                  />
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-light disabled:opacity-60"
                  >
                    {submitLoading ? "Sending…" : "Notify owner I found it"}
                  </button>
                </form>
              </div>
            )}

            {info ? (
              <p
                className={`mt-4 text-sm ${
                  info.includes("accept") ||
                  info.includes("sent") ||
                  info.includes("declined") ||
                  info.includes("Accepted")
                    ? "text-green"
                    : "text-brand-red"
                }`}
              >
                {info}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
