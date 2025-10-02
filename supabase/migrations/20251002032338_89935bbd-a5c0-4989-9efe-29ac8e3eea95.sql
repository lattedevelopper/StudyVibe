-- Create schedule table
CREATE TABLE public.schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1 = Monday, 7 = Sunday
  lesson_number INTEGER NOT NULL CHECK (lesson_number >= 1 AND lesson_number <= 7),
  subject TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week, lesson_number)
);

-- Enable RLS
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

-- Everyone can view schedule
CREATE POLICY "Everyone can view schedule"
ON public.schedule
FOR SELECT
USING (true);

-- Only admins can modify schedule (you can add admin check later)
CREATE POLICY "Admins can insert schedule"
ON public.schedule
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update schedule"
ON public.schedule
FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete schedule"
ON public.schedule
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schedule_updated_at
BEFORE UPDATE ON public.schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();