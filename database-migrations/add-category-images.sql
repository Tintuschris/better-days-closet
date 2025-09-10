-- Add image fields to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('marketing-banners', 'marketing-banners', true),
  ('category-images', 'category-images', true),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for marketing-banners bucket
CREATE POLICY "Public Access for Marketing Banners" ON storage.objects
FOR SELECT USING (bucket_id = 'marketing-banners');

CREATE POLICY "Admin Users Can Upload Marketing Banners" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'marketing-banners' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth.uid() = id 
    AND is_admin = true
  )
);

-- Storage policies for category-images bucket
CREATE POLICY "Public Access for Category Images" ON storage.objects
FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Admin Users Can Upload Category Images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth.uid() = id 
    AND is_admin = true
  )
);

-- Storage policies for user-avatars bucket
CREATE POLICY "Public Access for User Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users Can Upload Their Own Avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()
);

-- Update policy for existing product-images bucket if needed
CREATE POLICY "Admin Users Can Upload Product Images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth.uid() = id 
    AND is_admin = true
  )
);
