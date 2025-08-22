"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, ChevronLeft, Loader2, AlertCircle, ArrowLeft, ChevronRight } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useSupabaseContext } from "../context/supabaseContext";
import { toast } from "sonner";
import DeliveryModal from "../components/DeliveryModal";
import { Button, Input, FormGroup, Label, GlassContainer } from "../components/ui";
import UnifiedCheckoutButton from "../components/UnifiedCheckoutButton";

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
          className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-2xl p-4 shadow-lg shadow-primarycolor/5 relative"
        >
          {/* Mobile Layout - Premium 2-column with better spacing */}
          <div className="flex md:hidden">
            {/* Product Image */}
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={item.product.image_url}
                alt={item.product.name}
                width={96}
                height={96}
                className="object-cover rounded-xl w-full h-full shadow-md"
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
              <p className="font-bold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent text-lg">
                Ksh. {formatPrice(item.product.price * item.quantity)}
              </p>
              
              {/* Quantity */}
              <p className="text-primarycolor text-sm mt-1">
                Quantity: {item.quantity}
              </p>
            </div>
          </div>

          {/* Premium Desktop Layout */}
          <div className="hidden md:flex md:items-center">
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              width={80}
              height={80}
              className="object-cover rounded-xl mr-4 shadow-md"
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
              <p className="font-bold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent whitespace-nowrap">
                Ksh. {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 backdrop-blur-lg bg-white/70 border border-white/30 p-4 rounded-2xl space-y-3 shadow-lg shadow-primarycolor/5">
        <div className="flex justify-between">
          <span className="text-primarycolor">Subtotal:</span>
          <span className="text-primarycolor font-medium">Ksh. {formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primarycolor">Delivery Cost:</span>
          <span className="text-primarycolor font-medium">
            Ksh. {deliveryCost ? formatPrice(deliveryCost) : "0.00"}
          </span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primarycolor/20 to-transparent my-2"></div>
        <div className="flex justify-between font-bold">
          <span className="bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">Total:</span>
          <span className="bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">Ksh. {formatPrice(totalCost)}</span>
        </div>
      </div>
    </div>
  );
});

OrderSummaryStep.displayName = "OrderSummaryStep";

