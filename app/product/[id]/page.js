"use client";
import React, { useEffect, useState } from "react";
import { useSupabaseContext } from "../../context/supabaseContext";
import { useWishlist } from "../../context/wishlistContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    ChevronLeftIcon as ChevronLeft,
    HeartIcon as Heart,
    ShoppingCartIcon as ShoppingCart,
    ShareIcon as Share2,
    StarIcon as Star,
    TruckIcon as Truck,
    CheckCircleIcon as CheckCircle,
    ShieldCheckIcon as Shield,
    ChevronDownIcon as ChevronDown
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/cartContext";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "sonner";
import ProductCarousel from "@/app/components/productcarousel";
import Button from "@/app/components/ui/Button";
import QuantitySelector from "@/app/components/ui/QuantitySelector";

export default function ProductPage() {
    const { products, user, wishlistItems, addToWishlist, deleteFromWishlist } =
        useSupabaseContext();
    const { isInWishlist, addItem, removeItem } = useWishlist();
    const { cartItems, updateCart } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showMobileActions, setShowMobileActions] = useState(true);
    const params = useParams();
    const router = useRouter();

    // Use the product variants hook
    const {
        product,
        variants,
        availableSizes,
        availableColors,
        hasSizes,
        hasColors,
        getVariantPrice,
        getVariantStock,
        getVariantImage,
        getVariantByOptions
    } = useProductVariants(params.id);

    const relatedProducts = products
        ?.filter(
            (p) => p.category_name === product?.category_name && p.id !== product?.id
        )
        .slice(0, 6);

    // Get current variant based on selections
    const currentVariant = getVariantByOptions(selectedSize, selectedColor);
    const currentPrice = getVariantPrice(selectedSize, selectedColor);
    const currentStock = getVariantStock(selectedSize, selectedColor);
    const currentImage = getVariantImage(selectedSize, selectedColor);

    // Product images - use variant image if available, otherwise product image
    const productImages = [currentImage, product?.image_url].filter(Boolean);

    // Set default selections when variants load
    useEffect(() => {
        if (hasSizes && availableSizes.length > 0 && !selectedSize) {
            setSelectedSize(availableSizes[0]);
        }
        if (hasColors && availableColors.length > 0 && !selectedColor) {
            setSelectedColor(availableColors[0]);
        }
    }, [availableSizes, availableColors, hasSizes, hasColors, selectedSize, selectedColor]);

    useEffect(() => {
        if (wishlistItems) {
            const productInWishlist = wishlistItems.some(
                (item) => item.product_id === product?.id
            );
            setIsWishlisted(productInWishlist);
        }
    }, [wishlistItems, product?.id]);

    // Handle scroll to show/hide mobile actions
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Hide floating bar when:
            // 1. Scrolled past 80% of viewport height (getting to bottom content)
            // 2. Within 300px of document bottom (footer area)
            const hideThreshold = windowHeight * 0.8;
            const nearBottom = scrollY + windowHeight >= documentHeight - 300;
            
            setShowMobileActions(scrollY < hideThreshold && !nearBottom);
        };

        // Only add listener on mobile
        if (window.innerWidth < 768) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // Initial check
            handleScroll();
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const handleWishlistClick = async (e) => {
        e.preventDefault();

        if (!user) {
            router.push("/auth/login");
            return;
        }

        try {
            if (isWishlisted) {
                await deleteFromWishlist({ userId: user.id, productId: product.id });
                setIsWishlisted(false);
            } else {
                await addToWishlist({ userId: user.id, productId: product.id });
                setIsWishlisted(true);
            }
        } catch (err) {
            console.error("Error updating wishlist:", err);
        }
    };

    const handleAddToCart = async () => {
        if (isAddingToCart || !product) return;

        // Validate stock
        if (currentStock < quantity) {
            toast.error("Insufficient stock", {
                description: `Only ${currentStock} items available`,
                duration: 3000,
                position: "top-right",
                style: {
                    background: 'var(--secondarycolor)',
                    color: 'var(--warningcolor)',
                },
            });
            return;
        }

        // Validate required selections
        if (hasSizes && !selectedSize) {
            toast.error("Please select a size", {
                duration: 3000,
                position: "top-right",
                style: {
                    background: 'var(--secondarycolor)',
                    color: 'var(--warningcolor)',
                },
            });
            return;
        }

        if (hasColors && !selectedColor) {
            toast.error("Please select a color", {
                duration: 3000,
                position: "top-right",
                style: {
                    background: 'var(--secondarycolor)',
                    color: 'var(--warningcolor)',
                },
            });
            return;
        }

        setIsAddingToCart(true);

        try {
            // Create unique identifier for cart item (includes variant info)
            const cartItemId = `${product.id}-${selectedSize || 'no-size'}-${selectedColor || 'no-color'}`;

            const existingItemIndex = cartItems.findIndex(
                (item) => item.cartItemId === cartItemId
            );

            let updatedCart;
            if (existingItemIndex !== -1) {
                updatedCart = cartItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                const newItem = {
                    cartItemId,
                    productId: product.id,
                    variantId: currentVariant?.id || null,
                    selectedSize,
                    selectedColor,
                    quantity,
                    total_amount: currentPrice * quantity,
                    product: {
                        id: product.id,
                        name: product.name,
                        price: currentPrice,
                        image_url: currentImage,
                        category_name: product.category_name,
                    },
                };
                updatedCart = [...cartItems, newItem];
            }

            updateCart(updatedCart);

            const variantText = [selectedSize, selectedColor].filter(Boolean).join(', ');
            const description = variantText
                ? `${quantity} ${product.name} (${variantText}) added to your cart`
                : `${quantity} ${product.name} added to your cart`;

            toast.success("Added to cart", {
                description,
                duration: 3000,
                position: "top-right",
                style: {
                    background: 'var(--secondarycolor)',
                    color: 'var(--primarycolor)',
                },
            });
        } catch (error) {
            toast.error("Failed to add to cart", {
                description: "Please try again",
                duration: 3000,
                position: "top-right",
                style: {
                    background: 'var(--secondarycolor)',
                    color: 'var(--warningcolor)',
                },
            });
        } finally {
            setIsAddingToCart(false);
        }
    };


    if (!products) {
        return <p className="text-primarycolor text-center">Loading...</p>;
    }

    if (!product) {
        return <p className="text-primarycolor text-center">Product not found</p>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Clean Header */}
            <div className="flex justify-between items-center p-4 bg-white sticky top-0 z-40 border-b border-primarycolor/10">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl hover:bg-primarycolor/10 transition-colors duration-200"
                >
                    <ChevronLeft className="w-6 h-6 text-primarycolor" />
                </button>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-xl hover:bg-primarycolor/10 transition-colors duration-200"
                    >
                        <Share2 className="w-5 h-5 text-primarycolor" />
                    </button>
                    <button
                        onClick={handleWishlistClick}
                        className="p-2 rounded-xl hover:bg-primarycolor/10 transition-colors duration-200"
                    >
                        {isWishlisted ? (
                            <HeartSolid className="w-5 h-5 text-secondarycolor" />
                        ) : (
                            <Heart className="w-5 h-5 text-primarycolor" />
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto md:max-w-7xl px-4 pb-20 md:pb-8">
                <div className="md:flex md:gap-12 md:items-start">
                    {/* Product Images Section */}
                    <div className="md:w-1/2">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-primarycolor/5 rounded-2xl overflow-hidden mb-4 border border-primarycolor/10">
                            <Image
                                src={productImages[currentImageIndex] || product.image_url}
                                alt={product.name}
                                fill
                                className="object-contain p-8"
                                priority
                            />
                        </div>

                        {/* Image Dots Indicator */}
                        {productImages.length > 1 && (
                            <div className="flex justify-center space-x-2 mb-6">
                                {productImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                                                ? 'bg-primarycolor w-6'
                                                : 'bg-primarycolor/30'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="md:w-1/2 space-y-6">
                        {/* Brand */}
                        <div className="text-sm font-medium text-primarycolorvariant uppercase tracking-wide">
                            {product.category_name}
                        </div>

                        {/* Product Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-primarycolor leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= (product.rating || 4)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-primarycolor/20 text-primarycolor/20"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-primarycolor">
                                4.8 ({product.reviews || 217} Reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl font-bold text-primarycolor">
                                Ksh {(currentPrice * (1 - (product?.discount || 0) / 100)).toFixed(0)}
                            </span>
                            {product?.discount > 0 && (
                                <>
                                    <span className="text-xl text-primarycolorvariant line-through">
                                        Ksh {currentPrice}
                                    </span>
                                    <span className="px-2 py-1 bg-secondarycolor/20 text-primarycolor text-sm font-medium rounded-lg">
                                        -{product.discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Compact Size Selection */}
                        {hasSizes && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-primarycolor">
                                        Size {selectedSize && <span className="text-primarycolor/60">• {selectedSize}</span>}
                                    </h3>
                                    {!selectedSize && <span className="text-xs text-amber-600">Required</span>}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSizes.map((size) => {
                                        const isSelected = selectedSize === size;
                                        const isOutOfStock = getVariantStock(size, selectedColor) === 0;

                                        return (
                                            <button
                                                key={size}
                                                onClick={() => !isOutOfStock && setSelectedSize(size)}
                                                disabled={isOutOfStock}
                                                className={`
                          relative h-8 min-w-[32px] px-2 rounded-lg border font-medium text-xs
                          transition-all duration-150 flex items-center justify-center
                          ${isOutOfStock
                                                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-primarycolor bg-primarycolor text-white shadow-sm'
                                                            : 'border-primarycolor/40 text-primarycolor hover:border-primarycolor hover:bg-primarycolor/5'
                                                    }
                        `}
                                                aria-label={`Size ${size}${isOutOfStock ? ' - Out of stock' : ''}`}
                                            >
                                                <span className={isOutOfStock ? 'line-through' : ''}>{size}</span>
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-4 h-0.5 bg-gray-400 rotate-45"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Compact Color Selection */}
                        {hasColors && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-primarycolor">
                                        Color {selectedColor && <span className="text-primarycolor/60 capitalize">• {selectedColor}</span>}
                                    </h3>
                                    {!selectedColor && <span className="text-xs text-amber-600">Required</span>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableColors.map((color) => {
                                        const isSelected = selectedColor === color;
                                        const isOutOfStock = getVariantStock(selectedSize, color) === 0;

                                        // Color mapping for visual representation
                                        const getColorStyle = (colorName) => {
                                            const colorMap = {
                                                'black': '#000000',
                                                'white': '#FFFFFF',
                                                'red': '#EF4444',
                                                'blue': '#3B82F6',
                                                'green': '#10B981',
                                                'yellow': '#F59E0B',
                                                'purple': '#8B5CF6',
                                                'pink': '#EC4899',
                                                'gray': '#6B7280',
                                                'brown': '#92400E',
                                                'orange': '#F97316',
                                                'navy': '#1E3A8A',
                                                'maroon': '#7F1D1D',
                                                'beige': '#F5F5DC',
                                                'khaki': '#F0E68C',
                                                'olive': '#6B7280'
                                            };

                                            const colorKey = colorName.toLowerCase();
                                            return colorMap[colorKey] || '#9CA3AF'; // fallback to gray
                                        };

                                        return (
                                            <button
                                                key={color}
                                                onClick={() => !isOutOfStock && setSelectedColor(color)}
                                                disabled={isOutOfStock}
                                                className={`
                          relative group h-7 w-7 rounded-full border-2 transition-all duration-150 flex items-center justify-center
                          ${isOutOfStock
                                                        ? 'cursor-not-allowed opacity-40'
                                                        : 'hover:shadow-md hover:scale-110'
                                                    }
                          ${isSelected
                                                        ? 'border-primarycolor shadow-md ring-2 ring-primarycolor/20 scale-110'
                                                        : 'border-gray-300 hover:border-primarycolor/50'
                                                    }
                        `}
                                                style={{
                                                    backgroundColor: getColorStyle(color),
                                                    borderWidth: '2px'
                                                }}
                                                aria-label={`Color ${color}${isOutOfStock ? ' - Out of stock' : ''}`}
                                                title={color}
                                            >
                                                {/* White border for light colors */}
                                                {['white', 'beige', 'yellow'].includes(color.toLowerCase()) && (
                                                    <div className="absolute inset-0.5 rounded-full border border-gray-300"></div>
                                                )}

                                                {/* Selected checkmark */}
                                                {isSelected && (
                                                    <svg
                                                        className={`w-3 h-3 ${['white', 'beige', 'yellow'].includes(color.toLowerCase())
                                                                ? 'text-primarycolor'
                                                                : 'text-white'
                                                            }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}

                                                {/* Out of stock indicator */}
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-4 h-0.5 bg-gray-600 rotate-45"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Compact Quantity & Price */}
                        <div className="flex items-center justify-between bg-primarycolor/5 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-primarycolor">Qty:</span>
                                <div className="flex items-center border border-primarycolor/30 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className="p-1.5 hover:bg-primarycolor/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Decrease quantity"
                                    >
                                        <svg className="w-3 h-3 text-primarycolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>

                                    <div className="px-3 py-1.5 border-x border-primarycolor/30 min-w-[40px] text-center">
                                        <span className="font-medium text-primarycolor text-sm">{quantity}</span>
                                    </div>

                                    <button
                                        onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                        disabled={quantity >= currentStock}
                                        className="p-1.5 hover:bg-primarycolor/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Increase quantity"
                                    >
                                        <svg className="w-3 h-3 text-primarycolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="text-xs text-primarycolor/60">
                                    {currentStock > 0 ? `${currentStock} available` : 'Out of stock'}
                                </span>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-primarycolor/60">Total</div>
                                <div className="text-lg font-bold text-primarycolor">
                                    Ksh {(currentPrice * quantity * (1 - (product?.discount || 0) / 100)).toFixed(0)}
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Action Buttons - Hidden on Mobile */}
                        <div className="space-y-3 hidden md:block">
                            {/* Primary Actions Row */}
                            <div className="flex space-x-3">
                                {/* Wishlist Button */}
                                <button
                                    onClick={handleWishlistClick}
                                    className={`
                    p-4 rounded-2xl border-2 transition-all duration-200 min-w-[56px] flex items-center justify-center
                    ${isWishlisted
                                            ? 'border-secondarycolor bg-secondarycolor/20 shadow-md'
                                            : 'border-primarycolor/30 hover:border-primarycolor hover:bg-primarycolor/10 hover:shadow-sm'
                                        }
                  `}
                                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    {isWishlisted ? (
                                        <HeartSolid className="w-6 h-6 text-secondarycolor" />
                                    ) : (
                                        <Heart className="w-6 h-6 text-primarycolor" />
                                    )}
                                </button>

                                {/* Add to Cart Button */}
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || currentStock === 0 || (hasSizes && !selectedSize) || (hasColors && !selectedColor)}
                                    variant={currentStock === 0 || (hasSizes && !selectedSize) || (hasColors && !selectedColor) ? "disabled" : "primary"}
                                    size="lg"
                                    radius="2xl"
                                    className="flex-1 min-h-[56px] transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                                    loading={isAddingToCart}
                                    loadingText="Adding..."
                                >
                                    {currentStock === 0 ? (
                                        <>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                            </svg>
                                            <span className="text-white">Out of Stock</span>
                                        </>
                                    ) : (hasSizes && !selectedSize) || (hasColors && !selectedColor) ? (
                                        <>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="text-white">Select Options</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 text-white" />
                                            <span className="text-white">Add to Cart</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Secondary Actions Row */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Buy Now Button */}
                                <Button
                                    disabled={currentStock === 0 || (hasSizes && !selectedSize) || (hasColors && !selectedColor)}
                                    variant={currentStock === 0 || (hasSizes && !selectedSize) || (hasColors && !selectedColor) ? "disabled" : "outline"}
                                    size="md"
                                    radius="xl"
                                    onClick={() => {
                                        handleAddToCart();
                                        // Navigate to checkout after adding to cart
                                        setTimeout(() => router.push('/checkout'), 1000);
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Buy Now
                                </Button>

                                {/* Share Button */}
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    size="md"
                                    radius="xl"
                                    className="border-gray-300 text-gray-600 hover:border-primarycolor hover:text-primarycolor"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                            </div>

                            {/* Validation Messages */}
                            {(hasSizes && !selectedSize) && (
                                <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span>Please select a size to continue</span>
                                </div>
                            )}

                            {(hasColors && !selectedColor) && (
                                <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span>Please select a color to continue</span>
                                </div>
                            )}
                        </div>

                        {/* Product Features & Description - Moved Below Actions */}
                        <div className="space-y-4 mt-6 pt-4 border-t border-primarycolor/10">
                            {/* Compact Product Features */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className={`p-2 rounded-lg ${currentStock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                                    <span className="text-xs font-medium block">
                                        {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                                    <Truck className="w-4 h-4 mx-auto mb-1" />
                                    <span className="text-xs font-medium block">Free Delivery</span>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                                    <Shield className="w-4 h-4 mx-auto mb-1" />
                                    <span className="text-xs font-medium block">Authentic</span>
                                </div>
                            </div>

                            {/* Compact Description */}
                            <div>
                                <button
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <h3 className="text-sm font-medium text-primarycolor">Product Details</h3>
                                    <ChevronDown
                                        className={`w-4 h-4 text-primarycolor transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : 'rotate-0'
                                            }`}
                                    />
                                </button>
                                {isDescriptionExpanded && (
                                    <p className="text-xs text-primarycolor/80 mt-2 leading-relaxed">
                                        {product?.description || "No description available"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Related Products Section */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-12 border-t border-primarycolor/10 pt-8">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-primarycolor mb-2">
                                You might also like
                            </h3>
                            <p className="text-primarycolor/70">
                                Similar products from {product.category_name}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <div
                                    key={relatedProduct.id}
                                    className="group cursor-pointer"
                                    onClick={() => router.push(`/product/${relatedProduct.id}`)}
                                >
                                    <div className="bg-primarycolor/5 rounded-2xl overflow-hidden mb-3 aspect-square relative group-hover:shadow-lg transition-all duration-200 border border-primarycolor/10 group-hover:border-primarycolor/30">
                                        <Image
                                            src={relatedProduct.image_url}
                                            alt={relatedProduct.name}
                                            fill
                                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-primarycolor text-sm line-clamp-2 group-hover:text-secondarycolor transition-colors">
                                            {relatedProduct.name}
                                        </h4>
                                        <p className="text-sm font-bold text-primarycolor">
                                            Ksh {(relatedProduct.price * (1 - (relatedProduct.discount || 0) / 100)).toFixed(0)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Mobile Fixed Bottom Action Bar */}
            <div className={`md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-primarycolor/10 z-[60] shadow-lg transition-transform duration-300 ${
                showMobileActions ? 'translate-y-0' : 'translate-y-full'
            }`}>
                {/* Variant Selection Status Bar */}
                {((hasSizes && !selectedSize) || (hasColors && !selectedColor)) && (
                    <div className="flex items-center justify-center space-x-4 p-2 bg-amber-50 border-b border-amber-200">
                        <div className="flex items-center space-x-2 text-xs text-amber-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>
                                Please select {(!selectedSize && hasSizes) && (!selectedColor && hasColors) ? 'size & color' :
                                    (!selectedSize && hasSizes) ? 'size' : 'color'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Main Action Bar */}
                <div className="flex items-center space-x-3 p-3">
                    {/* Compact Price & Quantity */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-primarycolor/70">
                                {quantity > 1 && `${quantity} × `}Total
                            </div>
                            {quantity > 1 && (
                                <QuantitySelector
                                    value={quantity}
                                    onChange={setQuantity}
                                    size="xs"
                                    variant="minimal"
                                    max={currentStock}
                                />
                            )}
                        </div>
                        <div className="text-base font-bold text-primarycolor">
                            Ksh {(currentPrice * quantity * (1 - (product?.discount || 0) / 100)).toFixed(0)}
                        </div>
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistClick}
                        className={`
              p-2.5 rounded-lg border transition-all duration-200 
              ${isWishlisted
                                ? 'border-secondarycolor bg-secondarycolor/20'
                                : 'border-primarycolor/30 hover:border-primarycolor'
                            }
            `}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        {isWishlisted ? (
                            <HeartSolid className="w-4 h-4 text-secondarycolor" />
                        ) : (
                            <Heart className="w-4 h-4 text-primarycolor" />
                        )}
                    </button>

                    {/* Add to Cart Button */}
                    <Button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || currentStock === 0 || (hasSizes && !selectedSize) || (hasColors && !selectedColor)}
                        variant={currentStock === 0 || (hasSizes && !selectedSize) || (hasColors && !selectedColor) ? "disabled" : "primary"}
                        size="md"
                        radius="lg"
                        className="flex-1"
                        loading={isAddingToCart}
                        loadingText="Adding..."
                    >
                        <ShoppingCart className="w-4 h-4 text-white" />
                        <span className="text-white">Add to Cart</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
