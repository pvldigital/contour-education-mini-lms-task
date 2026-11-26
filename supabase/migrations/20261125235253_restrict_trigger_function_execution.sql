-- Trigger functions should not be callable through the Data API.
revoke all on function public.handle_new_user() from public;
revoke all on function public.set_updated_at() from public;
