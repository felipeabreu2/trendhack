create table public.users (
  email text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  name text null,
  avatar_url text null,
  id uuid not null,
  acabate_pay text null,
  phone text null,
  cpf text null,
  signature uuid null,
  stripe text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint users_signature_fkey foreign KEY (signature) references signature (id)
) TABLESPACE pg_default;

create trigger "Insert user"
after INSERT on users for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://webhook.trendhack.io/webhook/0O99E86F48KQ7YKU16TXD00TIQQPCC6O6M559I2FPEYX9VA434',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

create trigger update_users_updated_at BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();

------------------------------------------------------------------------------------------------

create table public.users_roles (
  id uuid not null default gen_random_uuid (),
  role_id uuid not null,
  "user" uuid not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint users_roles_pkey primary key (id),
  constraint users_roles_role_id_fkey foreign KEY (role_id) references roles (id) on delete CASCADE,
  constraint users_roles_user_fkey foreign KEY ("user") references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists users_roles_role_id_idx on public.users_roles using btree (role_id) TABLESPACE pg_default;

create index IF not exists users_roles_user_id_idx on public.users_roles using btree ("user") TABLESPACE pg_default;

------------------------------------------------------------------------------------------------

create table public.roles (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint roles_pkey primary key (id)
) TABLESPACE pg_default;

------------------------------------------------------------------------------------------------

create table public.user_request (
  id uuid not null default extensions.uuid_generate_v4 (),
  created_at timestamp with time zone not null default now(),
  type jsonb not null,
  influencer_id jsonb null default '["ac557a7c-85da-4884-acba-980aee7504eb"]'::jsonb,
  updated_at timestamp with time zone not null default now(),
  configuration jsonb not null,
  logs uuid null,
  gemas integer not null default 0,
  "user" uuid null,
  status smallint null default '1'::smallint,
  constraint user_influencers_pkey primary key (id),
  constraint user_request_logs_fkey foreign KEY (logs) references logs (id) on delete CASCADE,
  constraint user_request_user_fkey foreign KEY ("user") references users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger "Insert user_request"
after INSERT on user_request for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://webhook.trendhack.io/webhook/0O99E86F48KQ7YKU16TXD00TIQQPCC6O6M559I2FPEYX9VA434',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

------------------------------------------------------------------------------------------------

create table public.videos (
  id uuid not null default extensions.uuid_generate_v4 (),
  influencer_id uuid not null,
  platform text not null,
  url text not null,
  caption text null,
  type text null,
  published_at timestamp with time zone null,
  views_count integer null,
  likes_count integer null,
  comments_count integer null,
  shares_count integer null,
  video_url text null,
  thumbnail_url text null,
  duration double precision null,
  dimensions_width integer null,
  dimensions_height integer null,
  location_name text null,
  location_id text null,
  is_sponsored boolean null default false,
  scraped_at timestamp with time zone null default now(),
  raw_data jsonb null,
  api jsonb null,
  status text not null default 'progress'::text,
  user_request uuid null,
  images jsonb null,
  "taggedUsers" jsonb null,
  "musicInfo" jsonb null,
  "coauthorProducers" jsonb null,
  request_time numeric not null default '0'::numeric,
  mine_type text null,
  "user" uuid null,
  viedeo_type smallint not null default '1'::smallint,
  constraint videos_pkey primary key (id),
  constraint videos_influencer_id_fkey foreign KEY (influencer_id) references pages (id) on delete CASCADE,
  constraint videos_user_fkey foreign KEY ("user") references users (id) on delete CASCADE,
  constraint videos_user_request_fkey foreign KEY (user_request) references user_request (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_videos_influencer_published on public.videos using btree (influencer_id, published_at) TABLESPACE pg_default;

create index IF not exists idx_videos_views_count on public.videos using btree (views_count) TABLESPACE pg_default;

------------------------------------------------------------------------------------------------

create table public.video_agents (
  id uuid not null default gen_random_uuid (),
  video_id uuid not null,
  analysis jsonb not null default '{"status": "progress"}'::jsonb,
  tokens bigint null,
  model text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  type text not null default 'summary'::text,
  business text null,
  simplified jsonb not null default '{"status": "false"}'::jsonb,
  request_time numeric not null default '0'::numeric,
  reply jsonb not null default '{"status": "false"}'::jsonb,
  "user" uuid null,
  constraint video_agents_pkey primary key (id),
  constraint video_agents_id_key unique (id),
  constraint video_agents_user_fkey foreign KEY ("user") references users (id) on delete CASCADE,
  constraint video_agents_video_id_fkey foreign KEY (video_id) references videos (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists video_agents_unique_idx on public.video_agents using btree (id) TABLESPACE pg_default;

create trigger "Insert/Update video_agents"
after INSERT
or
update on video_agents for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://webhook.trendhack.io/webhook/0O99E86F48KQ7YKU16TXD00TIQQPCC6O6M559I2FPEYX9VA434',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

------------------------------------------------------------------------------------------------

create table public.plataform (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  name text not null,
  description text not null,
  visible boolean not null default false,
  image text not null default 'https://plataforms.trendhack.io/'::text,
  slug text null,
  "order" smallint not null default '0'::smallint,
  updated_image jsonb null,
  constraint plataform_pkey primary key (id)
) TABLESPACE pg_default;

create trigger "Insert/Update plataforms"
after INSERT
or
update on plataform for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://webhook.trendhack.io/webhook/0O99E86F48KQ7YKU16TXD00TIQQPCC6O6M559I2FPEYX9VA434',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);


------------------------------------------------------------------------------------------------

create table public.plataform_tools (
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  plataform uuid not null,
  name text not null,
  description text not null,
  visible boolean not null default false,
  id uuid not null default gen_random_uuid (),
  gemas integer not null default 1,
  type text null,
  constraint plataform_tools_pkey primary key (id),
  constraint plataform_tools_plataform_fkey foreign KEY (plataform) references plataform (id) on delete CASCADE
) TABLESPACE pg_default;

------------------------------------------------------------------------------------------------

create table public.signature (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  name text not null,
  gemas integer not null,
  signature_value numeric not null,
  "order" numeric not null default '0'::numeric,
  signature_id text null,
  extra_id text null,
  extra_value numeric null,
  constraint signature_pkey primary key (id)
) TABLESPACE pg_default;

------------------------------------------------------------------------------------------------

create table public.payments (
  created_at timestamp with time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  signature uuid null,
  value numeric not null,
  status text not null,
  qrcode text null,
  method text not null,
  transaction_id text not null,
  id uuid not null default gen_random_uuid (),
  gemas integer not null default 0,
  currency text null,
  subscription text null,
  request jsonb null,
  "user" uuid null,
  constraint payments_pkey primary key (id),
  constraint payments_signature_fkey foreign KEY (signature) references signature (id),
  constraint payments_user_fkey foreign KEY ("user") references users (id)
) TABLESPACE pg_default;

------------------------------------------------------------------------------------------------

create table public.pages (
  id uuid not null default extensions.uuid_generate_v4 (),
  username text not null,
  platform text not null,
  full_name text null,
  bio text null,
  profile_pic_url text not null default 'https://cscrm.ai/wp-content/uploads/2024/12/sem-foto.png'::text,
  followers_count integer null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_scraped_at timestamp with time zone null,
  "followsCount" integer null,
  "hasChannel" boolean null,
  "isBusinessAccount" boolean null,
  "joinedRecently" boolean null,
  "businessCategoryName" text null,
  private boolean null,
  verified boolean null,
  profile_id text null,
  "relatedProfiles" jsonb null,
  "latestIgtvVideos" jsonb null,
  "postsCount" integer null,
  "latestPosts" jsonb null,
  "externalUrls" jsonb null,
  user_created uuid null,
  visible boolean not null default true,
  region text null,
  plataform_id uuid null,
  scraping boolean not null default false,
  constraint influencers_pkey primary key (id),
  constraint influencers_username_platform_key unique (username, platform),
  constraint pages_plataform_id_fkey foreign KEY (plataform_id) references plataform (id)
) TABLESPACE pg_default;

create trigger update_influencers_updated_at BEFORE
update on pages for EACH row
execute FUNCTION update_updated_at_column ();

create trigger "Insert pages"
after INSERT on pages for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://webhook.trendhack.io/webhook/0O99E86F48KQ7YKU16TXD00TIQQPCC6O6M559I2FPEYX9VA434',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

-------------------------------------------------------------------------------------------

create table public.history (
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  content text not null,
  id uuid not null default gen_random_uuid (),
  constraint history_pkey primary key (id),
  constraint history_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;