
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS requested_business_number TEXT;

ALTER TABLE public.phone_setups
ADD COLUMN IF NOT EXISTS paired_by_admin_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paired_by_admin_id UUID,
ADD COLUMN IF NOT EXISTS pairing_status TEXT NOT NULL DEFAULT 'unpaired';

-- Admin RLS: admins can manage all phone setups
CREATE POLICY "Platform admins can manage all phone setups"
ON public.phone_setups FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
