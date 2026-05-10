## Root cause

With TanStack Router's dot-naming, `admin.tsx` (route `/admin`) becomes the parent layout of `admin.login.tsx` (route `/admin/login`). `admin.tsx` does not render an `<Outlet />`, so when redirecting to `/admin/login` the parent admin component keeps rendering its own UI ("Redirecting…") and the login form never appears. That's why the screen is stuck even though the URL flips to `/admin/login`.

## Fix

1. Rename `src/routes/admin.tsx` to `src/routes/admin.index.tsx` so `/admin` is a leaf route, not a parent layout. `admin.login.tsx` then resolves independently and the login form actually renders.
2. Leave `admin.login.tsx` as-is.
3. Verify in the preview:
   - Visiting `/admin` while signed out redirects to `/admin/login` and shows the email/password form.
   - Signing in with the existing admin account lands on `/admin` and shows the editor tabs.
   - Signing out from `/admin` returns to `/admin/login`.

## Notes

- No DB changes. No auth changes. Pure routing fix.
- `src/routeTree.gen.ts` regenerates automatically; do not edit it.