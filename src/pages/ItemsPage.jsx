import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import ItemCard from "../components/ItemCard";
import { CATEGORY_OPTIONS, SIZE_OPTIONS } from "../lib/itemOptions";

const filterSelectClass =
  "rounded-xl border border-brand-gray-light bg-white px-3 py-2.5 text-sm text-dark shadow-sm outline-none focus:border-green focus:ring-2 focus:ring-green/25";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("open");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

async function load() {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (type) params.set("type", type);
      params.set("status", status);
      if (filterCategory) params.set("category", filterCategory);
      if (filterSize) params.set("size_bucket", filterSize);
      if (filterColor.trim()) params.set("color", filterColor.trim());
      const qs = params.toString();
      const data = await apiFetch(`/items?${qs}`);
      setItems(data);
      console.log(data);
    } catch (err) {
      console.log(err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Initial listings only; use Apply after changing filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-2xl">
       <div 
  className="w-full rounded-2xl bg-gradient-to-r from-green to-green-light px-8 py-10 shadow-md cursor-pointer select-none active:scale-[0.98] transition-transform duration-150"
  onClick={() => document.getElementById('search')?.focus()}
>
  <h1 className="text-3xl font-bold tracking-tight text-white [font-family:var(--font-syne)] sm:text-4xl">
    Find what was lost. Return what was found.
  </h1>
  <p className="mt-3 text-green-pale/90">
    Search open listings, filter by lost or found, then open a listing to claim an item or contact the poster.
  </p>
  <div className="mt-5 flex flex-wrap gap-3">
    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">🔍 Search listings</span>
    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">📦 Post an item</span>
    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">✅ Reunite</span>
  </div>
</div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-brand-gray-light bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:min-w-[200px]">
          <label htmlFor="search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Search
          </label>
          <input
            id="search"
            className="w-full rounded-xl border border-brand-gray-light bg-brand-white px-4 py-2.5 text-dark shadow-sm outline-none placeholder:text-brand-gray focus:border-green focus:ring-2 focus:ring-green/25"
            placeholder="Keys, ID card, backpack…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <div>
          <label htmlFor="filter-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Type
          </label>
          <select
            id="filter-type"
            className={filterSelectClass}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Lost &amp; found</option>
            <option value="lost">Lost only</option>
            <option value="found">Found only</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Status
          </label>
          <select
            id="filter-status"
            className={filterSelectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="returned">Returned</option>
            <option value="all">All</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Category
          </label>
          <select
            className={filterSelectClass}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.value ? o.label : "Any category"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Size
          </label>
          <select
            className={filterSelectClass}
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.value ? o.label : "Any size"}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Colour
          </label>
          <input
            className="w-full rounded-xl border border-brand-gray-light bg-white px-3 py-2.5 text-sm text-dark shadow-sm outline-none focus:border-green focus:ring-2 focus:ring-green/25"
            placeholder="e.g. black"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-light sm:shrink-0"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-brand-red/30 bg-brand-red-pale px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-center text-brand-gray">Loading listings…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-gray-light bg-white/80 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-dark [font-family:var(--font-syne)]">
            No items match
          </p>
          <p className="mt-2 text-sm text-brand-gray">
            Try different keywords or include returned items. Post a new listing if you lost or found something.
          </p>
        </div>
      ) : (
       <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
