
-- Create offers table for promotional offers
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table for discount codes
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_usage_limit INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table for referral program
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_reward_type TEXT CHECK (referrer_reward_type IN ('percentage', 'fixed_amount', 'credits')),
  referrer_reward_value DECIMAL(10,2),
  referred_reward_type TEXT CHECK (referred_reward_type IN ('percentage', 'fixed_amount', 'credits')),
  referred_reward_value DECIMAL(10,2),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id, invoice_id)
);

-- Create offer usage tracking table
CREATE TABLE public.offer_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add discount columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN discount_type TEXT,
ADD COLUMN discount_source_id UUID,
ADD COLUMN discount_source_type TEXT CHECK (discount_source_type IN ('coupon', 'offer', 'referral')),
ADD COLUMN original_amount DECIMAL(10,2);

-- Enable Row Level Security
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers
CREATE POLICY "Everyone can view active offers"
  ON public.offers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage offers"
  ON public.offers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for coupons
CREATE POLICY "Everyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for coupon usage
CREATE POLICY "Users can view their own coupon usage"
  ON public.coupon_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create coupon usage"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all coupon usage"
  ON public.coupon_usage FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for offer usage
CREATE POLICY "Users can view their own offer usage"
  ON public.offer_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create offer usage"
  ON public.offer_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all offer usage"
  ON public.offer_usage FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_offers_active ON public.offers(is_active);
CREATE INDEX idx_offers_dates ON public.offers(start_date, end_date);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_coupon_usage_user ON public.coupon_usage(user_id);
CREATE INDEX idx_offer_usage_user ON public.offer_usage(user_id);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION apply_coupon(
  p_coupon_code TEXT,
  p_user_id UUID,
  p_order_amount DECIMAL
)
RETURNS JSON AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_discount_amount DECIMAL;
  v_user_usage_count INTEGER;
  v_result JSON;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = p_coupon_code
    AND is_active = true
    AND start_date <= NOW()
    AND end_date >= NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired coupon code');
  END IF;

  -- Check usage limits
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon usage limit exceeded');
  END IF;

  -- Check user usage limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.coupon_usage
  WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

  IF v_coupon.user_usage_limit IS NOT NULL AND v_user_usage_count >= v_coupon.user_usage_limit THEN
    RETURN json_build_object('valid', false, 'error', 'You have already used this coupon');
  END IF;

  -- Check minimum order amount
  IF p_order_amount < v_coupon.min_order_amount THEN
    RETURN json_build_object('valid', false, 'error', 'Minimum order amount not met');
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := (p_order_amount * v_coupon.discount_value / 100);
    IF v_coupon.max_discount_amount IS NOT NULL THEN
      v_discount_amount := LEAST(v_discount_amount, v_coupon.max_discount_amount);
    END IF;
  ELSE
    v_discount_amount := v_coupon.discount_value;
  END IF;

  -- Ensure discount doesn't exceed order amount
  v_discount_amount := LEAST(v_discount_amount, p_order_amount);

  RETURN json_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'discount_amount', v_discount_amount,
    'discount_type', v_coupon.discount_type,
    'title', v_coupon.title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
