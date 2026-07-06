# SkillHubZA Full-Stack Setup

This branch turns the static prototype into a Netlify + Supabase full-stack app foundation.

## What was added

- `app.html`: authenticated app shell for feed, services, professionals, bookings, and messages.
- `netlify/functions/api.js`: server-side API with auth checks, validation, rate limiting, and CORS.
- `supabase/schema.sql`: database tables, indexes, views, profile trigger, and row-level security policies.
- `netlify.toml`: API routing and security headers.
- `.env.example`: required environment variables.

## 1. Revoke exposed GitHub tokens

If a GitHub token was visible in a screenshot or shared anywhere, delete it from GitHub immediately and generate a new one only if needed.

## 2. Create or choose a Supabase project

Open Supabase SQL Editor and run the full contents of:

```sql
supabase/schema.sql
```

Then enable Email auth in Supabase Authentication settings.

## 3. Set Netlify environment variables

In Netlify, go to Site configuration > Environment variables and set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
ALLOWED_ORIGIN=https://your-site.netlify.app
```

Never place `SUPABASE_SERVICE_ROLE_KEY` in browser JavaScript or committed files.

## 4. Deploy

Netlify will run:

```bash
npm run build
```

The build fails if required environment variables are missing. After deploy, open:

```text
/app.html
```

## Security notes

- The browser receives only the public Supabase anon key from `/api/config`.
- The service role key is used only inside Netlify Functions.
- Protected API routes require a valid Supabase access token.
- Inputs are validated server-side with Zod.
- SQL row-level security is enabled on all application tables.
- Security headers are configured in `netlify.toml`.

## Next hardening steps

- Add image/video upload through Supabase Storage with file type and size validation.
- Add moderation/admin workflows for reports.
- Add password reset and email verification UI.
- Add automated tests for API routes and RLS policies.
- Move legacy static pages onto the shared API client or redirect them to `app.html`.
