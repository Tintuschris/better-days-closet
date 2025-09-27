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

    const variantSizes = variants
      .filter(v => v.size)
      .map(v => v.size);

    const configured = Array.isArray(categoryConfig.available_sizes)
      ? categoryConfig.available_sizes
      : [];

    // Merge configured list with actual variant sizes to ensure any newly created
    // variant size that isn't in the predefined list still shows up as selectable.
    const set = new Set(configured);
    for (const s of variantSizes) set.add(s);
    return Array.from(set);
  }, [variants, categoryConfig]);

  const availableColors = useMemo(() => {
    if (!categoryConfig?.has_colors) return [];

    const variantColors = variants
      .filter(v => v.color)
      .map(v => v.color);

    const configured = Array.isArray(categoryConfig.available_colors)
      ? categoryConfig.available_colors
      : [];

    // Merge configured list with actual variant colors so newly added colors appear.
    const set = new Set(configured);
    for (const c of variantColors) set.add(c);
    return Array.from(set);
  }, [variants, categoryConfig]);

  const getVariantByOptions = (size = null, color = null) => {
    const norm = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v);
    const s = norm(size);
    const c = norm(color);
    return variants.find(variant => {
      const vs = norm(variant.size);
      const vc = norm(variant.color);
      const sizeMatch = !s || vs === s;
      const colorMatch = !c || vc === c;
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
  // Be resilient: if category config says no sizes/colors but variants actually have them,
  // still expose the options so users can select the newly added variants.
  const inferredSizes = variants.some(v => !!v.size);
  const inferredColors = variants.some(v => !!v.color);
  const hasSizes = (categoryConfig?.has_sizes || inferredSizes) && availableSizes.length > 0;
  const hasColors = (categoryConfig?.has_colors || inferredColors) && availableColors.length > 0;

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
