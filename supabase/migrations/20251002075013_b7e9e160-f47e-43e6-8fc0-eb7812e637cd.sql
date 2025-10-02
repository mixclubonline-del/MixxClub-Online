-- Update the handle_new_user function to trigger welcome email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_user_role text;
  v_request_id bigint;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Get user role (default to 'artist' if not specified)
  v_user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'artist');
  
  -- Call the welcome email edge function asynchronously (fire and forget)
  -- Using the anon key is fine here as the edge function itself uses service role internally
  SELECT net.http_post(
    url := 'https://htvmkylgrrlaydhdbonl.supabase.co/functions/v1/send-welcome-email',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dm1reWxncnJsYXlkaGRib25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTUwODIsImV4cCI6MjA3NDU5MTA4Mn0.peKF6_Gf15ZJCrwlnS2Kizy0tOkJ_9BJxXcs1TGM5Cc"}'::jsonb,
    body := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'fullName', NEW.raw_user_meta_data->>'full_name',
      'userRole', v_user_role
    )
  ) INTO v_request_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation if email fails
    RAISE WARNING 'Failed to trigger welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;