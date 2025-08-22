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
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  // Product Mutations
  const useAddProduct = () => {
    return useMutation({
      mutationFn: async (product) => {
        const { data, error } = await supabase
          .from("products")
          .insert([product]);
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
          // If your users table is named 'users' instead of 'profiles'
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
        return data;
      },
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
  // Image Upload with Progress
  const useUploadImage = () => {
    return useMutation({
      mutationFn: async (imageFile) => {
        const fileName = `${uuidv4()}-${imageFile.name}`;

        const { data, error } = await supabase.storage
          .from("product_images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product_images").getPublicUrl(fileName);

        return publicUrl;
      },
    });
  };

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
        // Get users with their order statistics
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select(`
            id,
            name,
            email,
            phone,
            created_at,
            orders (
              id,
              total_amount,
              status
            )
          `);

        if (usersError) throw usersError;

        // Calculate order statistics for each user
        const customersWithStats = users.map(user => ({
          ...user,
          order_count: user.orders?.length || 0,
          total_spent: user.orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0,
          last_order_date: user.orders?.length > 0
            ? Math.max(...user.orders.map(order => new Date(order.created_at).getTime()))
            : null
        }));

        return customersWithStats;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  // Upload product image function
  const uploadProductImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

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

  return {
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
    useUpdateCategoryAttributes
  };
};
