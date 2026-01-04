-- Fix function search path for security
ALTER FUNCTION public.update_stream_viewer_count(UUID, INTEGER) SET search_path = public;
ALTER FUNCTION public.process_stream_gift(UUID, UUID, UUID, INTEGER, TEXT) SET search_path = public;