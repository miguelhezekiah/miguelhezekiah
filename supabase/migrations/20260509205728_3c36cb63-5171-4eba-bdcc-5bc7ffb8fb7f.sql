
-- is_admin always called as is_admin(auth.uid()) and admins table SELECT policy
-- already lets a user read only their own row, so SECURITY INVOKER is sufficient.
ALTER FUNCTION public.is_admin(UUID) SECURITY INVOKER;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- promote_first_user is only called by the trigger; revoke from API roles.
REVOKE EXECUTE ON FUNCTION public.promote_first_user() FROM PUBLIC, anon, authenticated;
