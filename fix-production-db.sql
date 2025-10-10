-- Add missing is_super_admin column to production
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false NOT NULL;
