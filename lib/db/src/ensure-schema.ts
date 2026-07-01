import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type AnyDb = NodePgDatabase<typeof schema>;

/**
 * Idempotent schema bootstrap. Creates every enum type and table only if it
 * does not already exist, so it is safe to run on every server boot and works
 * whether the database is brand new or was created by an older `drizzle-kit
 * push` that predates the escrow tables. This removes the need to run a
 * migration command manually before the app can serve data.
 */
const DDL = /* sql */ `
-- ── Enum types (guarded: ignore if already present) ────────────────────────
DO $$ BEGIN CREATE TYPE deal_type AS ENUM ('real_estate','vehicle','business','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE deal_status AS ENUM ('pending','active','completed','cancelled','disputed','refunded','forfeited'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE transfer_status AS ENUM ('not_listed','listed','transferred'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE transfer_request_status AS ENUM ('pending','approved','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE dispute_status AS ENUM ('open','under_review','resolved_buyer','resolved_seller','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE funds_state AS ENUM ('awaiting_deposit','held','released','refunded','forfeited'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ledger_account AS ENUM ('escrow_cash','buyer_held','seller_payout','platform_revenue','buyer_refund'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ledger_direction AS ENUM ('debit','credit'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE approval_action AS ENUM ('release','refund','forfeit'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','executed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tables ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  national_id text NOT NULL UNIQUE,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id serial PRIMARY KEY,
  title text NOT NULL,
  type deal_type NOT NULL,
  status deal_status NOT NULL DEFAULT 'pending',
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  buyer_id integer NOT NULL REFERENCES users(id),
  seller_id integer NOT NULL REFERENCES users(id),
  description text NOT NULL,
  property_address text,
  vehicle_info text,
  deadline text NOT NULL,
  platform_fee numeric(12,2) NOT NULL DEFAULT '0',
  buyer_signed boolean NOT NULL DEFAULT false,
  seller_signed boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  transfer_status transfer_status NOT NULL DEFAULT 'not_listed',
  transfer_price numeric(12,2),
  transfer_description text,
  transferred_to_id integer REFERENCES users(id),
  transferred_at timestamp
);

CREATE TABLE IF NOT EXISTS contracts (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id),
  terms text NOT NULL,
  refund_conditions text NOT NULL DEFAULT '',
  forfeiture_conditions text NOT NULL DEFAULT '',
  buyer_signed boolean NOT NULL DEFAULT false,
  seller_signed boolean NOT NULL DEFAULT false,
  buyer_signed_at timestamp,
  seller_signed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disputes (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id),
  reason text NOT NULL,
  evidence text,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution text,
  opened_by integer NOT NULL REFERENCES users(id),
  resolved_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id),
  event text NOT NULL,
  description text NOT NULL,
  actor_name text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS templates (
  id serial PRIMARY KEY,
  name text NOT NULL,
  type deal_type NOT NULL,
  description text NOT NULL,
  terms text NOT NULL,
  refund_conditions text NOT NULL,
  forfeiture_conditions text NOT NULL
);

CREATE TABLE IF NOT EXISTS transfer_requests (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id),
  from_user_id integer NOT NULL REFERENCES users(id),
  to_user_id integer NOT NULL REFERENCES users(id),
  price text NOT NULL,
  message text,
  status transfer_request_status NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id),
  txn_group text NOT NULL,
  account ledger_account NOT NULL,
  direction ledger_direction NOT NULL,
  amount numeric(14,2) NOT NULL,
  memo text NOT NULL DEFAULT '',
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_funds (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id) UNIQUE,
  state funds_state NOT NULL DEFAULT 'awaiting_deposit',
  held_amount numeric(14,2) NOT NULL DEFAULT '0',
  frozen integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approvals (
  id serial PRIMARY KEY,
  deal_id integer NOT NULL REFERENCES deals(id),
  action approval_action NOT NULL,
  amount numeric(14,2) NOT NULL,
  reason text NOT NULL DEFAULT '',
  status approval_status NOT NULL DEFAULT 'pending',
  maker_id integer NOT NULL REFERENCES users(id),
  checker_id integer REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT now(),
  decided_at timestamp
);

-- Password column for email auth (added to existing users tables too).
ALTER TABLE users ADD COLUMN IF NOT EXISTS password text;

-- Editable, site-wide settings the admin controls (single row, id = 1).
CREATE TABLE IF NOT EXISTS site_settings (
  id serial PRIMARY KEY,
  site_name text NOT NULL DEFAULT 'عربون',
  tagline text NOT NULL DEFAULT 'ثقتك محفوظة',
  platform_fee_percent numeric(5,2) NOT NULL DEFAULT '2',
  support_email text NOT NULL DEFAULT 'support@arbon.sa',
  support_phone text NOT NULL DEFAULT '920000000',
  about_text text NOT NULL DEFAULT 'منصّة ضمان رقمية تحفظ مبلغ العربون بين البائع والمشتري حتى إتمام الصفقة.'
);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS bank_name text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS bank_iban text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS bank_account_holder text NOT NULL DEFAULT '';
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
`;

export async function ensureSchema(db: AnyDb): Promise<void> {
  await db.execute(sql.raw(DDL));
}
