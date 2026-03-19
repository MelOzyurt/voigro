ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS llm_provider TEXT NOT NULL DEFAULT 'lovable',
  ADD COLUMN IF NOT EXISTS llm_api_key TEXT,
  ADD COLUMN IF NOT EXISTS llm_model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS llm_language TEXT NOT NULL DEFAULT 'en';