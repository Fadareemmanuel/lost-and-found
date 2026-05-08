import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_OPTIONS, SIZE_OPTIONS } from "../lib/itemOptions";
import MatchSuggestions from "../components/MatchSuggestions";

const inputClass =
  "w-full rounded-xl border border-brand-gray-light bg-white px-4 py-3 text-dark shadow-sm outline-none transition placeholder:text-brand-gray focus:border-green focus:ring-2 focus:ring-green/25";

export default function NewItemPage() {
  const [form, setForm] = useState({
    type: "lost",
    title: "",
    description: "",
    category: "",
    color: "",
    size_bucket: "",
    location: "",
    date: "",
    image_url: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const body = {
        ...form,
        image_url: form.image_url.trim() || undefined,
        category: form.category.trim() || undefined,
        color: form.color.trim() || undefined,
        size_bucket: form.size_bucket || undefined,
        location: form.location.trim() || undefined,
        date: form.date || undefined,
      };
      const data = await apiFetch("/items", { method: "POST", token, body });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const hints =
    result?.extractedHints &&
    (result.extractedHints.color ||
      result.extractedHints.size_bucket ||
      result.extractedHints.category_hint);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/"
        className="inline-flex text-sm font-medium text-green hover:text-green-light"
      >
        ← Back to listings
      </Link>
      <div className="mt-6 rounded-2xl border border-brand-gray-light bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-dark [font-family:var(--font-syne)]">
          Post a lost or found item
        </h1>
        <p className="mt-2 text-sm text-brand-gray">
          Add structured details when you can — we match flexible text (e.g. “dark black” with
          “black”) and rank similar listings by relevance.
        </p>

        {!result ? (
         <form onSubmit={onSubmit} autoComplete="off" className="mt-8 space-y-5">
            <div>
              <label htmlFor="post-type" className="mb-1.5 block text-sm font-medium text-dark-2">
                Listing type
              </label>
              <select
                id="post-type"
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="lost">I lost something</option>
                <option value="found">I found something</option>
              </select>
              <p className="mt-1 text-xs text-brand-gray">
                After you publish, we search the opposite list (lost ↔ found) for similar items.
              </p>
            </div>
            <div>
              <label htmlFor="post-title" className="mb-1.5 block text-sm font-medium text-dark-2">
                Short title
              </label>
              <input
                id="post-title"
                className={inputClass}
                placeholder="e.g. Black Nike backpack"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                minLength={3}
              />
            </div>
            <div>
              <label htmlFor="post-desc" className="mb-1.5 block text-sm font-medium text-dark-2">
                Description
              </label>
              <textarea
                id="post-desc"
                className={`${inputClass} min-h-[120px] resize-y`}
                placeholder="Colours, size words (small / large), brand… We infer hints if fields below are empty."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={5}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="post-cat" className="mb-1.5 block text-sm font-medium text-dark-2">
                  Category
                </label>
                <select
                  id="post-cat"
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value || "empty"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="post-size" className="mb-1.5 block text-sm font-medium text-dark-2">
                  Size
                </label>
                <select
                  id="post-size"
                  className={inputClass}
                  value={form.size_bucket}
                  onChange={(e) => setForm({ ...form, size_bucket: e.target.value })}
                >
                  {SIZE_OPTIONS.map((o) => (
                    <option key={o.value || "empty"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="post-color" className="mb-1.5 block text-sm font-medium text-dark-2">
                Colour <span className="font-normal text-brand-gray">(optional)</span>
              </label>
              <input
                id="post-color"
                className={inputClass}
                placeholder="e.g. dark blue, silver"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="post-loc" className="mb-1.5 block text-sm font-medium text-dark-2">
                  Location on campus
                </label>
                <input
                  id="post-loc"
                  className={inputClass}
                  placeholder="Library, Gate A…"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="post-date" className="mb-1.5 block text-sm font-medium text-dark-2">
                  Date <span className="font-normal text-brand-gray">(optional)</span>
                </label>
                <input
                  id="post-date"
                  className={inputClass}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
           <div>
              <label htmlFor="post-img" className="mb-1.5 block text-sm font-medium text-dark-2">
                Image <span className="font-normal text-brand-gray">(optional)</span>
              </label>
              <div className="space-y-2">
                <input
                  id="post-img"
                  className={inputClass}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("image", file);
                    try {
                      const res = await fetch("http://localhost:4000/api/upload", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                      });
                      const data = await res.json();
                      setForm({ ...form, image_url: `http://localhost:4000${data.url}` });
                    } catch {
                      setError("Image upload failed. Try again.");
                    }
                  }}
                />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="h-32 w-full rounded-xl object-cover border border-brand-gray-light" />
                )}
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-brand-red-pale px-3 py-2 text-sm text-brand-red">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-light disabled:opacity-60"
            >
              {loading ? "Publishing…" : "Publish & find matches"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="rounded-xl bg-green-pale/80 px-4 py-3 text-sm text-dark-2">
              <p className="font-semibold text-green">Listing #{result.id} published.</p>
              {hints ? (
                <p className="mt-2 text-xs text-brand-gray">
                  Inferred from text
                  {result.extractedHints.color ? (
                    <span className="ml-1">· colour: {result.extractedHints.color}</span>
                  ) : null}
                  {result.extractedHints.size_bucket ? (
                    <span className="ml-1">· size: {result.extractedHints.size_bucket}</span>
                  ) : null}
                  {result.extractedHints.category_hint ? (
                    <span className="ml-1">· category: {result.extractedHints.category_hint}</span>
                  ) : null}
                </p>
              ) : null}
              {result.appliedAttributes && (
                <p className="mt-1 text-xs text-dark-2">
                  Stored:{" "}
                  {[result.appliedAttributes.category, result.appliedAttributes.color, result.appliedAttributes.size_bucket]
                    .filter(Boolean)
                    .join(" · ") || "description only"}
                </p>
              )}
            </div>

            <MatchSuggestions
              matches={result.suggestedMatches}
              heading={
                form.type === "lost"
                  ? "Similar found items (best match first)"
                  : "Similar lost reports (best match first)"
              }
              subheading="Scores combine category, colour, size, title and description similarity."
            />

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/items/${result.id}`}
                className="rounded-xl border border-brand-gray-light px-4 py-2 text-sm font-semibold text-dark-2 hover:bg-brand-gray-bg"
              >
                Open my listing
              </Link>
              <Link
                to="/"
                className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-light"
              >
                Back to all items
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setForm((f) => ({
                    ...f,
                    title: "",
                    description: "",
                    category: "",
                    color: "",
                    size_bucket: "",
                  }));
                }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-green hover:underline"
              >
                Post another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
