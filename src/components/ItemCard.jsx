import { Link } from "react-router-dom";

const typeStyles = {
  lost: "bg-brand-red-pale text-brand-red ring-1 ring-brand-red/20",
  found: "bg-green-pale text-green ring-1 ring-green/20",
};

const statusStyles = {
  open: "text-green",
  returned: "text-brand-gray",
};

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  const apiBase = import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE.replace(/\/$/, "").trim()
    : import.meta.env.DEV
      ? "http://localhost:4000/api"
      : "https://lasu-lost-and-found-api.onrender.com/api";
  return `${apiBase.replace(/\/api$/, "")}${imageUrl}`;
}

export default function ItemCard({ item }) {
  const typeClass = typeStyles[item.type] ?? "bg-brand-gray-light text-brand-gray";
  const statusClass = statusStyles[item.status] ?? "text-brand-gray";
  const imgSrc = getImageUrl(item.image_url);

  return (
    <article className="group flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-brand-gray-light bg-white shadow-sm transition-all duration-300 hover:border-green-mid/60 hover:shadow-xl hover:scale-[1.03] cursor-pointer">
        {imgSrc ? (
        <div className="aspect-[16/10] w-full overflow-hidden bg-brand-gray-bg">
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full bg-gradient-to-br from-green-pale to-gold-pale" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeClass}`}
          >
            {item.type}
          </span>
          <span className={`text-xs font-medium capitalize ${statusClass}`}>
            {item.status}
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-snug text-dark [font-family:var(--font-syne)]">
          {item.title}
        </h3>
        {(item.category || item.color || item.size_bucket) && (
          <div className="flex flex-wrap gap-1.5">
            {item.category ? (
              <span className="rounded-md bg-brand-gray-light/90 px-2 py-0.5 text-[11px] font-medium capitalize text-dark-2">
                {item.category.replace(/_/g, " ")}
              </span>
            ) : null}
            {item.color ? (
              <span className="rounded-md bg-gold-pale px-2 py-0.5 text-[11px] font-medium text-dark-2">
                {item.color}
              </span>
            ) : null}
            {item.size_bucket ? (
              <span className="rounded-md bg-green-pale px-2 py-0.5 text-[11px] font-medium capitalize text-green">
                {item.size_bucket}
              </span>
            ) : null}
          </div>
        )}
        <p className="line-clamp-2 text-sm text-brand-gray">{item.description}</p>
        <p className="text-sm text-dark-2">
          <span className="text-brand-gray">Where · </span>
          {item.location?.trim() || "Not specified"}
        </p>
        <Link
          to={`/items/${item.id}`}
          className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-green hover:text-green-light"
        >
          View details
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
