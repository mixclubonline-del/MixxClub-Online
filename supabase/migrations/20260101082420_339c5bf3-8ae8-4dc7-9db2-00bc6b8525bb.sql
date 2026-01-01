-- Create revenue_goals table for goal tracking
CREATE TABLE public.revenue_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  stream_type TEXT, -- null = all streams, or specific stream id
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.revenue_goals ENABLE ROW LEVEL SECURITY;

-- Users can manage their own goals
CREATE POLICY "Users can manage their own revenue goals" 
ON public.revenue_goals 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_revenue_goals_user_id ON public.revenue_goals(user_id);
CREATE INDEX idx_revenue_goals_period ON public.revenue_goals(period);

-- Enable realtime for revenue-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.engineer_earnings;