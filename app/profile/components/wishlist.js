import { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseContext } from '../../context/supabaseContext';
import { useCart } from '../../context/cartContext';
import Image from 'next/image';
import { toast } from 'sonner';

const formatPrice = (price) => {
  return typeof price === 'number' 
    ? price.toFixed(2) 
    : Number(price).toFixed(2);
};

export default function Wishlist() {
  const router = useRouter();
  const { user, supabase } = useSupabaseContext();
  const { cartItems, updateCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;

      try {
        const { data: wishlist, error } = await supabase
          .from('wishlist')
          .select('*, products(*)')
          .eq('user_id', user.id);

        if (error) throw error;

        setWishlistItems(wishlist || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user, supabase]);

  const removeFromWishlist = async (productId) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === product.id
      );
  
      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newItem = {
          productId: product.id,
          quantity: 1,
          total_amount: product.price,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category_name: product.category_name,
          },
        };
        updatedCart = [...cartItems, newItem];
      }
  
      updateCart(updatedCart);
      toast.success('Added to cart', {
        description: `${product.name} added to your cart`,
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--primarycolor)',
        },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: "Please try again",
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Consistent with other tabs */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center">
        <button onClick={() => router.push('/profile')} className="text-primarycolor">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-primarycolor mx-auto">MY WISHLIST</h1>
        <div className="w-5"></div> {/* Empty div for alignment */}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primarycolor"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-primarycolor mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-center mb-6">
              Items added to your wishlist will appear here
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primarycolor text-white rounded-full hover:bg-primarycolor/90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-primarycolor mb-1 line-clamp-1">{item.products.name}</h3>
                  <p className="text-primarycolor font-bold mb-3">
                    Ksh. {formatPrice(item.products.price)}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.products)}
                      className="flex-1 py-2 bg-primarycolor text-white rounded-lg flex items-center justify-center gap-1 hover:bg-primarycolor/90 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
