"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useSupabaseContext } from "../context/supabaseContext";
import { toast } from "sonner";

const OrderSummaryStep = memo(({ cartItems, subtotal, deliveryCost }) => {
  const totalCost = subtotal + (deliveryCost || 0);

  return (
    <div className="p-4">
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.productId}
            className="bg-secondaryvariant rounded-lg p-4 flex items-center"
          >
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              width={80}
              height={80}
              className="object-cover rounded-lg mr-4"
              priority
            />
            <div className="flex-grow">
              <p className="font-semibold text-primarycolor">{item.product.name}</p>
              <p className="text-primarycolor">Quantity: {item.quantity}</p>
            </div>
            <p className="font-bold text-purple-900">
              Ksh. {(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}

        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-primarycolor">Subtotal:</span>
            <span className="text-primarycolor">Ksh. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primarycolor">Delivery Cost:</span>
            <span className="text-primarycolor">
              Ksh. {deliveryCost?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-primarycolor">Total:</span>
            <span className="text-primarycolor">Ksh. {totalCost.toFixed(2)}</span>
          </div>
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
            <label className="block text-lg text-primarycolor mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className="w-full p-3 border border-primarycolor rounded-lg text-primarycolor"
              required
            />
          </div>
          <div>
            <label className="block text-lg text-primarycolor mb-2">Email</label>
            <input
              type="email"
              defaultValue={formData.email}
              onChange={(e) => onFormChange('email', e.target.value)}
              className="w-full p-3 border border-primarycolor rounded-lg text-primarycolor"
              required
            />
          </div>
          <div>
            <label className="block text-lg text-primarycolor mb-2">Phone Number</label>
            <input
              type="tel"
              defaultValue={formData.phone}
              onChange={(e) => onFormChange('phone', e.target.value)}
              className="w-full p-3 border border-primarycolor rounded-lg text-primarycolor"
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
    <div className="my-8 p-6 border-2 border-primarycolor rounded-lg">
      <h3 className="text-2xl font-semibold text-primarycolor mb-6">
        DELIVERY DETAILS
      </h3>
      
      {!user && (
        <GuestInfoForm formData={guestInfo} onFormChange={setGuestInfo} />
      )}

      {deliveryInfo && (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-medium text-primarycolor">Delivery Option: </span>
            <span className="text-secondarycolor">{deliveryInfo.delivery_option}</span>
          </p>

          {deliveryInfo.delivery_option === "Nairobi Delivery" && (
            <p className="text-lg">
              <span className="font-medium text-primarycolor">Area: </span>
              <span className="text-secondarycolor">{deliveryInfo.area}</span>
            </p>
          )}

          {deliveryInfo.delivery_option === "CBD Pickup Point" && (
            <p className="text-lg">
              <span className="font-medium text-primarycolor">Pickup Point: </span>
              <span className="text-secondarycolor">{deliveryInfo.pickup_point}</span>
            </p>
          )}

          {deliveryInfo.delivery_option === "Rest of Kenya" && (
            <>
              <p className="text-lg">
                <span className="font-medium text-primarycolor">Area: </span>
                <span className="text-secondarycolor">{deliveryInfo.area}</span>
              </p>
              <p className="text-lg">
                <span className="font-medium text-primarycolor">Courier Service: </span>
                <span className="text-secondarycolor">{deliveryInfo.courier_service}</span>
              </p>
            </>
          )}

          <p className="text-lg">
            <span className="font-medium text-primarycolor">Delivery Cost: </span>
            <span className="text-secondarycolor">Ksh. {deliveryCost}</span>
          </p>
        </div>
      )}
    </div>
  );
});

DeliveryDetailsStep.displayName = "DeliveryDetailsStep";

const PaymentStep = memo(({ totalCost, setMpesaCode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

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
      // First create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          status: 'PENDING',
          total_amount: totalCost,
          user_id: user?.id || null,
          delivery_option: deliveryInfo.delivery_option,
          region: deliveryInfo.region || null,
          area: deliveryInfo.area || null,
          courier_service: deliveryInfo.courier_service || null,
          pickup_point: deliveryInfo.pickup_point || null,
          delivery_cost: deliveryCost,
          cart_items: cartItems,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw new Error('Failed to create order');

      // Then initiate STK Push
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          amount: Math.round(totalCost),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      const data = await response.json();
      
      if (data.ResponseCode === '0') {
        // Update order with CheckoutRequestID
        const { error: updateError } = await supabase
          .from('orders')
          .update({ checkout_request_id: data.CheckoutRequestID })
          .eq('id', order.id);

        if (updateError) throw new Error('Failed to update order');

        toast.success('Please check your phone for the STK push');
        localStorage.setItem('checkoutRequestId', data.CheckoutRequestID);
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
    <div className="p-4 pb-0">
      <h2 className="text-4xl font-semibold text-primarycolor mb-4 w-[50%]">
        PAYMENT METHOD
      </h2>

      <div className="mb-6">
        <div className="mb-4">
          <Image
            src="/mpesa.png"
            alt="Mpesa"
            width={64}
            height={64}
            className="ml-0"
            priority
          />
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="tel"
              className="w-full p-4 border border-primarycolor text-center text-primarycolor rounded-full focus:outline-none"
              placeholder="Enter Phone Number (e.g., 0712345678)"
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
            } text-white`}
            onClick={handleSTKPush}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
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
    <div className="sticky top-16 bg-white py-6 px-4 border-b lg:top-[72px]">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                  currentIndex >= index
                    ? "bg-primarycolor border-primarycolor"
                    : "border-gray-300"
                }`}
                onClick={() => handleStepClick(index)}
              />
              {index < steps.length - 1 && (
                <div className="w-24 h-0.5 mx-4">
                  <div 
                    className={`h-full border-t-2 transition-all duration-500 ease-in-out ${
                      currentIndex > index 
                        ? "border-primarycolor border-solid" 
                        : "border-gray-300 border-dashed"
                    }`}
                  />
                </div>
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
        ))}
      </div>
    </div>
  );
});
ProgressStepper.displayName = "ProgressStepper";export default function Checkout() {
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

    setIsLoading(true); // Add this line
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
          toast.info("Order placed. Waiting for confirmation..."); // Add this line

      } catch (error) {
        console.error('Error creating order:', error);
        toast.error("Failed to process order");
        setCurrentStep("payment");
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
        <div className="w-full max-w-3xl mx-auto lg:my-8 lg:shadow-lg lg:bg-white lg:rounded-xl lg:pb-24">
          <div className="sticky top-0 bg-white p-4 flex items-center border-b text-primarycolor z-50 lg:rounded-t-xl">
            <button onClick={() => router.back()} className="text-primarycolor">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold mx-auto">CHECKOUT</h1>
          </div>

          <ProgressStepper currentStep={currentStep} setCurrentStep={setCurrentStep} />

          <div className="w-full max-w-2xl mx-auto px-4 lg:px-8">
            {currentStep === "summary" && (
              <OrderSummaryStep
                cartItems={cartItems}
                subtotal={subtotal}
                deliveryCost={deliveryCost}
              />
            )}

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
              />
            )}

            {currentStep === "success" && (
              <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-xl font-semibold text-primarycolor mt-4">
                  Order Confirmed!
                </h2>
                <p className="text-primarycolor mt-2">Thank you for your purchase</p>
              </div>
            )}
          </div>

          <div className="fixed bottom-6 left-0 right-0 px-6 lg:relative lg:bottom-0 lg:mt-8 lg:mb-8">
            <div className="max-w-2xl mx-auto">
              {!isLoading && (currentStep === "summary" || currentStep === "delivery" || currentStep === "payment") && (
                <button
                  className={`w-full py-4 rounded-full ${
                    currentStep === "payment" && !mpesaCode
                      ? "bg-primarycolor/50 text-white"
                      : "bg-primarycolor text-white hover:bg-primarycolor"
                  }`}
                  onClick={() => {
                    if (currentStep === "summary") {
                      setCurrentStep("delivery");
                    } else if (currentStep === "delivery") {
                      console.log('Current guestInfo:', guestInfo);
                      if (!user && (!guestInfo?.name?.trim() || !guestInfo?.email?.trim() || !guestInfo?.phone?.trim())) {
                        toast.error("Please complete guest information");
                        return;
                      }
                      setCurrentStep("payment");
                    } else if (currentStep === "payment") {
                      handleOrderConfirmation();
                    }
                  }}
                  disabled={currentStep === "payment" && !mpesaCode}
                >
                  {currentStep === "summary"
                    ? "Continue to Delivery"
                    : currentStep === "delivery"
                    ? "Proceed to Payment"
                    : "Confirm Order"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }