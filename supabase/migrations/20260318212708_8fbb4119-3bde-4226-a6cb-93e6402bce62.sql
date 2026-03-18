
-- Timestamp update function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. platform_settings
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  default_voice_provider TEXT NOT NULL DEFAULT 'telnyx',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform settings readable by authenticated" ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. organizations
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  primary_business_number TEXT,
  website TEXT,
  opening_hours TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  onboarding_status JSONB NOT NULL DEFAULT '{"completed": false}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. user_roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'staff');
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Helper to get user's org
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can view org members" ON public.profiles FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RLS for organizations (tenant isolation)
CREATE POLICY "Users can view own org" ON public.organizations FOR SELECT TO authenticated USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Owners can update own org" ON public.organizations FOR UPDATE TO authenticated USING (id = public.get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

-- 5. ai_agents
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'AI Assistant',
  greeting TEXT,
  after_hours_greeting TEXT,
  tone TEXT NOT NULL DEFAULT 'professional',
  response_style TEXT NOT NULL DEFAULT 'concise',
  language TEXT NOT NULL DEFAULT 'en',
  business_description TEXT,
  special_instructions TEXT,
  fallback_message TEXT,
  max_clarification_attempts INT NOT NULL DEFAULT 3,
  offer_callback_on_fallback BOOLEAN NOT NULL DEFAULT true,
  enabled_actions JSONB NOT NULL DEFAULT '["faq","booking","callback"]'::jsonb,
  escalation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcome_behaviors JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_email TEXT,
  webhook_url TEXT,
  transfer_number TEXT,
  transfer_announcement TEXT,
  business_hours_only_transfer BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org agents" ON public.ai_agents FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Owners admins can manage agents" ON public.ai_agents FOR ALL TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')));
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON public.ai_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. phone_setups
CREATE TABLE public.phone_setups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'telnyx',
  business_number TEXT,
  virtual_number TEXT,
  virtual_application_id TEXT,
  virtual_phone_number_id TEXT,
  routing_enabled BOOLEAN NOT NULL DEFAULT false,
  after_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  ring_staff_first BOOLEAN NOT NULL DEFAULT false,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  forwarding_confirmed BOOLEAN NOT NULL DEFAULT false,
  last_test_call_at TIMESTAMPTZ,
  provisioned_at TIMESTAMPTZ,
  provider_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.phone_setups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org phone setups" ON public.phone_setups FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Owners admins can manage phone setups" ON public.phone_setups FOR ALL TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')));
CREATE TRIGGER update_phone_setups_updated_at BEFORE UPDATE ON public.phone_setups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. calls
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT,
  provider_call_id TEXT,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  duration_seconds INT,
  status TEXT NOT NULL DEFAULT 'initiated',
  outcome TEXT,
  sentiment TEXT,
  handled_by TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  cost_cents INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org calls" ON public.calls FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE INDEX idx_calls_org_id ON public.calls(organization_id);
CREATE INDEX idx_calls_started_at ON public.calls(started_at DESC);
CREATE INDEX idx_calls_provider_call_id ON public.calls(provider_call_id);
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON public.calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. transcripts
CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  extracted_intent TEXT,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  internal_notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org transcripts" ON public.transcripts FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE INDEX idx_transcripts_call_id ON public.transcripts(call_id);
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. actions
CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  call_id UUID REFERENCES public.calls(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  assigned_to UUID REFERENCES auth.users(id),
  priority TEXT NOT NULL DEFAULT 'normal',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'call',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org actions" ON public.actions FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can manage org actions" ON public.actions FOR ALL TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE INDEX idx_actions_org_id ON public.actions(organization_id);
CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. knowledge_items
CREATE TABLE public.knowledge_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org knowledge items" ON public.knowledge_items FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can manage org knowledge items" ON public.knowledge_items FOR ALL TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE INDEX idx_knowledge_items_org_type ON public.knowledge_items(organization_id, type);
CREATE TRIGGER update_knowledge_items_updated_at BEFORE UPDATE ON public.knowledge_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. billing_accounts
CREATE TABLE public.billing_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_price_cents INT NOT NULL DEFAULT 0,
  included_usage_units INT NOT NULL DEFAULT 0,
  used_usage_units INT NOT NULL DEFAULT 0,
  overage_rate_cents INT NOT NULL DEFAULT 25,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  payment_method_last4 TEXT,
  payment_method_expiry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org billing" ON public.billing_accounts FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Owners can manage billing" ON public.billing_accounts FOR ALL TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));
CREATE TRIGGER update_billing_accounts_updated_at BEFORE UPDATE ON public.billing_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. invoices
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
  invoice_number TEXT,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  subscription_amount_cents INT NOT NULL DEFAULT 0,
  overage_amount_cents INT NOT NULL DEFAULT 0,
  total_cents INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org invoices" ON public.invoices FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default platform settings
INSERT INTO public.platform_settings (default_voice_provider) VALUES ('telnyx');
