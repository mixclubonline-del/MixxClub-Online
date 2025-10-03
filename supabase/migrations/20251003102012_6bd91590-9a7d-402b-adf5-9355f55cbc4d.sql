-- Create function to increment launch metrics
CREATE OR REPLACE FUNCTION public.increment_metric(
  p_date DATE,
  p_field TEXT,
  p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.launch_metrics (metric_date)
  VALUES (p_date)
  ON CONFLICT (metric_date) DO NOTHING;
  
  EXECUTE format(
    'UPDATE public.launch_metrics SET %I = %I + $1 WHERE metric_date = $2',
    p_field, p_field
  )
  USING p_amount, p_date;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;