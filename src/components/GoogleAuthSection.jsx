import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuthSection({ subtitle }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  if (!clientId) {
    return (
      <div className="rounded-xl border border-gold/40 bg-gold-pale px-4 py-3 text-sm text-dark-2">
        <p className="font-semibold text-dark">Google Sign-In is not configured</p>
        <p className="mt-1 text-brand-gray">
          Add <code className="rounded bg-white/80 px-1">VITE_GOOGLE_CLIENT_ID</code> to{" "}
          <code className="rounded bg-white/80 px-1">.env</code> and restart Vite. See{" "}
          <code className="rounded bg-white/80 px-1">DEPLOY.md</code> for setup steps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subtitle ? <p className="text-sm text-brand-gray">{subtitle}</p> : null}
      <div className="flex w-full max-w-sm justify-center">
        <GoogleLogin
          theme="outline"
          size="large"
          width="384"
          text="continue_with"
          shape="rectangular"
          onSuccess={async (credentialResponse) => {
            setError("");
            const credential = credentialResponse.credential;
            if (!credential) {
              setError("Google did not return a credential.");
              return;
            }
            try {
              const data = await apiFetch("/auth/google", {
                method: "POST",
                body: { credential },
              });
              login(data.token);
              navigate("/");
            } catch (err) {
              setError(err.message);
            }
          }}
          onError={() => setError("Google sign-in was cancelled or failed.")}
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-brand-red-pale px-3 py-2 text-center text-sm text-brand-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
