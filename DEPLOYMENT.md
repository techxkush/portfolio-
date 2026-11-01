# Deployment checklist

## Before the first deploy

1. Create a Supabase project and run [`supabase/portfolio-content.sql`](supabase/portfolio-content.sql) in its SQL editor.
2. Add these server-only environment variables to the hosting provider:
   - `ADMIN_PASSWORD`: a long, unique password.
   - `ADMIN_SESSION_SECRET`: output from `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.
   - `SUPABASE_URL`: the project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: the service-role key. Never prefix it with `NEXT_PUBLIC_`.
3. Keep the Supabase table private. Do not create public or authenticated-role policies for it.
4. Run the checks below, then deploy with the provider's Node.js runtime (not static export).

The first production page request reads the checked-in `src/data/portfolio-content.json` and uses it as the initial content if the database row is empty. Admin changes are then saved in Supabase and persist across deployments.

## Checks

```sh
npm run typecheck
npm run build
```

After deployment, verify `/` loads, `/admin` asks for a password, an incorrect password is rejected, a correct password opens the editor, saving a harmless edit updates the public page, and sign out returns to the login screen. The session cookie is HTTP-only, secure in production, same-site strict, and expires after eight hours.

Do not deploy without all four production environment variables. `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` protect the editor; Supabase credentials provide durable production storage. Local development continues to save to the JSON file.
