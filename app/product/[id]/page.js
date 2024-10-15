"use client";
import React, { useEffect, useState } from "react";
import { useSupabase } from "../../hooks/useSupabase";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function ProductPage() {
  const { fetchProductById, addToCart, fetchWishlistItems, addToWishlist, deleteFromWishlist, fetchCartItems } = useSupabase();
  const { user } = useAuth(); // Check if user is logged in
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false); // Track wishlist status
  const [cart, setCart] = useState([]); // Local cart state
  const [totalCartCount, setTotalCartCount] = useState(0); // Total count of items in cart
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  // Fetch product details by ID
  useEffect(() => {
    if (id) {
      fetchProductById(id).then((data) => setProduct(data));
    }
  }, [id]);

  // Fetch wishlist items to check if the product is already in the wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user) {
        const wishlistItems = await fetchWishlistItems(user.id);
        const productInWishlist = wishlistItems.some(item => item.product_id === product?.id);
        setIsInWishlist(productInWishlist);
      }
    };

    if (product && user) {
      checkWishlistStatus();
    }
  }, [product, user]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    updateTotalCartCount(storedCart); // Update total cart count
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateTotalCartCount(cart); // Update total cart count
  }, [cart]);

  // Function to update total cart count
  const updateTotalCartCount = (cartItems) => {
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setTotalCartCount(totalCount);
  };

  // Fetch cart items from database if user is logged in
  const loadCartItems = async () => {
    if (user) {
      const dbCartItems = await fetchCartItems(user.id);
      const formattedCart = dbCartItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
      }));
      setCart(formattedCart);
      updateTotalCartCount(formattedCart); // Update total cart count
    }
  };

  // Sync local cart with database on user login
  const syncCartWithDatabase = async () => {
    if (user) {
      for (const item of cart) {
        await addToCart(user.id, item.productId, item.quantity);
      }
      // Clear local cart after syncing
      setCart([]);
      setTotalCartCount(0); // Reset total cart count
      localStorage.removeItem("cart");
      console.log("Local cart synced with database");
    }
  };

  // Add item to cart (local or logged-in user)
  const handleAddToCart = async () => {
    if (user) {
      // Add to database cart if logged in
      await addToCart(user.id, product.id, quantity);
      console.log("Product added to cart in database");
    } else {
      // Check if the product is already in the cart
      const existingProductIndex = cart.findIndex((item) => item.productId === product.id);
      let updatedCart;

      if (existingProductIndex !== -1) {
        // Update quantity if product already exists in the cart
        updatedCart = cart.map((item, index) =>
          index === existingProductIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Add new product to the cart
        updatedCart = [...cart, { productId: product.id, quantity }];
      }

      setCart(updatedCart); // Update the cart state
      console.log("Product added to local cart");
    }
  };

  // Sync cart when user logs in
  useEffect(() => {
    if (user) {
      loadCartItems();
      syncCartWithDatabase();
    }
  }, [user]);

  // Handle wishlist actions (add/remove)
  const handleWishlistClick = async () => {
    if (user) {
      if (isInWishlist) {
        // Remove from wishlist
        await deleteFromWishlist(user.id, product.id);
        alert("Removed from wishlist");
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        await addToWishlist(user.id, product.id);
        console.log("Added to wishlist");
        setIsInWishlist(true);
      }
    } else {
      // Redirect to login if user is not logged in
      router.push("/auth/login");
    }
  };

  if (!product) return <p className="text-primarycolor text-center">Loading...</p>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-12 h-12 text-primarycolor" />
        </button>
        <h1 className="text-[1rem] font-semibold text-primarycolor">PRODUCT DETAILS</h1>
        <Heart
          className={`w-10 h-10 cursor-pointer ${isInWishlist ? "fill-secondarycolor text-secondarycolor" : "fill-none text-primarycolor"}`}
          onClick={handleWishlistClick}
        />
      </div>

      {/* Product Image */}
      <div className="flex-grow p-6 relative">
        <Image src={product.image_url} alt={product.name} height={500} width={500} />
      </div>

      {/* Product Info */}
      <div className="bg-secondarycolor p-4 rounded-t-3xl">
        <h2 className="text-[1.2rem] font-bold text-center text-primarycolor mb-4">{product.name}</h2>

        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-primarycolor">Quantity</span>
          <div className="flex items-center px-3 py-1 bg-transparent border border-primarycolor rounded-full">
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-primarycolor font-bold">+</button>
            <span className="px-3 py-1 text-primarycolor">{quantity}</span>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-primarycolor font-bold">-</button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primarycolor">Ksh. {product.price}</span>
          <button
            onClick={handleAddToCart}
            className="bg-primarycolor text-white px-3 py-3 rounded-full flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to cart
          </button>
        </div>

        {/* Display Total Cart Count */}
        <div className="text-primarycolor text-center">
          <span className="font-bold">Total Items in Cart: {totalCartCount}</span>
        </div>
      </div>
    </div>
  );
}
