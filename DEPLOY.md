# Google Sign-In and deployment

## 0. Step-by-step: fix the errors you saw locally

Do these in order after pulling the latest code.

### A) `Provided button width is invalid: 100%`

Google’s button only accepts a **width in pixels** (e.g. `384`), not `"100%"`. This is fixed in the repo (`GoogleAuthSection.jsx`). Restart Vite if it was still running.

### B) `The given origin is not allowed for the given client ID`

Google only allows your app on origins you list for that OAuth client.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Click your **OAuth 2.0 Client ID** (Web client) — the same ID as in `VITE_GOOGLE_CLIENT_ID`.
3. Under **Authorized JavaScript origins**, click **Add URI** and add **exactly**:

   `http://localhost:5173`

   (No trailing slash. Use `http`, not `https`, for local Vite.)

4. Save. Wait **1–5 minutes** for Google’s cache to update, then hard-refresh the app (Cmd+Shift+R).

When you deploy, add your real site too, e.g. `https://your-app.vercel.app`.

### C) `POST .../api/auth/google` **502 Bad Gateway**

That means the browser called **Vite** (`:5173`) as `/api`, and the **dev proxy** could not reach your **Express API** — or the API URL in the app pointed at the wrong host (e.g. `5173` instead of `4000`).

1. In **one terminal** from the project folder, run the API: `npm run server`  
   You should see: `API running on http://localhost:4000`
2. If port **4000** is busy, set `PORT=4010` in `.env` and add `VITE_DEV_API_URL=http://localhost:4010`, then restart **both** Vite and the server.
3. Confirm `vite.config.js` proxies `/api` to **`http://127.0.0.1:4000`** (your API port), **not** to `5173`.
4. Confirm `src/lib/api.js` in dev uses **`http://localhost:4000`** as the API origin by default (not `5173`).

Or run both together: `npm run dev:all`

### D) `Cross-Origin-Opener-Policy would block the window.postMessage call`

Often a **warning** during Google’s FedCM / popup flow. This repo sets Vite’s dev **`Cross-Origin-Opener-Policy: same-origin-allow-popups`** to reduce noise. If issues persist, try another browser or disable strict extensions for `localhost`.

---

## 1. Google Cloud setup (Sign in with Google)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or pick a project.
2. **APIs & Services → Enabled APIs**: ensure **Google+ API** is not required for GIS; Identity is built-in.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins** (add every URL where your site runs):

   - `http://localhost:5173` (Vite dev)
   - `https://your-domain.com` (production frontend)

6. **Authorized redirect URIs** are not required for the “Sign in with Google” button that returns an ID token (Google Identity Services), but add your OAuth redirect URLs if you add other flows later.
7. Copy the **Client ID** (ends with `.apps.googleusercontent.com`).

Put the same Client ID in:

- Server: `GOOGLE_CLIENT_ID`
- Frontend: `VITE_GOOGLE_CLIENT_ID`

## 2. School email restriction

The API checks the **email** on the Google ID token after verification.

- Set **`ALLOWED_EMAIL_DOMAIN`** to your domain **without** `@`, e.g. `lasu.edu.ng`.
- Or set **`ALLOWED_EMAIL_DOMAINS`** to a comma-separated list if you have several suffixes.

Optional stricter check for **Google Workspace** only:

- Set **`REQUIRE_GOOGLE_WORKSPACE_DOMAIN`** to the Workspace domain (must match the `hd` claim on the token). Leave unset if students use consumer Gmail addresses that still end with your school domain (less common).

## 3. Environment variables

Copy `.env.example` to `.env` for local development. Minimum for Google auth:

| Variable | Where |
|----------|--------|
| `GOOGLE_CLIENT_ID` | Server |
| `ALLOWED_EMAIL_DOMAIN` or `ALLOWED_EMAIL_DOMAINS` | Server |
| `JWT_SECRET` | Server |
| `CORS_ORIGINS` | Server (include your frontend URL(s)) |
| `VITE_GOOGLE_CLIENT_ID` | Frontend (build-time) |

For production builds, set `VITE_*` in the **hosting** dashboard before `npm run build`.

Optional:

- `DISABLE_PASSWORD_REGISTER=true` — blocks `/api/auth/register` so only Google can create new accounts.
- `VITE_API_BASE=https://your-api.example.com/api` — required when the frontend is not served from the same origin as the API (see below).

## 4. Making the app public (typical split)

### Frontend (static site)

Deploy the **Vite build** (`dist/`) to any static host, for example:

- [Vercel](https://vercel.com/) — connect the repo, framework “Vite”, set env vars, deploy.
- [Netlify](https://www.netlify.com/) or [Cloudflare Pages](https://pages.cloudflare.com/).

Set **`VITE_GOOGLE_CLIENT_ID`** and **`VITE_API_BASE`** (your public API base URL ending in `/api`) in the host’s environment, then trigger a new build.

### Backend (Node API)

Run **`node server/index.js`** (or use `nodemon` only in dev) on a small VPS or PaaS, for example:

- [Railway](https://railway.app/), [Render](https://render.com/), [Fly.io](https://fly.io/).

Configure the same **`GOOGLE_CLIENT_ID`**, **`JWT_SECRET`**, **`ALLOWED_EMAIL_DOMAIN`**, and **`CORS_ORIGINS`** (your live frontend `https://...` plus `http://localhost:5173` if you still use it).

**SQLite note:** On many hosts the filesystem is **ephemeral**. For a serious public launch, move to a managed database (e.g. PostgreSQL on Neon, Supabase, or Railway) or attach a persistent volume. For demos, SQLite can be enough if the provider keeps disk.

### After deploy

1. Add your **production frontend URL** to Google OAuth **Authorized JavaScript origins**.
2. Update **`CORS_ORIGINS`** on the server to match that URL exactly (scheme + host, no trailing path).
3. Rebuild the frontend whenever **`VITE_*`** values change.

## 5. Local development

- Run the API (`npm run server` or `npm run dev:all`) on **port 4000** (or set `VITE_API_BASE` in `.env` to match your `PORT`).
- The browser calls **`http://localhost:4000/api`** directly in dev (so you are not dependent on the Vite proxy). You can override the origin with **`VITE_DEV_API_URL`** (e.g. `http://localhost:4010`) if the API uses another port.
- If the browser shows **`Cannot POST /api/auth/google`** (HTML error page), something **other than your current API** is often bound to port **4000** (an old Node process without that route). Run `lsof -iTCP:4000 -sTCP:LISTEN`, stop that PID, then start the API again. If the port is busy, this project’s server will log an error and exit instead of silently failing.

## 6. Admin users

Promote a user in the database, e.g. set `role = 'admin'` for their row in `users`. They should sign in with a **school Google account** that passes the domain rules.
