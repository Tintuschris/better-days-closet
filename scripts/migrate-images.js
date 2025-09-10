'use client';

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function migrateImages() {
  try {
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    // Get all banners
    const { data: banners, error: bannersError } = await supabase
      .from('marketing_banners')
      .select('*');

    if (bannersError) throw bannersError;

    // Get all profiles with avatars
    const { data: profiles, error: profilesError } = await supabase
      .from('users')
      .select('*');

    if (profilesError) throw profilesError;

    console.log(`Found ${categories.length} categories, ${banners.length} banners, and ${profiles.length} profiles`);

    // Migrate banner images
    for (const banner of banners) {
      if (banner.image_url && banner.image_url.includes('product_images')) {
        // Download the image from product_images bucket
        const oldPath = banner.image_url.split('/').pop();
        const { data: imageData, error: downloadError } = await supabase.storage
          .from('product_images')
          .download(oldPath);

        if (downloadError) {
          console.error(`Failed to download banner image ${oldPath}:`, downloadError);
          continue;
        }

        // Upload to new marketing-banners bucket
        const newPath = `banners/${oldPath}`;
        const { error: uploadError } = await supabase.storage
          .from('marketing-banners')
          .upload(newPath, imageData);

        if (uploadError) {
          console.error(`Failed to upload banner image ${newPath}:`, uploadError);
          continue;
        }

        // Update banner record with new URL
        const { data: { publicUrl } } = supabase.storage
          .from('marketing-banners')
          .getPublicUrl(newPath);

        const { error: updateError } = await supabase
          .from('marketing_banners')
          .update({ image_url: publicUrl })
          .eq('id', banner.id);

        if (updateError) {
          console.error(`Failed to update banner record ${banner.id}:`, updateError);
          continue;
        }

        console.log(`Successfully migrated banner image: ${banner.id}`);
      }
    }

    // Migrate profile images
    for (const profile of profiles) {
      if (profile.avatar_url && profile.avatar_url.includes('product_images')) {
        // Download the image from product_images bucket
        const oldPath = profile.avatar_url.split('/').pop();
        const { data: imageData, error: downloadError } = await supabase.storage
          .from('product_images')
          .download(oldPath);

        if (downloadError) {
          console.error(`Failed to download profile image ${oldPath}:`, downloadError);
          continue;
        }

        // Upload to new user-avatars bucket
        const newPath = `${profile.id}/${oldPath}`;
        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(newPath, imageData);

        if (uploadError) {
          console.error(`Failed to upload profile image ${newPath}:`, uploadError);
          continue;
        }

        // Update profile record with new URL
        const { data: { publicUrl } } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(newPath);

        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Failed to update profile record ${profile.id}:`, updateError);
          continue;
        }

        console.log(`Successfully migrated profile image: ${profile.id}`);
      }
    }

    console.log('Image migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateImages().catch(console.error);
