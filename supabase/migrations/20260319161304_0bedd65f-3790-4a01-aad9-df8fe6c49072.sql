ALTER TABLE public.platform_settings 
ADD COLUMN IF NOT EXISTS provider_api_key TEXT,
ADD COLUMN IF NOT EXISTS provider_api_secret TEXT,
ADD COLUMN IF NOT EXISTS provider_bundle_id TEXT,
ADD COLUMN IF NOT EXISTS provider_connection_id TEXT,
ADD COLUMN IF NOT EXISTS provider_number_type TEXT NOT NULL DEFAULT 'national',
ADD COLUMN IF NOT EXISTS provider_country_code TEXT NOT NULL DEFAULT 'GB';