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

const PaymentStep = memo(({ totalCost, mpesaCode, setMpesaCode }) => (
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

      <ol className="text-sm space-y-2 text-primarycolor">
        <li>1. Go to <strong>Mpesa</strong> menu</li>
        <li>2. Click on <strong>Lipa na Mpesa</strong></li>
        <li>3. Click on <strong>Pay Bill</strong></li>
        <li>4. Enter <strong>Business No. 714888</strong></li>
        <li>5. Enter <strong>Account No. 100345</strong></li>
        <li>6. Enter <strong>Ksh. {totalCost.toFixed(2)}</strong></li>
        <li>7. Click <strong>Ok</strong></li>
        <li>8. Enter the <strong>Mpesa Code</strong> below</li>
        <li>9. <strong>Confirm order</strong></li>
      </ol>
    </div>

    <div className="bg-secondarycolor rounded-t-[2rem] mt-6 -mx-4 px-6 pt-6 pb-28">
      <h3 className="text-lg font-semibold text-primarycolor text-center mb-4">
        Confirm Your Order
      </h3>
      <input
        type="text"
        className="w-full p-4 border border-primarycolor text-center text-primarycolor rounded-full mb-4 focus:outline-none"
        placeholder="Enter Mpesa code"
        defaultValue={mpesaCode}
        onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
      />
    </div>
  </div>
));

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