-- Add missing ready_assignments column to homework table
ALTER TABLE public.homework 
ADD COLUMN ready_assignments TEXT[] DEFAULT ARRAY[]::TEXT[];