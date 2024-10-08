import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

export const useSupabase = () => {
  // Fetch products from the database
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  };

  // Add a new product to the database
  const addProduct = async (product) => {
    const { data, error } = await supabase.from('products').insert([product]);
    if (error) throw error;
    return data;
  };

  // Update an existing product in the database
  const updateProduct = async (id, product) => {
    const { data, error } = await supabase.from('products').update(product).eq('id', id);
    if (error) throw error;
    return data;
  };

  // Delete a product from the database
  const deleteProduct = async (id) => {
    const { data, error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return data;
  };

  // Upload product image to Supabase storage bucket
  const uploadProductImage = async (imageFile) => {
    const fileName = `${uuidv4()}-${imageFile.name}`;
  
    const { data, error } = await supabase.storage
      .from('product_images')
      .upload(fileName, imageFile);
  
    if (error) {
      console.error('Error uploading image:', error.message);
      throw error;
    }
  
    console.log('Upload response:', data);
  
    if (!data || !data.path) {
      console.error('No file path in upload response');
      throw new Error('Failed to upload the image to the bucket.');
    }
  
    // Use getPublicUrl with the correct path
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('product_images')
      .getPublicUrl(fileName);
  
    if (urlError) {
      console.error('Error getting public URL for image:', urlError.message);
      throw urlError;
    }
  
    console.log('Public URL:', publicUrl);
  
    if (!publicUrl) {
      console.warn('Public URL is undefined. Check bucket permissions or path.');
    }
  
    return publicUrl;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data;
  };

  const addCategory = async (category) => {
    const { data, error } = await supabase.from('categories').insert([category]);
    if (error) throw error;
    return data;
  };

  // Update an existing category
  const updateCategory = async (id, category) => {
    const { data, error } = await supabase.from('categories').update(category).eq('id', id);
    if (error) throw error;
    return data;
  };

  // Delete a category
  const deleteCategory = async (id) => {
    const { data, error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return data;
  };
  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return data;
  };

  const approveOrder = async (orderId) => {
    const { data, error } = await supabase.from('orders').update({ status: 'approved' }).eq('id', orderId);
    if (error) throw error;
    return data;
  };

  const fetchSalesData = async () => {
    const { data, error } = await supabase.rpc('get_sales_data');
    if (error) throw error;
    return data;
  };

  return {
    fetchProducts,
    addProduct,
    updateProduct,
    fetchCategories,
    addCategory,
    updateCategory,
    fetchOrders,
    approveOrder,
    fetchSalesData,
    deleteCategory,
    updateProduct,
    deleteProduct,
    uploadProductImage,
  };
};
//https://hlygryxopxrkvfvsppvm.supabase.co/storage/v1/object/sign/product_images/432dea28-5fc5-4d2f-ac0c-c1454257c472-UNP-LOGO-REVISION.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0X2ltYWdlcy80MzJkZWEyOC01ZmM1LTRkMmYtYWMwYy1jMTQ1NDI1N2M0NzItVU5QLUxPR08tUkVWSVNJT04ucG5nIiwiaWF0IjoxNzI4MzQ0NjQyLCJleHAiOjE3NTk4ODA2NDJ9.yS9rFDP1owe2HyFeTG9Ja593JLBC_85fji9UhAdUJQw&t=2024-10-07T23%3A44%3A02.431Z