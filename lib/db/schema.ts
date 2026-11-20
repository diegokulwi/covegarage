/**
 * Tablas de la base de datos y carga inicial.
 *
 * `ensureReady()` crea las tablas que falten y, la primera vez, copia los datos que hoy viven en
 * lib/data/* (coches, reseñas y preguntas frecuentes) a la base de datos, para que la web siga
 * mostrando exactamente lo mismo. Después la fuente de verdad es la base de datos: lo que se cambia
 * en el panel manda y lib/data/* queda solo como copia inicial / plan B si la base de datos no está configurada.
 */
import { isDbConfigured, query, queryOne, withTransaction } from "@/lib/db";
import { mockCars } from "@/lib/data/mockCars";
import { faqs } from "@/lib/data/faqs";
import { siteContent } from "@/lib/data/mockSettings";

const SCHEMA_VERSION = 3;

const TABLES = [
  "app_meta",
  "cars",
  "slug_redirects",
  "clients",
  "inquiries",
  "testimonials",
  "faqs",
  "admin_users",
  "rate_events",
  "audit_log",
  "car_videos",
];

// Supabase publica por su API todas las tablas del esquema "public". Se activa la seguridad por filas SIN ninguna
// regla (por esa API no entra nadie) y se quitan los permisos a sus roles públicos. La web y el panel entran con la
// conexión directa a Postgres (rol dueño de las tablas), que no se ve afectada. En otros Postgres no cambia nada.
const SECURITY = `
${TABLES.map((t) => `alter table ${t} enable row level security;`).join("\n")}
do $$
declare t text;
begin
  foreach t in array array[${TABLES.map((t) => `'${t}'`).join(",")}] loop
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on table public.%I from anon', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on table public.%I from authenticated', t);
    end if;
  end loop;
end $$;
`;

const DDL = `
create table if not exists app_meta (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists cars (
  id text primary key,
  position integer not null default 0,
  slug text not null unique,
  estado text not null default 'disponible',
  data json not null,
  sold_at date,
  sold_price integer,
  sold_client_id integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cars_estado_idx on cars (estado);

create table if not exists slug_redirects (
  old_slug text primary key,
  car_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id serial primary key,
  name text not null default '',
  phone text not null default '',
  phone_norm text not null default '',
  email text not null default '',
  email_norm text not null default '',
  status text not null default 'nuevo',
  source text not null default 'manual',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_phone_idx on clients (phone_norm);
create index if not exists clients_email_idx on clients (email_norm);

create table if not exists inquiries (
  id serial primary key,
  client_id integer not null references clients (id) on delete cascade,
  kind text not null,
  car_id text,
  car_label text not null default '',
  message text not null default '',
  payload jsonb not null default '{}'::jsonb,
  source text not null default 'web',
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists inquiries_client_idx on inquiries (client_id, created_at desc);
create index if not exists inquiries_created_idx on inquiries (created_at desc);

create table if not exists testimonials (
  id serial primary key,
  position integer not null default 0,
  name text not null,
  text text not null,
  rating integer not null default 5,
  date_label text not null default '',
  published boolean not null default true
);

create table if not exists faqs (
  id serial primary key,
  position integer not null default 0,
  question text not null,
  answer text not null,
  published boolean not null default true
);

create table if not exists admin_users (
  id serial primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists rate_events (
  id bigserial primary key,
  bucket text not null,
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_events_idx on rate_events (bucket, key, at desc);

create table if not exists audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_email text not null default '',
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  summary text not null default ''
);
create index if not exists audit_at_idx on audit_log (at desc);

create table if not exists car_videos (
  id serial primary key,
  car_id text not null references cars (id) on delete cascade,
  title text not null default '',
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists car_videos_car_idx on car_videos (car_id, position, id);
`;

declare global {
  // eslint-disable-next-line no-var
  var __cgReady: Promise<void> | undefined;
}

async function currentVersion(): Promise<number> {
  try {
    const row = await queryOne<{ value: number }>("select value from app_meta where key = 'schema_version'");
    return Number(row?.value ?? 0);
  } catch (e: any) {
    if (e?.code === "42P01") return 0; // la tabla aún no existe
    throw e;
  }
}

async function migrateAndSeed(): Promise<void> {
  await withTransaction(async (q) => {
    await q("select pg_advisory_xact_lock(727001)");
    await q(
      `create table if not exists app_meta (
         key text primary key,
         value jsonb not null default 'null'::jsonb,
         updated_at timestamptz not null default now()
       )`
    );
    // Otra instancia puede haber terminado mientras esperábamos el bloqueo.
    const done = await q<{ value: number }>("select value from app_meta where key = 'schema_version'");
    if (Number(done[0]?.value ?? 0) >= SCHEMA_VERSION) return;

    await q(DDL);
    await q(SECURITY);

    const flag = async (key: string) =>
      (await q("select 1 from app_meta where key = $1", [key])).length > 0;
    const setFlag = (key: string) =>
      q(
        "insert into app_meta (key, value) values ($1, 'true'::jsonb) on conflict (key) do nothing",
        [key]
      );

    if (!(await flag("seeded_cars"))) {
      for (let i = 0; i < mockCars.length; i++) {
        const c = mockCars[i];
        await q(
          `insert into cars (id, position, slug, estado, data)
           values ($1, $2, $3, $4, $5::json) on conflict (id) do nothing`,
          [c.id, i, c.slug, c.estado, JSON.stringify(c)]
        );
      }
      await setFlag("seeded_cars");
    }

    if (!(await flag("seeded_faqs"))) {
      for (let i = 0; i < faqs.length; i++) {
        await q("insert into faqs (position, question, answer) values ($1, $2, $3)", [
          i,
          faqs[i].pregunta,
          faqs[i].respuesta,
        ]);
      }
      await setFlag("seeded_faqs");
    }

    if (!(await flag("seeded_testimonials"))) {
      const t = siteContent.testimonios;
      for (let i = 0; i < t.length; i++) {
        await q(
          "insert into testimonials (position, name, text, rating, date_label) values ($1, $2, $3, $4, $5)",
          [i, t[i].nombre, t[i].texto, t[i].puntuacion, t[i].fecha]
        );
      }
      await setFlag("seeded_testimonials");
    }

    await q(
      `insert into app_meta (key, value) values ('schema_version', $1::jsonb)
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [JSON.stringify(SCHEMA_VERSION)]
    );
  });
}

/** Deja la base de datos lista (tablas + datos iniciales). Seguro de llamar muchas veces y en paralelo. */
export function ensureReady(): Promise<void> {
  if (!isDbConfigured()) return Promise.reject(new Error("DATABASE_URL no está configurada"));
  if (!globalThis.__cgReady) {
    globalThis.__cgReady = (async () => {
      if ((await currentVersion()) >= SCHEMA_VERSION) return;
      await migrateAndSeed();
    })().catch((e) => {
      globalThis.__cgReady = undefined; // reintentar en la siguiente petición
      throw e;
    });
  }
  return globalThis.__cgReady;
}

/** Atajo: asegura la base y ejecuta una consulta. */
export async function dbQuery<T extends Record<string, any> = Record<string, any>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureReady();
  return query<T>(text, params);
}
