-- AI Financial Insights Table
CREATE TABLE IF NOT EXISTS public.ai_financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('revenue_optimization', 'churn_prediction', 'cash_flow_forecast', 'fraud_alert', 'cost_optimization', 'pricing_recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'warning', 'info', 'success')),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  impact_amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  action_taken BOOLEAN DEFAULT false,
  action_metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Revenue Analytics Table
CREATE TABLE IF NOT EXISTS public.revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  mrr NUMERIC DEFAULT 0,
  arr NUMERIC DEFAULT 0,
  new_mrr NUMERIC DEFAULT 0,
  expansion_mrr NUMERIC DEFAULT 0,
  contraction_mrr NUMERIC DEFAULT 0,
  churn_mrr NUMERIC DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  average_revenue_per_user NUMERIC DEFAULT 0,
  customer_lifetime_value NUMERIC DEFAULT 0,
  customer_acquisition_cost NUMERIC DEFAULT 0,
  churn_rate NUMERIC DEFAULT 0,
  revenue_by_service JSONB DEFAULT '{}',
  revenue_by_geography JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(period_start, period_end)
);

-- Financial Forecasts Table
CREATE TABLE IF NOT EXISTS public.financial_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_type TEXT NOT NULL CHECK (forecast_type IN ('revenue', 'churn', 'cash_flow', 'customer_growth')),
  forecast_date DATE NOT NULL,
  predicted_value NUMERIC NOT NULL,
  confidence_interval_lower NUMERIC,
  confidence_interval_upper NUMERIC,
  model_accuracy NUMERIC,
  factors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(forecast_type, forecast_date)
);

-- Automated Financial Actions Log
CREATE TABLE IF NOT EXISTS public.financial_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  insight_id UUID REFERENCES public.ai_financial_insights(id) ON DELETE SET NULL,
  action_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  result JSONB DEFAULT '{}',
  error_message TEXT,
  executed_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_financial_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_severity ON public.ai_financial_insights(severity);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created ON public.ai_financial_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON public.revenue_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_date ON public.financial_forecasts(forecast_date);

-- Enable RLS
ALTER TABLE public.ai_financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_actions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only access)
CREATE POLICY "Admins can view AI financial insights"
  ON public.ai_financial_insights FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert AI financial insights"
  ON public.ai_financial_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update AI financial insights"
  ON public.ai_financial_insights FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view revenue analytics"
  ON public.revenue_analytics FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can manage revenue analytics"
  ON public.revenue_analytics FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view financial forecasts"
  ON public.financial_forecasts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can manage financial forecasts"
  ON public.financial_forecasts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view financial actions log"
  ON public.financial_actions_log FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can manage financial actions log"
  ON public.financial_actions_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update revenue analytics
CREATE OR REPLACE FUNCTION update_revenue_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_mrr NUMERIC;
  v_arr NUMERIC;
BEGIN
  v_period_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_period_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Calculate MRR from active subscriptions
  SELECT COALESCE(SUM(mp.price / 12), 0) INTO v_mrr
  FROM user_mastering_subscriptions ums
  JOIN mastering_packages mp ON ums.package_id = mp.id
  WHERE ums.status = 'active';
  
  v_arr := v_mrr * 12;
  
  -- Insert or update analytics
  INSERT INTO revenue_analytics (period_start, period_end, mrr, arr)
  VALUES (v_period_start, v_period_end, v_mrr, v_arr)
  ON CONFLICT (period_start, period_end)
  DO UPDATE SET mrr = v_mrr, arr = v_arr;
END;
$$;