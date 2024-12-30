"use client"
import Image from "next/image";
import { Heart } from 'lucide-react';
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSupabaseContext } from '../context/supabaseContext';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { 
    user, 
    wishlistItems,
    addToWishlist,
    deleteFromWishlist
  } = useSupabaseContext();
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  useEffect(() => {
    if (wishlistItems) {
      const productInWishlist = wishlistItems.some(item => item.product_id === product.id);
      setIsInWishlist(productInWishlist);
    }

    if (product.discount) {
      setDiscountPercentage(product.discount);
    }
  }, [wishlistItems, product.id, product.discount]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      if (isInWishlist) {
        await deleteFromWishlist({ userId: user.id, productId: product.id });
        setIsInWishlist(false);
      } else {
        await addToWishlist({ userId: user.id, productId: product.id });
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="relative w-full pb-[100%]">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-lg"
        />
        
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-warningcolor text-white font-bold text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        <Heart
          className={`absolute top-2 right-2 w-6 h-6 cursor-pointer ${
            isInWishlist ? 'fill-secondarycolor text-secondarycolor' : 'fill-none text-secondarycolor'
          }`}
          onClick={handleWishlistClick}
        />
      </div>
      <div className="p-3 bg-secondarycolor relative rounded-b-lg">
        <h2 className="text-sm font-semibold text-primarycolor mb-1 truncate w-[90%]" title={product.name}>
          {product.name}
        </h2>
        <div className="flex flex-col">
          <span className="text-xs line-through text-primarycolorvariant">
            Ksh. {product.price}
          </span>
          <span className="text-sm font-bold text-primarycolor">
            Ksh. {(product.price * (1 - product.discount / 100)).toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
