import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 rounded-lg outline-none ring-green/40 focus-visible:ring-2 ${className}`}
    >
      <img src="/logo.svg" alt="" width={40} height={40} className="size-10 shrink-0" />
      <div className="flex flex-col leading-tight [font-family:var(--font-syne)]">
        <span className="text-base font-bold tracking-tight text-dark sm:text-lg">
          LASU Lost &amp; Found
        </span>
        <span className="text-xs font-medium text-brand-gray">
          Report · Search · Reunite
        </span>
      </div>
    </Link>
  );
}
