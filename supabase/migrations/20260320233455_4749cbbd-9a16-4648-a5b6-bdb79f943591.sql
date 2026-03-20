
-- Trigger function: auto-create default ai_agent on new organization
CREATE OR REPLACE FUNCTION public.create_default_agent()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ai_agents (
    organization_id,
    name,
    greeting,
    after_hours_greeting,
    tone,
    response_style,
    language,
    is_active
  ) VALUES (
    NEW.id,
    NEW.name || ' Assistant',
    'Hi! Thanks for calling ' || NEW.name || '. How can I help you today?',
    'Thanks for calling ' || NEW.name || '. We are currently closed, but I can still help you. How can I assist?',
    'friendly',
    'concise',
    'en',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_default_agent();

-- Backfill existing organizations without an agent
INSERT INTO public.ai_agents (organization_id, name, greeting, after_hours_greeting, tone, response_style, language, is_active)
SELECT 
  o.id,
  o.name || ' Assistant',
  'Hi! Thanks for calling ' || o.name || '. How can I help you today?',
  'Thanks for calling ' || o.name || '. We are currently closed, but I can still help you. How can I assist?',
  'friendly',
  'concise',
  'en',
  true
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_agents a WHERE a.organization_id = o.id
);
