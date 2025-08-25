"use client";
import { useState, useEffect } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { toast } from "sonner";
import { FiPackage, FiSave, FiArrowLeft, FiPlus } from "react-icons/fi";
import { Button, PremiumCard, GradientText } from "../../../components/ui";
import ProductForm from "./productform";
import ProductVariantsForm from "./productvariantsform";

export default function ProductWithVariantsForm({ product, onClose, onSuccess, categories }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [createdProduct, setCreatedProduct] = useState(product);
  const [showVariants, setShowVariants] = useState(false);
  
  const { useProduct } = useSupabase();
  const { data: productData } = useProduct(createdProduct?.id);

  // If editing existing product, show variants immediately
  useEffect(() => {
    if (product?.id) {
      setCurrentStep(2);
      setShowVariants(true);
    }
  }, [product]);

  const handleProductCreated = (newProduct) => {
    setCreatedProduct(newProduct);
    setCurrentStep(2);
    setShowVariants(true);
    toast.success("Product created! Now add variants to manage inventory.");
  };

  const handleProductUpdated = (updatedProduct) => {
    setCreatedProduct(updatedProduct);
    toast.success("Product updated successfully!");
  };

  const handleVariantSuccess = () => {
    // Refresh product data to show updated variant counts
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleFinish = () => {
    toast.success("Product setup completed!");
    if (onSuccess) {
      onSuccess();
    }
    if (onClose) {
      onClose();
    }
  };

  const steps = [
    { number: 1, title: "Product Details", description: "Basic product information" },
    { number: 2, title: "Variants & Inventory", description: "Sizes, colors, and stock" }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Steps */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <GradientText className="text-xl font-bold flex items-center gap-2">
              <FiPackage className="w-5 h-5" />
              {product ? 'Edit Product' : 'Create New Product'}
            </GradientText>
            <p className="text-primarycolor/70 mt-1">
              {product ? 'Update product details and manage variants' : 'Set up your product with variants for better inventory management'}
            </p>
          </div>
          
          {onClose && (
            <Button onClick={onClose} variant="outline">
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center space-x-3 ${
                currentStep >= step.number ? 'text-primarycolor' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step.number 
                    ? 'bg-primarycolor text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs opacity-70">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-primarycolor' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Step Content */}
      {currentStep === 1 && (
        <ProductForm
          product={product}
          onClose={null} // Don't show close button in step 1
          onSuccess={product ? handleProductUpdated : handleProductCreated}
          categories={categories}
        />
      )}

      {currentStep === 2 && createdProduct && (
        <PremiumCard className="p-6">
          <div className="space-y-6">
            {/* Product Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-primarycolor mb-2">Product Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <div className="font-medium">{createdProduct.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Base Price:</span>
                  <div className="font-medium">KSh {createdProduct.price}</div>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <div className="font-medium">{createdProduct.category_name || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium text-green-600">Created</div>
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primarycolor">Product Variants</h3>
                {!showVariants && (
                  <Button
                    onClick={() => setShowVariants(true)}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Variants
                  </Button>
                )}
              </div>

              {showVariants ? (
                <ProductVariantsForm
                  productId={createdProduct.id}
                  product={productData || createdProduct}
                  onSuccess={handleVariantSuccess}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Add variants to manage different sizes, colors, and inventory levels for this product.
                    Each variant can have its own price and stock quantity.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Edit Product Details
              </Button>

              <Button
                onClick={handleFinish}
                className="flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Finish Setup
              </Button>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
}
