# Supabase setup for CodeBench

The frontend scaffold is included, but it is intentionally not connected until you create your own Supabase project. GitHub Pages remains the static host. Supabase Auth manages sessions; Postgres stores progress.

1. Create a Supabase project at https://supabase.com/. Choose a strong database password and keep it private.
2. In Project Settings / API (or Connect), copy the Project URL and the publishable key (or legacy anon key). Put only those two values into `assets/js/supabase-config.js`. Never put a secret/service_role key in frontend code.
3. Open SQL Editor and run `supabase/schema.sql`. Review policies before production use; this schema is a starting point.
4. In Authentication / URL Configuration, set Site URL to your GitHub Pages URL. Add both the deployed URL and local test URL to Redirect URLs. For a project site, the URL often looks like `https://USERNAME.github.io/REPOSITORY/`; use your actual URL.
5. Under Authentication providers, enable Email/password. Decide whether email confirmation is required and configure SMTP if you need reliable delivery to students.
6. Test account creation, email confirmation (if enabled), sign-in, sign-out, and lesson completion using two separate student accounts. Verify each account cannot read or alter the other's records.
7. Publish the static files to GitHub Pages over HTTPS. Do not commit database passwords or Supabase secret keys.

## What is currently wired

- `auth.html` contains a sign-in/create-account UI.
- `assets/js/supabase-client.js` loads the Supabase JS client only after the placeholder config is replaced.
- `assets/js/lesson-progress.js` saves completion locally and attempts a Supabase upsert when configured and signed in.
- `supabase/schema.sql` defines profiles, lesson progress and activity attempts with row-level security.

## Known next steps

- Add profile creation on signup (trigger or trusted workflow).
- Add a progress dashboard and merge local progress into the account after sign-in.
- Record activity attempts server-side or enforce allowed activity IDs and grading rules before treating scores as trusted. Client-side scores can be manipulated.
- Add password reset, email confirmation UX, loading/error states and account deletion/export.
- Review policies and enable only required table privileges. Never use a service-role key in the browser.
