-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an auth trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Set up profiles trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create bookings table
CREATE TABLE public.bookings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  user_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  instagram text,
  preferred_date timestamp with time zone,
  special_requests text,
  reference_photos text[],
  referral_source text,
  other_referral text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text
);

-- Create portfolio table
CREATE TABLE public.portfolio (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false
);

-- Create categories table
CREATE TABLE public.categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Portfolio policies
CREATE POLICY "Anyone can view portfolio items"
  ON public.portfolio FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert portfolio items"
  ON public.portfolio FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin can update portfolio items"
  ON public.portfolio FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin can delete portfolio items"
  ON public.portfolio FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Traditional', 'Classic tattoo designs with bold lines and bright colors'),
  ('Neo-Traditional', 'A modern take on traditional tattooing'),
  ('Japanese', 'Traditional Japanese tattoo art and imagery'),
  ('Black Work', 'Bold black ink designs and patterns'),
  ('Realism', 'Photorealistic tattoo designs'),
  ('Custom', 'Custom designed pieces');

-- Create admin role function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role')::text = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant specific table permissions
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT ON public.portfolio TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
