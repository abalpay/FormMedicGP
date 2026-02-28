-- Remove legacy zero-arg overload to avoid ambiguous RPC resolution.
drop function if exists public.get_dashboard_data();
