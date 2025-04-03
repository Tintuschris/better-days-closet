"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useSupabaseContext } from "../context/supabaseContext";
import { toast } from "sonner";

const OrderSummaryStep = memo(({ cartItems, subtotal, deliveryCost }) => {
  const totalCost = subtotal + (deliveryCost || 0);

  // Helper function to safely format prices
  const formatPrice = (price) => {
    return typeof price === 'number' 
      ? price.toFixed(2) 
      : Number(price).toFixed(2);
  };

  return (
    <div className="space-y-4 px-4 md:px-0">
      {cartItems.map((item) => (
        <div
          key={item.productId}
          className="bg-secondaryvariant rounded-lg p-4 relative"
        >
          {/* Mobile Layout - 2-column with better spacing */}
          <div className="flex md:hidden">
            {/* Product Image */}
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={item.product.image_url}
                alt={item.product.name}
                width={96}
                height={96}
                className="object-cover rounded-lg w-full h-full"
                priority
              />
            </div>
            
            {/* Product Details */}
            <div className="ml-4 flex-1 flex flex-col">
              {/* Product Name */}
              <h3 className="font-semibold text-primarycolor text-base mb-1 line-clamp-2">
                {item.product.name}
              </h3>
              
              {/* Price */}
              <p className="font-bold text-purple-900 text-lg">
                Ksh. {formatPrice(item.product.price * item.quantity)}
              </p>
              
              {/* Quantity */}
              <p className="text-primarycolor text-sm mt-1">
                Quantity: {item.quantity}
              </p>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center">
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              width={80}
              height={80}
              className="object-cover rounded-lg mr-4"
              priority
            />
            <div className="flex-grow">
              <p className="font-semibold text-primarycolor">
                {item.product.name}
              </p>
              <p className="text-primarycolor">
                Quantity: {item.quantity}
              </p>
            </div>
            <div className="flex flex-col items-end min-w-[100px]">
              <p className="font-bold text-purple-900 whitespace-nowrap">
                Ksh. {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex justify-between">
          <span className="text-primarycolor">Subtotal:</span>
          <span className="text-primarycolor">Ksh. {formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primarycolor">Delivery Cost:</span>
          <span className="text-primarycolor">
            Ksh. {deliveryCost ? formatPrice(deliveryCost) : "0.00"}
          </span>
        </div>
        <div className="h-px bg-gray-200 my-2"></div>
        <div className="flex justify-between font-bold">
          <span className="text-primarycolor">Total:</span>
          <span className="text-primarycolor">Ksh. {formatPrice(totalCost)}</span>
        </div>
      </div>
    </div>
  );
});

OrderSummaryStep.displayName = "OrderSummaryStep";

const GuestInfoForm = memo(({ formData, onFormChange }) => {
  return (
    <div className="mb-8 space-y-4">
      <h4 className="text-xl font-semibold text-primarycolor">Guest Information</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-primarycolor mb-2">Full Name</label>
          <input
            type="text"
            defaultValue={formData.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            className="w-full p-3 border border-primarycolor/30 focus:border-primarycolor rounded-lg text-primarycolor focus:outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-primarycolor mb-2">Email</label>
          <input
            type="email"
            defaultValue={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            className="w-full p-3 border border-primarycolor/30 focus:border-primarycolor rounded-lg text-primarycolor focus:outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-primarycolor mb-2">Phone Number</label>
          <input
            type="tel"
            defaultValue={formData.phone}
            onChange={(e) => onFormChange('phone', e.target.value)}
            className="w-full p-3 border border-primarycolor/30 focus:border-primarycolor rounded-lg text-primarycolor focus:outline-none transition-all"
            required
          />
        </div>
      </div>
    </div>
  );
});

GuestInfoForm.displayName = "GuestInfoForm";

const DeliveryDetailsStep = memo(({ user, deliveryAddressData, deliveryCost, guestInfo, setGuestInfo }) => {
  const deliveryInfo = user ? deliveryAddressData : JSON.parse(localStorage.getItem('guestDeliveryDetails'));

  return (
    <div className="my-8 px-4 md:px-0">
      <h3 className="text-2xl font-semibold text-primarycolor mb-6">
        DELIVERY DETAILS
      </h3>
      
      {!user && (
        <GuestInfoForm formData={guestInfo} onFormChange={setGuestInfo} />
      )}

      {deliveryInfo && (
        <div className="space-y-4 bg-gray-50 p-5 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-3">
            <div className="font-medium text-primarycolor md:w-1/3">Delivery Option:</div>
            <div className="text-secondarycolor md:w-2/3">{deliveryInfo.delivery_option}</div>
          </div>

          {deliveryInfo.delivery_option === "Nairobi Delivery" && (
            <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-3">
              <div className="font-medium text-primarycolor md:w-1/3">Area:</div>
              <div className="text-secondarycolor md:w-2/3">{deliveryInfo.area}</div>
            </div>
          )}

          {deliveryInfo.delivery_option === "CBD Pickup Point" && (
            <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-3">
              <div className="font-medium text-primarycolor md:w-1/3">Pickup Point:</div>
              <div className="text-secondarycolor md:w-2/3">{deliveryInfo.pickup_point}</div>
            </div>
          )}

          {deliveryInfo.delivery_option === "Rest of Kenya" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-3">
                <div className="font-medium text-primarycolor md:w-1/3">Area:</div>
                <div className="text-secondarycolor md:w-2/3">{deliveryInfo.area}</div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-3">
                <div className="font-medium text-primarycolor md:w-1/3">Courier Service:</div>
                <div className="text-secondarycolor md:w-2/3">{deliveryInfo.courier_service}</div>
              </div>
            </>
          )}

          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <div className="font-medium text-primarycolor md:w-1/3">Delivery Cost:</div>
            <div className="text-secondarycolor font-semibold md:w-2/3">Ksh. {deliveryCost}</div>
          </div>
        </div>
      )}
    </div>
  );
});

DeliveryDetailsStep.displayName = "DeliveryDetailsStep";

const PaymentStep = memo(({ 
  totalCost, 
  setMpesaCode, 
  user, 
  deliveryInfo, 
  deliveryCost, 
  cartItems 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { createPendingOrder } = useSupabaseContext();

  // Function to format phone number to Safaricom API format
  const formatPhoneNumber = (phone) => {
    // Remove any spaces, hyphens or other special characters
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Remove the plus sign if it exists
    cleaned = cleaned.replace('+', '');
    
    // If number starts with 254, keep it as is
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    
    // If number starts with 0, replace 0 with 254
    if (cleaned.startsWith('0')) {
      return `254${cleaned.slice(1)}`;
    }
    
    // If number starts with 7 or 1, add 254 prefix
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return `254${cleaned}`;
    }
    
    return cleaned;
  };

  // Function to validate phone number
  const validatePhoneNumber = (phone) => {
    const formattedNumber = formatPhoneNumber(phone);
    
    // Check if the formatted number is valid
    if (formattedNumber.length !== 12) {
      return false;
    }
    
    // Check if the number starts with 254 and follows with valid prefixes
    if (!formattedNumber.startsWith('254')) {
      return false;
    }
    
    // Check if the number after 254 starts with valid prefixes
    const prefix = formattedNumber.slice(3, 4);
    return ['7', '1'].includes(prefix);
  };

  const handleSTKPush = async () => {
    if (!phoneNumber) {
      toast.error('Please enter phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    setIsProcessing(true);
    try {
      // Prepare order data
      const orderData = {
        user_id: user?.id,
        total_amount: totalCost,
        delivery_option: deliveryInfo?.delivery_option,
        region: deliveryInfo?.region || null,
        area: deliveryInfo?.area || null,
        courier_service: deliveryInfo?.courier_service || null,
        pickup_point: deliveryInfo?.pickup_point || null,
        delivery_cost: deliveryCost,
        cart_items: cartItems,
      };

      // Initiate STK Push
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          amount: Math.round(totalCost),
          orderData: orderData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      const data = await response.json();
      
      if (data.ResponseCode === '0') {
        // Store checkout request ID
        localStorage.setItem('checkoutRequestId', data.CheckoutRequestID);
        
        // Create pending order using context mutation
        await createPendingOrder({ 
          orderData, 
          checkoutRequestId: data.CheckoutRequestID 
        });

        toast.success('Please check your phone for the STK push');
      } else {
        toast.error(data.ResponseDescription || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to format display phone number as user types
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    // Only allow digits, plus sign, and specific special characters
    value = value.replace(/[^\d+]/g, '');
    setPhoneNumber(value);
  };

  return (
    <div className="p-4 pb-0 md:px-0">
      <h2 className="text-2xl font-semibold text-primarycolor mb-6">
        PAYMENT METHOD
      </h2>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="mb-6 flex justify-center">
          <Image
            src="/mpesa.png"
            alt="Mpesa"
            width={80}
            height={80}
            className="ml-0"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-primarycolor mb-2 text-center">Enter M-Pesa Phone Number</label>
            <input
              type="tel"
              className="w-full p-4 border border-primarycolor/30 text-center text-primarycolor rounded-lg focus:outline-none focus:border-primarycolor transition-all"
              placeholder="e.g., 0712345678"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              maxLength={13} // Allow for +254 format
            />
            <p className="text-sm text-gray-500 mt-1 text-center">
              Format: 0712345678 or 254712345678 or +254712345678
            </p>
          </div>
          
          <button
            className={`w-full py-4 rounded-full ${
              isProcessing ? 'bg-primarycolor/50' : 'bg-primarycolor'
            } text-white flex items-center justify-center transition-all`}
            onClick={handleSTKPush}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-center">Processing...</span>
              </>
            ) : (
              <span className="text-center">Pay with M-Pesa</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

PaymentStep.displayName = "PaymentStep";

const ProgressStepper = memo(({ currentStep, setCurrentStep }) => {
  const steps = useMemo(() => ["summary", "delivery", "payment"], []);
  const currentIndex = steps.indexOf(currentStep);

  const handleStepClick = useCallback((stepIndex) => {
    if (stepIndex < currentIndex) {
      setCurrentStep(steps[stepIndex]);
    }
  }, [currentIndex, setCurrentStep, steps]);

  return (
    <div className="sticky top-16 bg-white py-6 px-4 border-b z-10 lg:top-[72px]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  currentIndex >= index
                    ? "bg-primarycolor border-primarycolor"
                    : "border-gray-300"
                }`}
                onClick={() => handleStepClick(index)}
              >
                {currentIndex > index ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span className={`text-sm font-medium ${currentIndex >= index ? "text-white" : "text-gray-500"}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-sm mt-2 transition-colors duration-300 ${
                  currentIndex >= index ? "text-primarycolor" : "text-gray-500"
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-1/4 h-0.5">
                <div 
                  className={`h-full transition-all duration-500 ease-in-out ${
                    currentIndex > index 
                      ? "bg-primarycolor" 
                      : "bg-gray-300"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

ProgressStepper.displayName = "ProgressStepper";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, updateCart } = useCart();
  const { user, deliveryAddressData, deliveryCost, setDeliveryCost, supabase } = useSupabaseContext();

  const [currentStep, setCurrentStep] = useState("summary");
  const [isLoading, setIsLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [mpesaCode, setMpesaCode] = useState("");

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalCost = useMemo(() => {
    return subtotal + (deliveryCost || 0);
  }, [subtotal, deliveryCost]);

  const handleOrderConfirmation = async () => {
    console.log('Handle order confirmation called');
    console.log('Current mpesa code:', mpesaCode);
    
    if (!mpesaCode) {
      toast.error("Please enter Mpesa code");
      return;
    }

    setIsLoading(true);
    setCurrentStep("processing");
    try {
      const deliveryInfo = user ? deliveryAddressData : JSON.parse(localStorage.getItem('guestDeliveryDetails'));

      const orderData = {
        user_id: user?.id || null,
        status: 'PENDING',
        total_amount: totalCost,
        mpesa_code: mpesaCode,
        delivery_option: deliveryInfo.delivery_option,
        region: deliveryInfo.region || null,
        area: deliveryInfo.area || null,
        courier_service: deliveryInfo.courier_service || null,
        pickup_point: deliveryInfo.pickup_point || null,
        delivery_cost: deliveryCost,
        cart_items: [
          {
            items: cartItems,
            guest_details: !user ? guestInfo : null
          }
        ],
        created_at: new Date().toISOString()
      };

      const { data: createdOrder, error: supabaseError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const subscription = supabase
        .channel(`order-${createdOrder.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${createdOrder.id}`
        }, async (payload) => {
          if (payload.new.status === 'CONFIRMED') {
            setCurrentStep("success");
            localStorage.removeItem("cart");
            updateCart([]);
            
            if (user) {
              toast.success(
                <div>
                  Order confirmed successfully!
                  <div className="mt-2 cursor-pointer text-white hover:text-primarycolorvariant"
                    onClick={() => router.push("/profile?tab=orders")}>
                    View Orders
                  </div>
                </div>
              );
            } else {
              toast.success("Order confirmed successfully! Order details will be sent to your email.");
            }

            subscription.unsubscribe();
            
            setTimeout(() => {
              router.push(user ? "/profile?tab=orders" : "/");
            }, 3000);
          }
        })
        .subscribe();
        
      toast.info("Order placed. Waiting for confirmation...");
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to process order");
      setCurrentStep("payment");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primarycolor" />
        <p className="mt-4 text-primarycolor">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      {/* Header with 3-column layout matching cart page */}
      <div className="sticky top-0 bg-white p-4 flex items-center justify-between border-b text-primarycolor z-50">
        <div className="w-10">
          <button 
            onClick={() => router.back()} 
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-primarycolor">CHECKOUT</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <ProgressStepper currentStep={currentStep} setCurrentStep={setCurrentStep} />

      {/* Desktop Layout - Special layout for summary step */}
      <div className="max-w-6xl mx-auto lg:my-8 lg:px-4">
        {currentStep === "summary" ? (
          // Special layout for summary step on desktop
          <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:p-6">
            <h2 className="text-xl font-bold text-primarycolor mb-6 px-4 lg:px-0">Order Summary</h2>
            <OrderSummaryStep
              cartItems={cartItems}
              subtotal={subtotal}
              deliveryCost={deliveryCost}
            />
            
            {/* Only show this button on desktop, mobile has fixed button at bottom */}
            <div className="mt-8 max-w-md mx-auto px-4 lg:px-0 hidden lg:block">
              <button
                className="w-full py-4 rounded-full bg-primarycolor text-white hover:bg-primarycolor/90"
                onClick={() => setCurrentStep("delivery")}
              >
                Continue to Delivery
              </button>
            </div>
          </div>
        ) : (
          // Two-column layout for delivery and payment steps
          <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            {/* Left Column - Order Summary (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-2 bg-white rounded-lg shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold text-primarycolor mb-6">Order Summary</h2>
              <OrderSummaryStep
                cartItems={cartItems}
                subtotal={subtotal}
                deliveryCost={deliveryCost}
              />
            </div>

            {/* Right Column - Checkout Steps */}
            <div className="lg:col-span-3 bg-white lg:rounded-lg lg:shadow-sm lg:p-6">
              {currentStep === "delivery" && (
                <DeliveryDetailsStep
                  user={user}
                  deliveryAddressData={deliveryAddressData}
                  deliveryCost={deliveryCost}
                  guestInfo={guestInfo}
                  setGuestInfo={(field, value) => {
                    setGuestInfo(prev => ({
                      ...prev,
                      [field]: value
                    }));
                  }}
                />
              )}

              {currentStep === "payment" && (
                <PaymentStep
                  totalCost={totalCost}
                  mpesaCode={mpesaCode}
                  setMpesaCode={setMpesaCode}
                  supabase={supabase}
                  user={user}
                  deliveryInfo={deliveryAddressData}
                  deliveryCost={deliveryCost}
                  cartItems={cartItems}
                />
              )}

              {currentStep === "success" && (
                <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h2 className="text-xl font-semibold text-primarycolor mt-4">
                    Order Confirmed!
                  </h2>
                  <p className="text-primarycolor mt-2">Thank you for your purchase</p>
                </div>
              )}

              {/* Next Step Button - Only for delivery step */}
              {currentStep === "delivery" && (
                <div className="fixed bottom-6 left-0 right-0 px-6 lg:static lg:mt-8">
                  <div className="max-w-md mx-auto">
                    <button
                      className="w-full py-4 rounded-full bg-primarycolor text-white hover:bg-primarycolor/90"
                      onClick={() => {
                        if (!user && (!guestInfo?.name?.trim() || !guestInfo?.email?.trim() || !guestInfo?.phone?.trim())) {
                          toast.error("Please complete guest information");
                          return;
                        }
                        setCurrentStep("payment");
                      }}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Next Step Button - Only for summary step */}
      {currentStep === "summary" && (
        <div className="fixed bottom-6 left-0 right-0 px-6 lg:hidden">
          <div className="max-w-md mx-auto">
            <button
              className="w-full py-4 rounded-full bg-primarycolor text-white hover:bg-primarycolor/90"
              onClick={() => setCurrentStep("delivery")}
            >
              Continue to Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
