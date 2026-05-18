import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_OPTIONS } from "../lib/itemOptions";
import MatchSuggestions from "../components/MatchSuggestions";
import LocationPicker from "../components/LocationPicker";

const inputClass =
  "w-full rounded-xl border border-brand-gray-light bg-white px-4 py-3 text-dark shadow-sm outline-none transition placeholder:text-brand-gray focus:border-green focus:ring-2 focus:ring-green/25";

export default function FoundItemPage() {
  const [form, setForm] = useState({
    description: "",
    category: "",
    date: "",
    image_url: "",
  });
  const [location, setLocation] = useState(null);
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
        type: "found",
        title: form.description.slice(0, 60),
        description: form.description,
        category: form.category || undefined,
        date: form.date || undefined,
        image_url: form.image_url || undefined,
        location: location?.label || undefined,
        latitude: location?.lat || undefined,
        longitude: location?.lng || undefined,
      };
      const data = await apiFetch("/items", { method: "POST", token, body });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/" className="inline-flex text-sm font-medium text-green hover:text-green-light">
        ← Back to listings
      </Link>
      <div className="mt-6 rounded-2xl border border-brand-gray-light bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <h1 className="text-2xl font-bold text-dark [font-family:var(--font-syne)]">
              Report a Found Item
            </h1>
            <p className="text-sm text-brand-gray">Help reunite someone with their belongings.</p>
          </div>
        </div>

        {!result ? (
          <form onSubmit={onSubmit} autoComplete="off" className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-2">
                What did you find?
              </label>
              <textarea
                className={`${inputClass} min-h-[100px] resize-y`}
                placeholder="Describe the item — brand, colour, any identifying features..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={5}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-2">Category</label>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-2">
                Where did you find it?
              </label>
              <LocationPicker value={location} onChange={setLocation} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-2">
                Date found <span className="font-normal text-brand-gray">(optional)</span>
              </label>
              <input
                className={inputClass}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-2">
                Image <span className="font-normal text-brand-gray">(optional)</span>
              </label>
              <input
                className={inputClass}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("image", file);
                  try {
                    const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE?.replace("/api", "")}/api/upload`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                    const data = await uploadRes.json();
setForm((prev) => ({ ...prev, image_url: data.url }));
                  } catch {
                    setError("Image upload failed. Try again.");
                  }
                }}
              />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 h-32 w-full rounded-xl object-cover border border-brand-gray-light" />
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-brand-red-pale px-3 py-2 text-sm text-brand-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-light disabled:opacity-60"
            >
              {loading ? "Publishing…" : "Report Found Item"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="rounded-xl bg-green-pale/80 px-4 py-3 text-sm text-dark-2">
              <p className="font-semibold text-green">Listing #{result.id} published.</p>
            </div>
            <MatchSuggestions
              matches={result.suggestedMatches}
              heading="Similar lost reports (best match first)"
              subheading="We searched lost listings for possible matches."
            />
            <div className="flex flex-wrap gap-3">
              <Link to={`/items/${result.id}`} className="rounded-xl border border-brand-gray-light px-4 py-2 text-sm font-semibold text-dark-2 hover:bg-brand-gray-bg">
                Open my listing
              </Link>
              <Link to="/" className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-light">
                Back to all items
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}