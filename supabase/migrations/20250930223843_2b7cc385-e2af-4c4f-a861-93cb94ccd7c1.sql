-- Enable real-time for CRM functionality
-- Set REPLICA IDENTITY FULL for real-time tables
ALTER TABLE public.project_messages REPLICA IDENTITY FULL;
ALTER TABLE public.audio_files REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.collaboration_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audio_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_comments;