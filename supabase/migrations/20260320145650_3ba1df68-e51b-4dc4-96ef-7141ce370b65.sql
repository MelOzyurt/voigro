ALTER TABLE public.ai_agents
ADD COLUMN IF NOT EXISTS business_hours JSONB NOT NULL DEFAULT '{
  "timezone": "UTC+0",
  "weekly_schedule": {
    "monday":    {"open": true,  "from": "09:00", "to": "17:00"},
    "tuesday":   {"open": true,  "from": "09:00", "to": "17:00"},
    "wednesday": {"open": true,  "from": "09:00", "to": "17:00"},
    "thursday":  {"open": true,  "from": "09:00", "to": "17:00"},
    "friday":    {"open": true,  "from": "09:00", "to": "17:00"},
    "saturday":  {"open": false, "from": "09:00", "to": "13:00"},
    "sunday":    {"open": false, "from": "09:00", "to": "13:00"}
  },
  "public_holidays": {
    "enabled": true,
    "country": "GB",
    "closed_on_holidays": true
  },
  "custom_closures": [],
  "custom_openings": []
}'::jsonb;