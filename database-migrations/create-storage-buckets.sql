-- Create the required storage buckets
insert into storage.buckets (id, name, public)
values 
  ('product-images', 'product-images', true),
  ('marketing-banners', 'marketing-banners', true),
  ('user-avatars', 'user-avatars', true),
  ('category-images', 'category-images', true);

-- Set up storage policies for product-images
create policy "Public Access product-images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated'
  );

-- Set up storage policies for marketing-banners
create policy "Public Access marketing-banners"
  on storage.objects for select
  using ( bucket_id = 'marketing-banners' );

create policy "Only admins can upload banner images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'marketing-banners' 
    and auth.role() = 'authenticated'
    and exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'isAdmin' = 'true'
    )
  );

-- Set up storage policies for user-avatars
create policy "Public Access user-avatars"
  on storage.objects for select
  using ( bucket_id = 'user-avatars' );

create policy "Users can upload their own avatars"
  on storage.objects for insert
  with check ( 
    bucket_id = 'user-avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Set up storage policies for category-images
create policy "Public Access category-images"
  on storage.objects for select
  using ( bucket_id = 'category-images' );

create policy "Only admins can upload category images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'category-images' 
    and auth.role() = 'authenticated'
    and exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'isAdmin' = 'true'
    )
  );
