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

  // Categories Queries and Mutations
  const useCategories = () => {
    return useQuery({
      queryKey: ["admin-categories"],
      queryFn: async () => {
        const { data, error } = await supabase.from("categories").select("*");
        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 60, // 1 hour
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
          .update({ status })
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
          .select('created_at, total_amount')
          .order('created_at');
        
        if (error) throw error;
  
        // Group orders by date and calculate daily totals
        const dailySales = data.reduce((acc, order) => {
          const date = new Date(order.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + order.total_amount;
          return acc;
        }, {});
  
        // Convert to array format needed for chart
        return Object.entries(dailySales).map(([date, revenue]) => ({
          date,
          revenue
        }));
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
    useDeliveryAddresses,
    useAddDeliveryAddress,
    useUpdateDeliveryAddress,
    useDeleteDeliveryAddress,
    useUploadImage,
    useSalesData,
    useBanners,
    useAddBanner,
    useUpdateBanner,
    useDeleteBanner
  };
};
