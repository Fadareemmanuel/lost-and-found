import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotificationPoll } from "../hooks/useNotificationPoll";
import Logo from "./Logo";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-2 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
    isActive
      ? "bg-green-pale text-green"
      : "text-dark hover:bg-brand-gray-light/80"
  }`;

export default function Navbar() {
  const { user, isAuthed, logout, token } = useAuth();
  const { unreadCount } = useNotificationPoll(token);

  return (
    <header className="sticky top-0 z-20 border-b border-brand-gray-light bg-brand-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto max-w-[calc(100vw-120px)]">
          <NavLink to="/" className={navLinkClass} end>
            Browse
          </NavLink>
          {isAuthed && (
            <NavLink to="/notifications" className={navLinkClass}>
              <span className="relative inline-flex items-center gap-1">
                Alerts
                {unreadCount > 0 ? (
                  <span className="min-w-[1.125rem] rounded-full bg-brand-red px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          )}
         {isAuthed && (
  <>
    <NavLink to="/lost/new" className={navLinkClass}>
      Lost
    </NavLink>
    <NavLink to="/found/new" className={navLinkClass}>
      Found
    </NavLink>
  </>
)}
          {user?.role === "admin" && (
            <NavLink to="/admin/claims" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          {!isAuthed ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="ml-1 rounded-lg bg-green px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-green-light"
              >
                Join
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-brand-gray-light bg-white px-2 py-1.5 text-xs font-medium text-dark-2 shadow-sm transition hover:bg-brand-gray-bg"
              >
                Log out
              </button>
              <div className="relative cursor-pointer group" title={user?.name}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-xs font-bold text-white shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="absolute -bottom-8 right-0 hidden group-hover:block bg-dark text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-50">
                  {user?.name || "User"}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}