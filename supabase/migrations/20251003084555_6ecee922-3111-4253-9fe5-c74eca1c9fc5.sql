-- Fix search_path security for increment_version_number function
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM project_versions WHERE project_id = NEW.project_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$;