# Junior Hub — Admin Dashboard

The admin panel of Junior Hub, as its own Next.js app (moved out of `junior-hub-eg/Frontend` on 26 Oct 2026).
It talks to the same .NET backend (`junior-hub-eg/Backend`), and only the admin account can sign in.

## Run locally

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to the backend
npm install
npm run dev                  # http://localhost:3001
```

Open `/` — it goes to `/admin/login`, then to `/admin/dashboard` after signing in.

## Environment

| Variable | What |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The backend, e.g. `https://jrhub.runasp.net` |
| `NEXT_PUBLIC_MAIN_SITE_URL` | Optional: the students' and mentors' site, for the "Student or mentor? Sign in here" link |

The backend must list this app's address in `AllowedOrigins` (CORS), or the browser blocks the API calls.

## Structure

- `app/admin/(panel)/*` — the pages (dashboard, students, squads and squad workspace, mentors, tracks, notifications, roles, projects, assignments, certificates, reports, approvals, security, settings, admins).
- `components/admin/*` — the page components; `lib/admin-api.ts` — every admin API call.
- `proxy.ts` — sends anyone who is not a signed-in admin to `/admin/login`.
- `lib/i18n` — English and Arabic (RTL); new text uses `t()` with its Arabic in `lib/i18n/ar/`.
