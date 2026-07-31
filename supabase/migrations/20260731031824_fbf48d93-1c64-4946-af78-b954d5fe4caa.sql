create or replace function public.notify_on_emergency_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  who text;
begin
  select coalesce(full_name, 'A family member') into who from public.profiles where id = new.user_id;

  insert into public.notifications (user_id, title, body, category)
  values (new.user_id, 'Emergency alert dispatched',
    'Your contacts and nearby responders were notified with your live location.', 'emergency');

  insert into public.notifications (user_id, title, body, category)
  select fm.member_user_id,
         'SOS from ' || coalesce(who, 'a family member'),
         coalesce(who, 'A family member') || ' triggered an emergency SOS' ||
           case when new.latitude is not null
                then ' at ' || round(new.latitude::numeric, 4) || ', ' || round(new.longitude::numeric, 4)
                else '' end || '.',
         'emergency'
  from public.family_members fm
  where fm.owner_id = new.user_id
    and fm.member_user_id is not null
    and fm.member_user_id <> new.user_id;

  insert into public.notifications (user_id, title, body, category)
  select fm.owner_id,
         'SOS from ' || coalesce(who, 'a family member'),
         coalesce(who, 'A family member') || ' triggered an emergency SOS.',
         'emergency'
  from public.family_members fm
  where fm.member_user_id = new.user_id
    and fm.owner_id <> new.user_id;

  return new;
end;
$$;

revoke execute on function public.notify_on_emergency_event() from public, anon;

drop trigger if exists on_emergency_event_created on public.emergency_events;
create trigger on_emergency_event_created
after insert on public.emergency_events
for each row execute function public.notify_on_emergency_event();