"use client"
import Image from "next/image";
import { Heart } from 'lucide-react';
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";  // Updated to useNavigation
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';

export default function ProductCard({ product }) {
  const { user } = useAuth();  // Get the current user
  const { fetchWishlistItems, deleteFromWishlist, addToWishlist } = useSupabase();  // Import addToWishlist
  const router = useRouter();  // Using Next.js useNavigation
  const [isInWishlist, setIsInWishlist] = useState(false);  // Track if product is in wishlist
  const [discountPercentage, setDiscountPercentage] = useState(0);  // Track product discount

  // Check if the product is in the user's wishlist when the component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user) {
        const wishlistItems = await fetchWishlistItems(user.id);
        const productInWishlist = wishlistItems.some(item => item.product_id === product.id);
        setIsInWishlist(productInWishlist);  // Set initial wishlist status
      }
    };
    checkWishlistStatus();

    // Fetch and set the discount percentage for the product
    if (product.discount) {
      setDiscountPercentage(product.discount);
    }
  }, [user, product.id, product.discount, fetchWishlistItems]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();  // Prevent the default link behavior when clicking the heart icon
    
    if (user) {
      try {
        if (isInWishlist) {
          // If the product is already in the wishlist, remove it
          await deleteFromWishlist(user.id, product.id);
          setIsInWishlist(false);  // Update state to reflect removal
        } else {
          // If not in the wishlist, add it
          await addToWishlist(user.id, product.id);  // Use the new addToWishlist function
          setIsInWishlist(true);  // Update state to reflect addition
        }
      } catch (err) {
        console.error('Error updating wishlist:', err);
        alert('Failed to update wishlist');
      }
    } else {
      // Redirect to login if the user is not logged in
      router.push('/auth/login');  // Redirect to login page
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="bg-white rounded-lg overflow-hidden shadow-lg max-h-[400px]">
      <div className="relative w-full pb-[100%]">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-lg"
        />
        
        {/* Discount badge in the top left corner */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-warningcolor text-white font-bold text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {/* Heart icon with dynamic fill based on wishlist status */}
        <Heart
          className={`absolute top-2 right-2 w-8 h-8 font-bold cursor-pointer ${
            isInWishlist ? 'fill-secondarycolor text-secondarycolor' : 'fill-none text-secondarycolor'
          }`}
          onClick={handleWishlistClick}  // Handle click
        />
      </div>
      <div className="p-4 bg-secondarycolor relative rounded-b-lg">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-primarycolor mb-2 truncate w-[90%]" title={product.name}>
          {product.name}
        </h2>
        <div className="flex flex-col">
          <span className="text-sm sm:text-base line-through text-primarycolorvariant">
            Ksh. {product.price}
          </span>
          <span className="text-base sm:text-lg md:text-xl font-bold text-primarycolor">
            Ksh. {(product.price * (1 - product.discount / 100)).toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
