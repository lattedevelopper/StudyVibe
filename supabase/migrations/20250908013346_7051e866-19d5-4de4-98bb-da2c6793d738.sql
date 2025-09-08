-- Add DELETE policy for notifications so users can actually delete their notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);