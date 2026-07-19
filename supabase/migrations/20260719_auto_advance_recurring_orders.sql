create extension if not exists pg_cron;

create or replace function public.advance_due_recurring_orders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.recurring_orders
  set next_delivery = (next_delivery + frequency_days)::date
  where is_active = true
    and next_delivery <= current_date;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from cron.job
    where jobname = 'advance-recurring-orders-next-delivery'
  ) then
    perform cron.schedule(
      'advance-recurring-orders-next-delivery',
      '0 * * * *',
      $$select public.advance_due_recurring_orders();$$
    );
  end if;
end
$$;