const GuestInfoForm = memo(({ formData, onFormChange, onFocusChange }) => {
  const handleFocus = () => {
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    // Delay blur to allow for navigation between fields
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isFormField = activeElement?.closest('[data-guest-form]');
      if (!isFormField) {
        onFocusChange?.(false);
      }
    }, 100);
  };

  return (
    <div className="mb-8 space-y-6" data-guest-form>
      <h4 className="text-xl font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">Guest Information</h4>
      <GlassContainer className="p-6 space-y-4">
        <FormGroup>
          <Label htmlFor="guest-name">Full Name</Label>
          <Input
            id="guest-name"
            type="text"
            defaultValue={formData.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter your full name"
            variant="premium"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="guest-email">Email</Label>
          <Input
            id="guest-email"
            type="email"
            defaultValue={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter your email address"
            variant="premium"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="guest-phone">Phone Number</Label>
          <Input
            id="guest-phone"
            type="tel"
            defaultValue={formData.phone}
            onChange={(e) => onFormChange('phone', e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter your phone number"
            variant="premium"
            required
          />
        </FormGroup>
      </GlassContainer>
    </div>
  );
});

GuestInfoForm.displayName = "GuestInfoForm";

const DeliveryDetailsStep = memo(({ user, deliveryAddressData, deliveryCost, guestInfo, setGuestInfo, onFormFocusChange, onDeliveryUpdate }) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [guestDeliveryInfo, setGuestDeliveryInfo] = useState(null);

  // Safely get guest delivery info on client side
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('guestDeliveryDetails');
        setGuestDeliveryInfo(stored ? JSON.parse(stored) : null);
      } catch (error) {
        console.error('Error parsing guest delivery details:', error);
        setGuestDeliveryInfo(null);
      }
    }
  }, [user]);

  const deliveryInfo = user ? deliveryAddressData : guestDeliveryInfo;

  const handleDeliverySelection = (deliveryData) => {
    // Store in localStorage for guest users
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestDeliveryDetails', JSON.stringify(deliveryData));
    }
    setGuestDeliveryInfo(deliveryData);
    // Update parent component with delivery cost
    onDeliveryUpdate(deliveryData.cost);
    setShowDeliveryModal(false);
  };

  return (
    <div className="my-8 px-4 md:px-0 pb-24 lg:pb-8">
      <h3 className="text-2xl font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent mb-6">
        DELIVERY DETAILS
      </h3>
      
      {!user && (
        <GuestInfoForm 
          formData={guestInfo} 
          onFormChange={setGuestInfo}
          onFocusChange={onFormFocusChange}
        />
      )}

      {/* Delivery Address Selection for Guests */}
      {!user && !deliveryInfo && (
        <GlassContainer className="mb-6 p-6">
          <div className="text-center space-y-4">
            <div className="text-primarycolor font-medium text-lg">Select Your Delivery Option</div>
            <div className="text-primarycolor/70 text-sm">Choose how you'd like to receive your order</div>
            <Button
              onClick={() => setShowDeliveryModal(true)}
              size="lg"
              fullWidth
              variant="primary"
            >
              Choose Delivery Address
            </Button>
          </div>
        </GlassContainer>
      )}

      {/* Delivery Address Selection for Guests - Edit Mode */}
      {!user && deliveryInfo && (
        <GlassContainer className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="text-primarycolor font-medium">Delivery Address</div>
            <Button
              onClick={() => setShowDeliveryModal(true)}
              size="sm"
              variant="outline"
            >
              Change Address
            </Button>
          </div>
        </GlassContainer>
      )}

      {deliveryInfo && (
        <div className="space-y-4 backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-lg shadow-primarycolor/5">
          <div className="flex flex-col md:flex-row md:items-center border-b border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pb-3">
            <div className="font-medium text-primarycolor md:w-1/3">Delivery Option:</div>
            <div className="text-secondarycolor font-medium md:w-2/3">{deliveryInfo.delivery_option}</div>
          </div>

          {deliveryInfo.delivery_option === "Nairobi Delivery" && (
            <div className="flex flex-col md:flex-row md:items-center border-b border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pb-3">
              <div className="font-medium text-primarycolor md:w-1/3">Area:</div>
              <div className="text-secondarycolor font-medium md:w-2/3">{deliveryInfo.area}</div>
            </div>
          )}

          {deliveryInfo.delivery_option === "CBD Pickup Point" && (
            <div className="flex flex-col md:flex-row md:items-center border-b border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pb-3">
              <div className="font-medium text-primarycolor md:w-1/3">Pickup Point:</div>
              <div className="text-secondarycolor font-medium md:w-2/3">{deliveryInfo.pickup_point}</div>
            </div>
          )}

          {deliveryInfo.delivery_option === "Rest of Kenya" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center border-b border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pb-3">
                <div className="font-medium text-primarycolor md:w-1/3">Region:</div>
                <div className="text-secondarycolor font-medium md:w-2/3">{deliveryInfo.region}</div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pb-3">
                <div className="font-medium text-primarycolor md:w-1/3">Area:</div>
                <div className="text-secondarycolor font-medium md:w-2/3">{deliveryInfo.area}</div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pb-3">
                <div className="font-medium text-primarycolor md:w-1/3">Courier Service:</div>
                <div className="text-secondarycolor font-medium md:w-2/3">{deliveryInfo.courier_service}</div>
              </div>
            </>
          )}

          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <div className="font-medium text-primarycolor md:w-1/3">Delivery Cost:</div>
            <div className="bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent font-bold md:w-2/3">
              Ksh. {(() => {
                const cost = deliveryCost || (deliveryInfo?.cost) || 0;
                console.log('💰 Displaying delivery cost:', cost, 'from deliveryCost:', deliveryCost, 'from deliveryInfo.cost:', deliveryInfo?.cost);
                return Number(cost).toLocaleString();
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal for Guests */}
      {showDeliveryModal && (
        <DeliveryModal
          onClose={() => setShowDeliveryModal(false)}
          onSelect={handleDeliverySelection}
        />
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
  cartItems,
  phoneNumber,
  onPhoneNumberChange,
  isProcessing
}) => {

  return (
    <div className="p-4 pb-0 md:px-0">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent mb-6">
        PAYMENT METHOD
      </h2>

      <div className="backdrop-blur-lg bg-white/70 border border-white/30 p-6 rounded-2xl shadow-lg shadow-primarycolor/5">
        <div className="mb-6 flex justify-center">
          <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg shadow-primarycolor/5">
            <Image
              src="/mpesa.png"
              alt="Mpesa"
              width={80}
              height={80}
              className="ml-0"
              priority
            />
          </div>
        </div>

        <div className="space-y-6">
          <FormGroup>
            <Label htmlFor="mpesa-phone" className="text-center">Enter M-Pesa Phone Number</Label>
            <Input
              id="mpesa-phone"
              type="tel"
              className="text-center"
              placeholder="e.g., 0712345678"
              value={phoneNumber}
              onChange={onPhoneNumberChange}
              maxLength={13}
              variant="premium"
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Format: 0712345678 or 254712345678 or +254712345678
            </p>
          </FormGroup>
          
          {/* Payment button now handled by UnifiedCheckoutButton */}
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
    <div className="sticky top-16 backdrop-blur-xl bg-white/90 py-6 px-4 border-b border-white/30 z-10 lg:top-[72px] shadow-lg shadow-primarycolor/5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg ${
                  currentIndex >= index
                    ? "bg-gradient-to-r from-primarycolor to-primarycolor/90 border-primarycolor shadow-primarycolor/30"
                    : "border-gray-300 bg-white shadow-gray-200"
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
                className={`text-sm mt-2 font-medium transition-colors duration-300 ${
                  currentIndex >= index ? "bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent" : "text-gray-500"
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-1/4 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-in-out rounded-full ${
                    currentIndex > index 
                      ? "bg-gradient-to-r from-primarycolor to-primarycolor/90" 
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

  // Debug delivery cost and ensure it's set for authenticated users
  useEffect(() => {
    console.log('🔍 Checkout Debug - User:', !!user);
    console.log('🔍 Checkout Debug - deliveryAddressData:', deliveryAddressData);
    console.log('🔍 Checkout Debug - deliveryCost:', deliveryCost, 'type:', typeof deliveryCost);

    // Ensure delivery cost is set for authenticated users
    if (user && deliveryAddressData && deliveryAddressData.cost && !deliveryCost) {
      console.log('🔧 Setting delivery cost from address data:', deliveryAddressData.cost);
      setDeliveryCost(Number(deliveryAddressData.cost));
    }
  }, [user, deliveryAddressData, deliveryCost, setDeliveryCost]);

  const [currentStep, setCurrentStep] = useState("summary");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [guestDeliveryDetails, setGuestDeliveryDetails] = useState(null);

  const [mpesaCode, setMpesaCode] = useState("");
  const { createPendingOrder } = useSupabaseContext();

  // Safely load guest delivery details on client side
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('guestDeliveryDetails');
        setGuestDeliveryDetails(stored ? JSON.parse(stored) : null);
      } catch (error) {
        console.error('Error parsing guest delivery details:', error);
        setGuestDeliveryDetails(null);
      }
    }
  }, [user]);

  // Function to format phone number to Safaricom API format
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different input formats
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }

    return cleaned;
  };

  // Function to validate Kenyan phone number
  const isValidKenyanNumber = (phone) => {
    const formattedNumber = formatPhoneNumber(phone);

    // Must be 12 digits starting with 254
    if (formattedNumber.length !== 12 || !formattedNumber.startsWith('254')) {
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

    if (!isValidKenyanNumber(phoneNumber)) {
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
        delivery_option: user ? deliveryAddressData?.delivery_option : guestDeliveryDetails?.delivery_option,
        region: user ? deliveryAddressData?.region : guestDeliveryDetails?.region,
        area: user ? deliveryAddressData?.area : guestDeliveryDetails?.area,
        courier_service: user ? deliveryAddressData?.courier_service : guestDeliveryDetails?.courier_service,
        pickup_point: user ? deliveryAddressData?.pickup_point : guestDeliveryDetails?.pickup_point,
        delivery_cost: deliveryCost,
        cart_items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        guest_info: !user ? guestInfo : null
      };

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
        if (typeof window !== 'undefined') {
          localStorage.setItem('checkoutRequestId', data.CheckoutRequestID);
        }

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

  // Smart button visibility management
  useEffect(() => {
    let scrollTimeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      // Hide button when scrolling down, show when scrolling up or form is focused
      if (currentStep === "delivery" && !user) {
        if (isFormFocused) {
          setIsButtonVisible(false);
        } else if (isScrollingDown && currentScrollY > 100) {
          setIsButtonVisible(false);
        } else {
          setIsButtonVisible(true);
        }
      }
      
      lastScrollY = currentScrollY;
      
      // Auto-show button after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isFormFocused) {
          setIsButtonVisible(true);
        }
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentStep, user, isFormFocused]);

  // Handle form focus changes
  const handleFormFocusChange = useCallback((focused) => {
    setIsFormFocused(focused);
    setIsButtonVisible(!focused);
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalCost = useMemo(() => {
    console.log('Calculating total cost - subtotal:', subtotal, 'deliveryCost:', deliveryCost, 'type:', typeof deliveryCost);
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
      const deliveryInfo = user ? deliveryAddressData : guestDeliveryDetails;

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
            if (typeof window !== 'undefined') {
              localStorage.removeItem("cart");
            }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Premium Header with glass morphism */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 p-4 flex items-center justify-between text-primarycolor z-50 shadow-lg shadow-primarycolor/5">
        <div className="w-10">
          <button 
            onClick={() => router.back()} 
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">CHECKOUT</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <ProgressStepper currentStep={currentStep} setCurrentStep={setCurrentStep} />

      {/* Desktop Layout - Special layout for summary step */}
      <div className="max-w-6xl mx-auto lg:my-8 lg:px-4">
        {currentStep === "summary" ? (
          // Premium layout for summary step on desktop
          <div className="lg:backdrop-blur-lg lg:bg-white/80 lg:border lg:border-white/20 lg:rounded-2xl lg:shadow-xl lg:shadow-primarycolor/10 lg:p-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent mb-6 px-4 lg:px-0">Order Summary</h2>
            <OrderSummaryStep
              cartItems={cartItems}
              subtotal={subtotal}
              deliveryCost={deliveryCost}
            />

            {/* Desktop Button for Summary Step */}
            <div className="hidden lg:block">
              <div className="flex justify-center pt-6 border-t border-primarycolor/10 mt-6">
                <Button
                  onClick={() => setCurrentStep("delivery")}
                  variant="primary"
                  size="lg"
                  disabled={cartItems.length === 0}
                  className="flex items-center gap-2 shadow-lg shadow-primarycolor/30 px-8 py-3 font-semibold"
                >
                  <span className="whitespace-nowrap">Continue to Delivery</span>
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Premium two-column layout for delivery and payment steps
          <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            {/* Premium Left Column - Order Summary (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-2 backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl shadow-xl shadow-primarycolor/10 p-6 h-fit">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent mb-6">Order Summary</h2>
              <OrderSummaryStep
                cartItems={cartItems}
                subtotal={subtotal}
                deliveryCost={deliveryCost}
              />
            </div>

            {/* Premium Right Column - Checkout Steps */}
            <div className="lg:col-span-3 backdrop-blur-lg bg-white/80 border border-white/20 lg:rounded-2xl lg:shadow-xl lg:shadow-primarycolor/10 lg:p-6">
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
                  onFormFocusChange={handleFormFocusChange}
                  onDeliveryUpdate={(cost) => {
                    setDeliveryCost(cost);
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
                  phoneNumber={phoneNumber}
                  onPhoneNumberChange={handlePhoneNumberChange}
                  isProcessing={isProcessing}
                />
              )}

              {currentStep === "success" && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 backdrop-blur-xl flex flex-col items-center justify-center z-50">
                  <div className="backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-8 shadow-xl shadow-primarycolor/10 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent mt-4">
                      Order Confirmed!
                    </h2>
                    <p className="text-primarycolor mt-2">Thank you for your purchase</p>
                  </div>
                </div>
              )}

              {/* Desktop Button Navigation - Integrated within content area */}
              <div className="hidden lg:block">
                <div className={`flex items-center gap-4 pt-6 border-t border-primarycolor/10 mt-6 ${
                  currentStep === 'summary' ? 'justify-center' : 'justify-end'
                }`}>
                  {(currentStep === "delivery" || currentStep === "payment") && (
                    <Button
                      onClick={() => {
                        if (currentStep === "delivery") {
                          setCurrentStep("summary");
                        } else if (currentStep === "payment") {
                          setCurrentStep("delivery");
                        }
                      }}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-3 px-6 py-3 border-2 border-primarycolor/30 hover:border-primarycolor/50 hover:bg-primarycolor/5 transition-all"
                    >
                      <ArrowLeft size={20} className="text-primarycolor" />
                      <span className="font-semibold text-primarycolor">Back</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      if (currentStep === "summary") {
                        setCurrentStep("delivery");
                      } else if (currentStep === "delivery") {
                        if (!user && (!guestInfo?.name?.trim() || !guestInfo?.email?.trim() || !guestInfo?.phone?.trim())) {
                          toast.error("Please complete guest information");
                          return;
                        }
                        if (!user && !guestDeliveryDetails) {
                          toast.error("Please select a delivery address");
                          return;
                        }
                        setCurrentStep("payment");
                      } else if (currentStep === "payment") {
                        handleSTKPush();
                      }
                    }}
                    variant="primary"
                    size="lg"
                    loading={isProcessing}
                    disabled={isProcessing || (currentStep === "delivery" && !user && !guestDeliveryDetails) || (currentStep === "payment" && (!phoneNumber || phoneNumber.length < 10))}
                    className="flex items-center gap-2 shadow-lg shadow-primarycolor/30 px-8 py-3 font-semibold"
                  >
                    <span className="whitespace-nowrap">
                      {isProcessing ? 'Processing...' :
                       currentStep === "summary" ? "Continue to Delivery" :
                       currentStep === "delivery" ? "Continue to Payment" :
                       "Complete Payment"}
                    </span>
                    {currentStep !== "payment" && !isProcessing && <ChevronRight size={20} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Only Checkout Navigation */}
      <UnifiedCheckoutButton
        currentStep={currentStep}
        onNext={() => {
          if (currentStep === "summary") {
            setCurrentStep("delivery");
          } else if (currentStep === "delivery") {
            if (!user && (!guestInfo?.name?.trim() || !guestInfo?.email?.trim() || !guestInfo?.phone?.trim())) {
              toast.error("Please complete guest information");
              return;
            }
            if (!user && !guestDeliveryDetails) {
              toast.error("Please select a delivery address");
              return;
            }
            setCurrentStep("payment");
          } else if (currentStep === "payment") {
            handleSTKPush();
          }
        }}
        onBack={() => {
          if (currentStep === "delivery") {
            setCurrentStep("summary");
          } else if (currentStep === "payment") {
            setCurrentStep("delivery");
          }
        }}
        isLoading={isProcessing}
        user={user}
        guestInfo={guestInfo}
        selectedDeliveryOption={user ? deliveryAddressData : guestDeliveryDetails}
        phoneNumber={phoneNumber}
        cartItems={cartItems}
        className="lg:hidden"
      />
    </div>
  );
}
