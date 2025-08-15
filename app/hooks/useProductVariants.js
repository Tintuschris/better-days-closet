// hooks/useProductVariants.js
"use client";
import { useMemo } from 'react';
import { useSupabaseContext } from '../context/supabaseContext';

export const useProductVariants = (productId) => {
  const { productVariants, categoryAttributes, products } = useSupabaseContext();

  const productData = useMemo(() => {
    if (!products || !productId) return null;
    return products.find(p => p.id.toString() === productId.toString());
  }, [products, productId]);

  const variants = useMemo(() => {
    if (!productVariants || !productId) return [];
    return productVariants.filter(variant => 
      variant.product_id.toString() === productId.toString()
    );
  }, [productVariants, productId]);

  const categoryConfig = useMemo(() => {
    if (!categoryAttributes || !productData?.category_id) return null;
    return categoryAttributes.find(attr => 
      attr.category_id === productData.category_id
    );
  }, [categoryAttributes, productData]);

  const availableSizes = useMemo(() => {
    if (!categoryConfig?.has_sizes) return [];
    
    // Get unique sizes from variants
    const variantSizes = variants
      .filter(v => v.size)
      .map(v => v.size);
    
    // If category has predefined sizes, use those, otherwise use variant sizes
    if (categoryConfig.available_sizes?.length > 0) {
      return categoryConfig.available_sizes;
    }
    
    return [...new Set(variantSizes)];
  }, [variants, categoryConfig]);

  const availableColors = useMemo(() => {
    if (!categoryConfig?.has_colors) return [];
    
    // Get unique colors from variants
    const variantColors = variants
      .filter(v => v.color)
      .map(v => v.color);
    
    // If category has predefined colors, use those, otherwise use variant colors
    if (categoryConfig.available_colors?.length > 0) {
      return categoryConfig.available_colors;
    }
    
    return [...new Set(variantColors)];
  }, [variants, categoryConfig]);

  const getVariantByOptions = (size = null, color = null) => {
    return variants.find(variant => {
      const sizeMatch = !size || variant.size === size;
      const colorMatch = !color || variant.color === color;
      return sizeMatch && colorMatch;
    });
  };

  const getVariantPrice = (size = null, color = null) => {
    const variant = getVariantByOptions(size, color);
    return variant?.price || productData?.price || 0;
  };

  const getVariantStock = (size = null, color = null) => {
    const variant = getVariantByOptions(size, color);
    return variant?.quantity || productData?.quantity || 0;
  };

  const getVariantImage = (size = null, color = null) => {
    const variant = getVariantByOptions(size, color);
    return variant?.image_url || productData?.image_url;
  };

  const hasVariants = variants.length > 0;
  const hasSizes = categoryConfig?.has_sizes && availableSizes.length > 0;
  const hasColors = categoryConfig?.has_colors && availableColors.length > 0;

  return {
    product: productData,
    variants,
    categoryConfig,
    availableSizes,
    availableColors,
    hasVariants,
    hasSizes,
    hasColors,
    getVariantByOptions,
    getVariantPrice,
    getVariantStock,
    getVariantImage,
  };
};
