import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
    return data;
  };

  const fetchProductById = async (id) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  };

  const fetchProductsByCategory = async (categoryName) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_name', categoryName);
    if (error) throw error;
    return data;
  };

  const addToCart = async (userId, productId, quantity) => {
    try {
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        const { data, error } = await supabase
          .from('cart')
          .update({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('cart')
          .insert([{
            user_id: userId,
            product_id: productId,
            quantity,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  };

  const fetchCartItems = async (userId) => {
    const { data, error } = await supabase.from('cart').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  const updateCartInDatabase = async (userId, cartItems) => {
    for (const item of cartItems) {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity,
          total_amount: item.total_amount,
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) {
        console.error('Error updating cart in database:', error);
        throw error;
      }
    }
  };

  const deleteFromCart = async (userId, productId) => {
    const { error } = await supabase
      .from('cart')
      .delete()
      .match({ user_id: userId, product_id: productId });

    if (error) {
      console.error('Error deleting from cart:', error);
      throw error;
    }
  };

  const fetchOrders = async (userId) => {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  const fetchWishlistItems = async (userId) => {
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  const addToWishlist = async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw error;
    return data;
  };

  const deleteFromWishlist = async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return data;
  };

  // Delivery-related functions
  const fetchDeliveryAddresses = async () => {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  const addDeliveryAddress = async (addressData) => {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert([addressData]);
    if (error) throw error;
    return data;
  };

  const updateDeliveryAddress = async (id, addressData) => {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .update(addressData)
      .eq('id', id);
    if (error) throw error;
    return data;
  };

  const deleteDeliveryAddress = async (id) => {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  };

  const getDeliveryOptionDetails = async (option, value) => {
    let query = supabase.from('delivery_addresses').select('*');
  
    switch (option) {
      case 'Nairobi Delivery':
        query = query
          .eq('option_name', 'Nairobi Delivery')
          .eq('area', value);
        break;
      case 'CBD Pickup Point':
        query = query
          .eq('option_name', 'CBD Pickup Point')
          .eq('pickup_point_name', value);
        break;
      case 'Rest of Kenya':
        query = query
          .eq('option_name', 'Rest of Kenya')
          .eq('courier', value);
        break;
      default:
        throw new Error('Invalid delivery option');
    }
  
    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  };  const saveUserAddress = async (userId, addressDetails) => {
    try {
      // Get delivery option details including description and cost
      const deliveryOptionDetails = await getDeliveryOptionDetails(
        addressDetails.selectedOption,
        addressDetails.selectedOption === 'Nairobi Delivery' ? addressDetails.selectedArea :
        addressDetails.selectedOption === 'Pickup Point' ? addressDetails.selectedPickupPoint :
        addressDetails.selectedCourier
      );

      // Delete existing address
      await supabase
        .from('addresses')
        .delete()
        .eq('user_id', userId);

      // Insert new address
      const { data, error } = await supabase
        .from('addresses')
        .insert([{
          user_id: userId,
          delivery_option: addressDetails.selectedOption,
          area: addressDetails.selectedArea,
          courier_service: addressDetails.selectedCourier,
          pickup_point: addressDetails.selectedPickupPoint,
          cost: deliveryOptionDetails.cost,
          description: deliveryOptionDetails.description,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving user address:', error);
      throw error;
    }
  };

  const getUserAddresses = async (userId) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const getCurrentUserAddress = async (userId) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGSQL_NO_ROWS') throw error;
    return data;
  };

  const getFullDeliveryDetails = async (userId) => {
    const { data: userAddress, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (addressError?.code === 'PGRST116') return null;
    if (addressError) throw addressError;
    if (!userAddress) return null;

    const deliveryDetails = await getDeliveryOptionDetails(
      userAddress.delivery_option,
      userAddress.delivery_option === 'Nairobi Delivery' ? userAddress.area :
      userAddress.delivery_option === 'CBD Pickup Point' ? userAddress.pickup_point : // Changed from 'Pickup Point'
      userAddress.courier_service
    );

    return {
      ...userAddress,
      deliveryDetails
    };
  };
  const updateUserAddress = async (addressId, addressDetails) => {
    const { data, error } = await supabase
      .from('addresses')
      .update(addressDetails)
      .eq('id', addressId)
      .select();

    if (error) throw error;
    return data;
  };

  const deleteUserAddress = async (addressId) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
  };

  return {
    // Product-related functions
    fetchProducts,
    fetchCategories,
    fetchProductById,
    fetchProductsByCategory,
    
    // Cart-related functions
    addToCart,
    fetchCartItems,
    deleteFromCart,
    updateCartInDatabase,
    
    // Order-related functions
    fetchOrders,
    
    // Wishlist-related functions
    fetchWishlistItems,
    addToWishlist,
    deleteFromWishlist,
    
    // Delivery-related functions
    fetchDeliveryAddresses,
    addDeliveryAddress,
    updateDeliveryAddress,
    deleteDeliveryAddress,
    getDeliveryOptionDetails,
    saveUserAddress,
    getUserAddresses,
    getCurrentUserAddress,
    getFullDeliveryDetails,
    updateUserAddress,
    deleteUserAddress,
  };
};