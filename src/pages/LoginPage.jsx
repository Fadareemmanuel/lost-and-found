import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import GoogleAuthSection from "../components/GoogleAuthSection";

const inputClass =
  "w-full rounded-xl border border-brand-gray-light bg-white px-4 py-3 text-dark shadow-sm outline-none transition placeholder:text-brand-gray focus:border-green focus:ring-2 focus:ring-green/25";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
const sessionExpired = params.get("session") === "expired";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: form });
      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
      {sessionExpired && (
  <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
    ⚠️ Your session expired. Please log in again.
  </div>
)}
      <div className="rounded-2xl border border-brand-gray-light bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-dark [font-family:var(--font-syne)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-brand-gray">
          Use your <strong className="text-dark-2">school Google account</strong>. Only approved
          email domains can access this app.
        </p>

        <div className="mt-8">
          <GoogleAuthSection subtitle="We create your profile the first time you sign in." />
        </div>

        <div className="mt-8 border-t border-brand-gray-light pt-6">
          <button
            type="button"
            onClick={() => setShowLegacy((s) => !s)}
            className="text-sm font-medium text-green hover:text-green-light"
          >
            {showLegacy ? "Hide" : "Staff:"} legacy email &amp; password
          </button>
          {showLegacy && (
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-brand-gray">
                For accounts created before Google Sign-In. New users should use Google above.
              </p>
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-medium text-dark-2"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  className={inputClass}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-medium text-dark-2"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  className={inputClass}
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {error && (
                <p className="rounded-lg bg-brand-red-pale px-3 py-2 text-sm text-brand-red">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border border-brand-gray-light bg-white py-3 text-sm font-semibold text-dark-2 shadow-sm transition hover:bg-brand-gray-bg disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Log in with password"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-brand-gray">
          New here?{" "}
          <Link to="/register" className="font-semibold text-green hover:text-green-light">
            Use Google on the register page
          </Link>
        </p>
      </div>
    </div>
  );
}
