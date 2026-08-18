-- FitMatch veritabanı şeması
-- Supabase projesinde: SQL Editor'e yapıştırıp çalıştır.

create extension if not exists "uuid-ossp";

-- Kullanıcı profili (auth.users ile bire bir eşleşir)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  ad text not null,
  kilo_kg numeric,
  boy_cm numeric,
  ilgi_alanlari text[] default '{}',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Spor grupları
create table groups (
  id uuid primary key default uuid_generate_v4(),
  isim text not null,
  spor_turu text not null check (spor_turu in ('kosu', 'fitness', 'bisiklet', 'yuruyus', 'diger')),
  konum text,
  aciklama text,
  olusturan_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Grup üyelikleri
create table group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rol text not null default 'uye' check (rol in ('yonetici', 'uye')),
  katilim_tarihi timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Etkinlikler
create table events (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references groups(id) on delete cascade,
  baslik text not null,
  konum text,
  tarih timestamptz not null,
  olusturan_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Etkinlik katılımcıları
create table event_participants (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  durum text not null default 'gidiyorum' check (durum in ('gidiyorum', 'belki', 'gitmiyorum')),
  primary key (event_id, user_id)
);

-- Kayıtlı aktiviteler (koşu, yürüyüş, bisiklet...)
create table activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  tur text not null check (tur in ('kosu', 'yuruyus', 'bisiklet')),
  mesafe_km numeric not null default 0,
  sure_sn integer not null default 0,
  adim integer,
  kalori integer,
  tarih timestamptz not null default now()
);

create index activities_group_tarih_idx on activities (group_id, tarih desc);
create index activities_user_tarih_idx on activities (user_id, tarih desc);

-- Row Level Security
alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;
alter table activities enable row level security;

-- profiles: herkes görebilir, sadece kendi profilini düzenleyebilir
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- groups: herkes görebilir, giriş yapan herkes grup oluşturabilir
create policy "groups_select_all" on groups for select using (true);
create policy "groups_insert_auth" on groups for insert with check (auth.uid() = olusturan_id);
create policy "groups_update_owner" on groups for update using (auth.uid() = olusturan_id);

-- group_members: herkes görebilir, kullanıcı kendini ekleyip çıkarabilir
create policy "group_members_select_all" on group_members for select using (true);
create policy "group_members_insert_self" on group_members for insert with check (auth.uid() = user_id);
create policy "group_members_delete_self" on group_members for delete using (auth.uid() = user_id);

-- events: grup üyeleri görebilir, üyeler oluşturabilir
create policy "events_select_all" on events for select using (true);
create policy "events_insert_member" on events for insert with check (auth.uid() = olusturan_id);

-- event_participants
create policy "event_participants_select_all" on event_participants for select using (true);
create policy "event_participants_insert_self" on event_participants for insert with check (auth.uid() = user_id);
create policy "event_participants_delete_self" on event_participants for delete using (auth.uid() = user_id);

-- activities: herkes görebilir (liderlik tablosu için), kullanıcı sadece kendi aktivitesini ekleyebilir/silebilir
create policy "activities_select_all" on activities for select using (true);
create policy "activities_insert_own" on activities for insert with check (auth.uid() = user_id);
create policy "activities_delete_own" on activities for delete using (auth.uid() = user_id);

-- Yeni kullanıcı kaydolunca otomatik profil oluştur
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, ad)
  values (new.id, coalesce(new.raw_user_meta_data->>'ad', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
