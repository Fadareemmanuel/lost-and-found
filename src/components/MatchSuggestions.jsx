import { Link } from "react-router-dom";

export default function MatchSuggestions({
  matches,
  heading = "Suggested matches",
  subheading,
  emptyMessage = "No similar listings yet — check back later or browse all items.",
}) {
  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-gray-light bg-brand-gray-bg/50 px-4 py-6 text-center text-sm text-brand-gray">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-dark [font-family:var(--font-syne)]">{heading}</h2>
        {subheading ? <p className="mt-1 text-sm text-brand-gray">{subheading}</p> : null}
      </div>
      <ul className="space-y-3">
        {matches.map(({ item, score, breakdown }) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-brand-gray-light bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-pale px-2 py-0.5 text-xs font-semibold uppercase text-green">
                  {item.type}
                </span>
                <span className="text-xs font-medium text-brand-gray">
                  Match score: <strong className="text-dark">{score}</strong>
                  /100
                </span>
              </div>
              <p className="mt-1 font-semibold text-dark">{item.title}</p>
              <p className="line-clamp-2 text-sm text-brand-gray">{item.description}</p>
              {(item.color || item.size_bucket || item.category) && (
                <p className="mt-2 text-xs text-dark-2">
                  {[item.color, item.size_bucket, item.category].filter(Boolean).join(" · ")}
                </p>
              )}
              {breakdown && (
                <p className="mt-1 text-[11px] text-brand-gray">
                  Category {Math.round(breakdown.category)} · Colour {Math.round(breakdown.color)} ·
                  Size {Math.round(breakdown.size)} · Title {Math.round(breakdown.title)} · Desc{" "}
                  {Math.round(breakdown.description)}
                </p>
              )}
            </div>
            <Link
              to={`/items/${item.id}`}
              className="shrink-0 rounded-lg bg-green px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-light"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
