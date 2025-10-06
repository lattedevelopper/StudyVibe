-- Add tags to homework table
ALTER TABLE public.homework 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create comments table for homework
CREATE TABLE IF NOT EXISTS public.homework_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  homework_id UUID NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.homework_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homework_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Everyone can view comments"
  ON public.homework_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.homework_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.homework_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.homework_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_homework_comments_updated_at
  BEFORE UPDATE ON public.homework_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_homework_comments_homework_id ON public.homework_comments(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_comments_parent_id ON public.homework_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_homework_tags ON public.homework USING GIN(tags);