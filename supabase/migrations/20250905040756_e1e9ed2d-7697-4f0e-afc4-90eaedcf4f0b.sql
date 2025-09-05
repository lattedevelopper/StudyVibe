-- Allow admins to insert/update/delete homework
CREATE POLICY "Admins can insert homework" 
ON public.homework 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update homework" 
ON public.homework 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete homework" 
ON public.homework 
FOR DELETE 
USING (true);

-- Allow admins to insert notifications
CREATE POLICY "Admins can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);