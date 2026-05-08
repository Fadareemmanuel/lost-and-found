import { Link } from "react-router-dom";
import GoogleAuthSection from "../components/GoogleAuthSection";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <div className="rounded-2xl border border-brand-gray-light bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-dark [font-family:var(--font-syne)]">
          Join with Google
        </h1>
        <p className="mt-2 text-sm text-brand-gray">
          Accounts are limited to your school&apos;s Google domain. No separate password is
          needed.
        </p>

        <div className="mt-8">
          <GoogleAuthSection />
        </div>

        <p className="mt-8 text-center text-sm text-brand-gray">
          Already joined?{" "}
          <Link to="/login" className="font-semibold text-green hover:text-green-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
