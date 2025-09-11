import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const useSupabase = () => {
  const queryClient = useQueryClient();

  // Products Queries
  const useProducts = () => {
    return useQuery({
      queryKey: ["admin-products"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("products_with_variants")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  // Get single product with variants
  const useProduct = (productId) => {
    return useQuery({
      queryKey: ["admin-product", productId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("id", productId)
          .single();
        if (error) throw error;
        return data;
      },
      enabled: !!productId,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Product Variants Queries
  const useProductVariants = (productId) => {
    return useQuery({
      queryKey: ["admin-product-variants", productId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return data;
      },
      enabled: !!productId,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Product Mutations
  const useAddProduct = () => {
    return useMutation({
      mutationFn: async (product) => {
        // Remove quantity from product data (variants will handle inventory)
        const { quantity, ...productData } = product;

        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-products"]);
      },
    });
  };

  const useUpdateProduct = () => {
    return useMutation({
      mutationFn: async ({ id, product }) => {
        const { data, error } = await supabase
          .from("products")
          .update(product)
          .eq("id", id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-products"]);
      },
    });
  };

  const useDeleteProduct = () => {
    return useMutation({
      mutationFn: async (id) => {
        const { data, error } = await supabase
          .from("products")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-products"]);
      },
    });
  };

  // Categories Queries and Mutations with real product counts and attributes
  const useCategories = () => {
    return useQuery({
      queryKey: ["admin-categories"],
      queryFn: async () => {
        // Get categories with their attributes and actual product counts
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            *,
            category_attributes (
              has_sizes,
              has_colors,
              available_sizes,
              available_colors
            )
          `)
          .order('created_at', { ascending: false });

        if (categoriesError) {
          console.error('Categories Error:', categoriesError);
          throw categoriesError;
        }

        // Get actual product counts for each category
        const { data: productCounts, error: countsError } = await supabase
          .from('products')
          .select('category_id')
          .not('category_id', 'is', null);

        if (countsError) {
          console.error('Product counts error:', countsError);
          throw countsError;
        }

        // Count products by category
        const countsByCategory = productCounts.reduce((acc, product) => {
          acc[product.category_id] = (acc[product.category_id] || 0) + 1;
          return acc;
        }, {});

        // Merge categories with real product counts and attributes
        const categoriesWithCounts = categoriesData.map(category => ({
          ...category,
          actual_product_count: countsByCategory[category.id] || 0,
          attributes: category.category_attributes?.[0] || {
            has_sizes: false,
            has_colors: false,
            available_sizes: [],
            available_colors: []
          }
        }));

        console.log('Categories with counts:', categoriesWithCounts);
        return categoriesWithCounts;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - shorter since product counts change more frequently
      cacheTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  const useAddCategory = () => {
    return useMutation({
      mutationFn: async (category) => {
        const { data, error } = await supabase
          .from("categories")
          .insert([category]);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-categories"]);
      },
    });
  };

  // Orders Queries
  const useOrders = () => {
    return useQuery({
      queryKey: ["admin-orders"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
  *,
  users:user_id (
    name,
    email
  )
`
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Process orders to extract customer information properly
        const processedOrders = data.map(order => {
          let customerInfo = {
            name: 'Unknown Customer',
            email: null,
            phone: null
          };

          // If registered user
          if (order.user_id && order.users) {
            customerInfo = {
              name: order.users.name || 'Registered Customer',
              email: order.users.email,
              phone: null
            };
          }
          // If guest order, extract from cart_items
          else if (order.cart_items && Array.isArray(order.cart_items)) {
            // Check if cart_items contains guest_details
            for (const item of order.cart_items) {
              if (typeof item === 'string') {
                try {
                  const parsed = JSON.parse(item);
                  if (parsed.guest_details) {
                    customerInfo = {
                      name: parsed.guest_details.name || 'Guest Customer',
                      email: parsed.guest_details.email,
                      phone: parsed.guest_details.phone
                    };
                    break;
                  }
                } catch (e) {
                  // Continue if parsing fails
                }
              } else if (item.guest_details) {
                customerInfo = {
                  name: item.guest_details.name || 'Guest Customer',
                  email: item.guest_details.email,
                  phone: item.guest_details.phone
                };
                break;
              }
            }
          }

          return {
            ...order,
            customer_info: customerInfo,
            // For backward compatibility, override user with proper info
            user: {
              name: customerInfo.name,
              email: customerInfo.email
            }
          };
        });

        return processedOrders;
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };
  const useUpdateOrderStatus = () => {
    return useMutation({
      mutationFn: async ({ id, status }) => {
        const { data, error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-orders']);
      }
    });
  };
  // Generic Image Upload Hook
  const useUploadImage = (bucket) => {
    return useMutation({
      mutationFn: async (imageFile) => {
        const fileName = `${uuidv4()}-${imageFile.name}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(fileName);

        return publicUrl;
      },
    });
  };

  // Specialized Image Upload Hooks
  const useUploadProductImage = () => useUploadImage("product-images");
  const useUploadBannerImage = () => useUploadImage("marketing-banners");
  const useUploadCategoryImage = () => useUploadImage("category-images");
  const useUploadProfileImage = () => useUploadImage("user-avatars");

  // Sales Data Query
  const useSalesData = () => {
    return useQuery({
      queryKey: ['admin-sales'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('id, total_amount, created_at, status')
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Sales Data Error:', error);
          throw error;
        }
  
        // Debug log
        console.log('Raw Orders:', data);
  
        const dailySales = data.reduce((acc, order) => {
          if (order.status === 'CANCELLED') return acc;
          
          const date = new Date(order.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + Number(order.total_amount);
          return acc;
        }, {});
  
        const formattedData = Object.entries(dailySales).map(([date, amount]) => ({
          date,
          amount
        }));
  
        // Debug log
        console.log('Formatted Sales Data:', formattedData);
        return formattedData;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  
  
  // Add these inside useSupabase hook
  const useDeliveryAddresses = () => {
    return useQuery({
      queryKey: ["admin-delivery-addresses"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("delivery_addresses")
          .select("*")
          .order("region", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const useAddDeliveryAddress = () => {
    return useMutation({
      mutationFn: async (address) => {
        const { data, error } = await supabase
          .from("delivery_addresses")
          .insert([address]);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-delivery-addresses"]);
      },
    });
  };

  const useUpdateDeliveryAddress = () => {
    return useMutation({
      mutationFn: async ({ id, address }) => {
        const { data, error } = await supabase
          .from("delivery_addresses")
          .update(address)
          .eq("id", id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-delivery-addresses"]);
      },
    });
  };

  const useDeleteDeliveryAddress = () => {
    return useMutation({
      mutationFn: async (id) => {
        const { data, error } = await supabase
          .from("delivery_addresses")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-delivery-addresses"]);
      },
    });
  };

  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: async ({ id, category }) => {
        const { data, error } = await supabase
          .from('categories')
          .update(category)
          .eq('id', id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-categories']);
      }
    });
  };
  
  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: async (id) => {
        const { data, error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-categories']);
      }
    });
  };
  // Add these functions inside useSupabase hook

const useBanners = () => {
  return useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

const useAddBanner = () => {
  return useMutation({
    mutationFn: async (banner) => {
      const { data, error } = await supabase
        .from('marketing_banners')
        .insert([banner]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-banners']);
    },
  });
};

const useUpdateBanner = () => {
  return useMutation({
    mutationFn: async ({ id, banner }) => {
      const { data, error } = await supabase
        .from('marketing_banners')
        .update(banner)
        .eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-banners']);
    },
  });
};

const useDeleteBanner = () => {
  return useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('marketing_banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-banners']);
    },
  });
};


  // Customers Queries
  const useCustomers = () => {
    return useQuery({
      queryKey: ["admin-customers"],
      queryFn: async () => {
        // Get users (customers only) with all management fields
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select(`
            id,
            name,
            email,
            role,
            phone,
            address,
            city,
            country,
            date_of_birth,
            gender,
            account_type,
            loyalty_points,
            preferred_language,
            status,
            admin_notes,
            is_blocked,
            last_login_at,
            created_at
          `)
          .eq('role', 'customer')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Get orders for these users separately (since relationship query was failing)
        const userIds = users.map(user => user.id);
        let orders = [];

        if (userIds.length > 0) {
          const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select(`
              id,
              user_id,
              total_amount,
              status,
              created_at
            `)
            .in('user_id', userIds);

          if (ordersError) {
            console.warn('Failed to fetch orders for customers:', ordersError);
          } else {
            orders = ordersData || [];
          }
        }

        // Calculate order statistics for each user
        const customersWithStats = users.map(user => {
          const userOrders = orders.filter(order => order.user_id === user.id);

          return {
            ...user,
            phone: null, // Will be null since not in users table
            order_count: userOrders.length,
            total_spent: userOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
            last_order_date: userOrders.length > 0
              ? new Date(Math.max(...userOrders.map(order => new Date(order.created_at).getTime())))
              : null,
            recent_orders: userOrders
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 3)
          };
        });

        return customersWithStats;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  // Upload product image function
  const uploadProductImage = async (file) => {
    // Derive extension from MIME type to match the optimized output (e.g., webp)
    const mimeToExt = {
      'image/webp': 'webp',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };
    const derivedExt = mimeToExt[file.type] || (file.name.includes('.') ? file.name.split('.').pop() : 'bin');
    const fileName = `${uuidv4()}.${derivedExt}`;
    const filePath = fileName; // Upload directly to bucket root, no subfolder

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Category Attributes Queries
  const useCategoryAttributes = () => {
    return useQuery({
      queryKey: ["admin-category-attributes"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("category_attributes")
          .select("*")
          .order("category_id", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Category Attributes Mutations
  const useCreateCategoryAttributes = () => {
    return useMutation({
      mutationFn: async (attributeData) => {
        const { data, error } = await supabase
          .from('category_attributes')
          .insert([attributeData])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-category-attributes']);
        queryClient.invalidateQueries(['admin-categories']);
      }
    });
  };

  const useUpdateCategoryAttributes = () => {
    return useMutation({
      mutationFn: async ({ categoryId, attributes }) => {
        // First check if category attributes exist
        const { data: existing } = await supabase
          .from('category_attributes')
          .select('id')
          .eq('category_id', categoryId)
          .single();

        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from('category_attributes')
            .update(attributes)
            .eq('category_id', categoryId)
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          // Create new
          const { data, error } = await supabase
            .from('category_attributes')
            .insert([{ category_id: categoryId, ...attributes }])
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-category-attributes']);
        queryClient.invalidateQueries(['admin-categories']);
      }
    });
  };

  // Product Variants Mutations
  const useAddProductVariant = () => {
    return useMutation({
      mutationFn: async (variant) => {
        const { data, error } = await supabase
          .from('product_variants')
          .insert([variant])
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries(['admin-product-variants', data.product_id]);
        queryClient.invalidateQueries(['admin-products']);
      }
    });
  };

  const useUpdateProductVariant = () => {
    return useMutation({
      mutationFn: async ({ id, variant }) => {
        const { data, error } = await supabase
          .from('product_variants')
          .update(variant)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries(['admin-product-variants', data.product_id]);
        queryClient.invalidateQueries(['admin-products']);
      }
    });
  };

  const useDeleteProductVariant = () => {
    return useMutation({
      mutationFn: async (variantId) => {
        const { error } = await supabase
          .from('product_variants')
          .delete()
          .eq('id', variantId);
        if (error) throw error;
        return variantId;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-product-variants']);
        queryClient.invalidateQueries(['admin-products']);
      }
    });
  };

  return {
    supabase, // Export supabase client for direct access
    useProducts,
    useAddProduct,
    useUpdateProduct,
    useDeleteProduct,
    useCategories,
    useAddCategory,
    useUpdateCategory,
    useDeleteCategory,
    useOrders,
    useUpdateOrderStatus,
    useCustomers,
    useDeliveryAddresses,
    useAddDeliveryAddress,
    useUpdateDeliveryAddress,
    useDeleteDeliveryAddress,
    useUploadImage,
    uploadProductImage,
    useSalesData,
    useBanners,
    useAddBanner,
    useUpdateBanner,
    useDeleteBanner,
    useCategoryAttributes,
    useCreateCategoryAttributes,
    useUpdateCategoryAttributes,

    // Product Variants
    useProduct,
    useProductVariants,
    useAddProductVariant,
    useUpdateProductVariant,
    useDeleteProductVariant,

    // Admin Settings
    useAdminSettings,
    useUpdateAdminSetting,

    // Customer Management
    useUpdateCustomer,
    useBlockCustomer,
  };

  // Admin Settings Queries
  function useAdminSettings() {
    return useQuery({
      queryKey: ["admin-settings"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("*")
          .order("category", { ascending: true });

        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }

  function useUpdateAdminSetting() {
    return useMutation({
      mutationFn: async ({ key, value }) => {
        const { data, error } = await supabase
          .from("admin_settings")
          .update({
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq("setting_key", key)
          .select();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      },
    });
  }

  // Customer Management Functions
  function useUpdateCustomer() {
    return useMutation({
      mutationFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", id)
          .select();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      },
    });
  }

  function useBlockCustomer() {
    return useMutation({
      mutationFn: async ({ id, blocked }) => {
        const { data, error } = await supabase
          .from("users")
          .update({
            is_blocked: blocked,
            status: blocked ? 'blocked' : 'active'
          })
          .eq("id", id)
          .select();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      },
    });
  }
};
