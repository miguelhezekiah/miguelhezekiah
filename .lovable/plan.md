## Plan

1. Update `src/routes/admin.tsx` so auth restoration has an explicit `authReady` state instead of using `userId === undefined` as the loading sentinel.
2. Replace the manual `isAdmin` state/effect with a gated React Query admin check that only runs after auth is ready and a user exists.
3. Make redirects happen only after auth is ready, so unauthenticated users go to `/admin/login`, non-admin users see “Not authorized,” and valid admins see the editor instead of an endless loading screen.
4. Add basic error handling for the admin lookup so failed checks don’t leave the page stuck on Loading.

## Technical notes

- Keep the current admin security model: no public signup, admin access remains controlled by the `admins` table.
- No database changes are needed.
- Only `src/routes/admin.tsx` should need changes.