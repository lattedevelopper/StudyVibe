-- Add start_time column to schedule table
ALTER TABLE public.schedule 
ADD COLUMN start_time time NOT NULL DEFAULT '08:00:00';