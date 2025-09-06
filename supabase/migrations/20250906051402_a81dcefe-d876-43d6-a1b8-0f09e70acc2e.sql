-- Add solution field to homework table
ALTER TABLE public.homework 
ADD COLUMN solution TEXT;

-- Create storage bucket for homework files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homework-files', 'homework-files', true);

-- Create storage policies for homework files
CREATE POLICY "Anyone can view homework files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'homework-files');

CREATE POLICY "Admins can upload homework files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'homework-files');

CREATE POLICY "Admins can update homework files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'homework-files');

CREATE POLICY "Admins can delete homework files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'homework-files');

-- Add files field to homework table
ALTER TABLE public.homework 
ADD COLUMN files TEXT[] DEFAULT ARRAY[]::TEXT[];