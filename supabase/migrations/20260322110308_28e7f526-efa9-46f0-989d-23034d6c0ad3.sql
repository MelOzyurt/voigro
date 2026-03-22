
CREATE TABLE public.organization_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  activated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, module_key)
);

ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org modules"
  ON public.organization_modules FOR SELECT TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners can manage org modules"
  ON public.organization_modules FOR ALL TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'owner'::app_role))
  WITH CHECK (organization_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Admins can manage all modules"
  ON public.organization_modules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_updated_at_organization_modules
  BEFORE UPDATE ON public.organization_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.seed_default_modules()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.organization_modules (organization_id, module_key, enabled) VALUES
    (NEW.id, 'voice_agent', true),
    (NEW.id, 'booking', false),
    (NEW.id, 'calendar', false),
    (NEW.id, 'public_booking_page', false),
    (NEW.id, 'crm', false),
    (NEW.id, 'marketing', false);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_org_created_seed_modules
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION seed_default_modules();
