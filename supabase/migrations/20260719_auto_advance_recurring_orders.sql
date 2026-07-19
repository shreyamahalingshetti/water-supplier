update public.recurring_orders
set next_delivery = (next_delivery + (frequency_days * interval '1 day'))::date
where is_active = true
  and next_delivery = current_date;