"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../context/cartContext";
import { useSupabaseContext } from "../context/supabaseContext";
import { toast } from "sonner";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, updateCart } = useCart();
  const {
    user,
    deliveryAddressData,
    deliveryCost,
    setDeliveryCost,
    createOrder,
    createOrderItems,
    supabase
  } = useSupabaseContext();

  const [currentStep, setCurrentStep] = useState("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [mpesaCode, setMpesaCode] = useState("");
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Memoized calculations
  const { subtotal, totalCost } = useMemo(() => {
    const sub = checkoutItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    return {
      subtotal: sub,
      totalCost: sub + (deliveryCost || 0)
    };
  }, [checkoutItems, deliveryCost]);

  useEffect(() => {
    if (deliveryAddressData) {
      setDeliveryCost(Number(deliveryAddressData.cost));
    }
  }, [deliveryAddressData, setDeliveryCost]);

  useEffect(() => {
    const initializeCheckout = async () => {
      if (hasInitialized) return;

      try {
        const localCart = localStorage.getItem("cart");
        const parsedCart = localCart ? JSON.parse(localCart) : [];
        
        if (parsedCart.length === 0) {
          router.push("/cart");
          return;
        }

        setCheckoutItems(parsedCart);
      } catch (error) {
        toast.error("Error loading checkout data", {
          style: {
            background: 'var(--secondarycolor)',
            color: 'var(--primarycolor)',
          }
        });
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    initializeCheckout();
  }, [hasInitialized, router]);

  const handleOrderConfirmation = async () => {
    if (!mpesaCode) {
      toast.error("Please enter Mpesa code", {
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--primarycolor)',
        }
      });
      return;
    }

    setIsLoading(true);
    setCurrentStep("processing");

    try {
      const orderData = {
        user_id: user.id,
        status: 'PENDING',
        total_amount: totalCost,
        mpesa_code: mpesaCode,
        delivery_option: deliveryAddressData.delivery_option,
        area: deliveryAddressData.area,
        courier_service: deliveryAddressData.courier_service,
        pickup_point: deliveryAddressData.pickup_point,
        delivery_cost: deliveryCost,
        cart_items: checkoutItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdOrder, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      const subscription = supabase
        .channel(`order-${createdOrder.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${createdOrder.id}`
        }, async (payload) => {
          if (payload.new.status === 'CONFIRMED') {
            const orderItems = checkoutItems.map(item => ({
              product_id: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              user_id: user.id
            }));

            await createOrderItems(orderItems);
            setCurrentStep("success");
            
            toast.success(
              <div>
                Order confirmed successfully!
                <div
                  className="mt-2 cursor-pointer text-white hover:text-primarycolorvariant"
                  onClick={() => router.push("/profile?tab=orders")}
                >
                  View Orders
                </div>
              </div>,
              {
                style: {
                  background: 'var(--primarycolor)',
                  color: 'var(--secondarycolor)',
                }
              }
            );

            subscription.unsubscribe();
            localStorage.removeItem("cart");
            updateCart([]);
          }
        })
        .subscribe();

    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error processing order", {
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        }
      });
      setCurrentStep("payment");
    } finally {
      setIsLoading(false);
    }
  };

  const ProgressStepper = ({ currentStep, setCurrentStep }) => {
    const steps = ["summary", "delivery", "payment"];
    const currentIndex = steps.indexOf(currentStep);

    const handleStepClick = (stepIndex) => {
      if (stepIndex < currentIndex) {
        setCurrentStep(steps[stepIndex]);
      }
    };

    return (
      <div className="sticky top-16 bg-white py-4 px-4 border-b">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center relative">
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                  currentIndex >= index
                    ? "bg-primarycolor border-primarycolor"
                    : "border-gray-300"
                }`}
                onClick={() => handleStepClick(index)}
              />
              <span
                className={`text-xs mt-1 transition-colors duration-300 ${
                  currentIndex >= index ? "text-primarycolor" : "text-gray-500"
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
              {index < steps.length - 1 && (
                <div className="absolute top-[50%] -translate-y-1/2 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)]">
                  <div className="absolute inset-0 border-t-2 border-dashed border-gray-300" />
                  <div
                    className={`absolute inset-0 border-t-2 border-primarycolor transition-all duration-500 ease-in-out`}
                    style={{ width: currentIndex > index ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrderSummaryStep = () => (
    <div className="p-4">
      {checkoutItems.length > 0 ? (
        <div className="space-y-4">
          {checkoutItems.map((item) => (
            <div
              key={item.productId}
              className="bg-secondaryvariant rounded-lg p-4 mb-4 flex items-center"
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
                <p className="font-semibold text-primarycolor">
                  {item.product.name}
                </p>
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
              <span className="text-primarycolor">
                Ksh. {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primarycolor">Delivery Cost:</span>
              <span className="text-primarycolor">
                Ksh. {deliveryCost?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-primarycolor">Total:</span>
              <span className="text-primarycolor">
                Ksh. {totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-primarycolor">Your cart is empty</p>
        </div>
      )}
    </div>
  );

  const DeliveryDetailsStep = () => {
    return (
      <div className="my-8 p-6 border-2 border-primarycolor rounded-lg">
        <h3 className="text-2xl font-semibold text-primarycolor mb-6">
          DELIVERY DETAILS
        </h3>
        {deliveryAddressData ? (
          <div className="space-y-4">
            <p className="text-lg">
              <span className="font-medium text-primarycolor">
                Delivery Option:{" "}
              </span>
              <span className="text-secondarycolor">
                {deliveryAddressData.delivery_option}
              </span>
            </p>

            {deliveryAddressData.delivery_option === "Nairobi Delivery" && (
              <p className="text-lg">
                <span className="font-medium text-primarycolor">Area: </span>
                <span className="text-secondarycolor">
                  {deliveryAddressData.area}
                </span>
              </p>
            )}

            {deliveryAddressData.delivery_option === "CBD Pickup Point" && (
              <p className="text-lg">
                <span className="font-medium text-primarycolor">
                  Pickup Point:{" "}
                </span>
                <span className="text-secondarycolor">
                  {deliveryAddressData.pickup_point}
                </span>
              </p>
            )}

            {deliveryAddressData.delivery_option === "Rest of Kenya" && (
              <>
                <p className="text-lg">
                  <span className="font-medium text-primarycolor">Area: </span>
                  <span className="text-secondarycolor">
                    {deliveryAddressData.area}
                  </span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-primarycolor">
                    Courier Service:{" "}
                  </span>
                  <span className="text-secondarycolor">
                    {deliveryAddressData.courier_service}
                  </span>
                </p>
              </>
            )}

            <p className="text-lg">
              <span className="font-medium text-primarycolor">
                Delivery Cost:{" "}
              </span>
              <span className="text-secondarycolor">
                Ksh. {deliveryCost}
              </span>
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-primarycolor">No delivery address found</p>
            <button
              onClick={() => router.push("/profile/address")}
              className="mt-4 bg-primarycolor text-white px-6 py-2 rounded-full"
            >
              Add Delivery Address
            </button>
          </div>
        )}
      </div>
    );
  };

  const PaymentStep = () => (
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
          value={mpesaCode}
          onChange={(e) => setMpesaCode(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="sticky top-0 bg-white p-4 flex items-center border-b text-primarycolor">
        <button onClick={() => router.back()} className="text-primarycolor">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold mx-auto">CHECKOUT</h1>
      </div>

      {(currentStep === "summary" ||
        currentStep === "delivery" ||
        currentStep === "payment") && (
        <ProgressStepper
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primarycolor animate-spin" />
        </div>
      ) : (
        <>
          {currentStep === "summary" && <OrderSummaryStep />}
          {currentStep === "delivery" && <DeliveryDetailsStep />}
          {currentStep === "payment" && <PaymentStep />}
          {currentStep === "processing" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 text-primarycolor animate-spin" />
              <p className="mt-4 text-primarycolor">Processing your order...</p>
              <p className="text-primarycolor">This will be confirmed shortly.</p>
            </div>
          )}
          {currentStep === "success" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-green-500 mb-6">
                Order successful!
              </h2>
            </div>
          )}

          {!isLoading && (currentStep === 'summary' || currentStep === 'delivery' || currentStep === 'payment') && (
            <div className="fixed bottom-6 left-0 right-0 px-6">
              <button
                className={`w-full py-4 rounded-full ${
                  currentStep === 'payment' && !mpesaCode 
                    ? 'bg-primarycolor/50 text-white' 
                    : 'bg-primarycolor text-white hover:bg-primarycolor'
                }`}
                onClick={() => {
                  if (currentStep === 'summary') {
                    setCurrentStep('delivery')
                  } else if (currentStep === 'delivery') {
                    setCurrentStep('payment')
                  } else if (currentStep === 'payment') {
                    handleOrderConfirmation()
                  }
                }}
                disabled={currentStep === 'payment' && !mpesaCode}
              >
                {currentStep === 'summary' 
                  ? 'Continue to Delivery' 
                  : currentStep === 'delivery' 
                  ? 'Proceed to Payment' 
                  : 'Confirm Order'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
