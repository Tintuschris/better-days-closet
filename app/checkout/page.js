'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/cartContext';
import { useSupabaseContext } from '../context/supabaseContext';
import { toast } from 'sonner';

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const supabaseHook = useSupabase();
  const { getCurrentUserAddress } = useSupabase();
  const { deliveryAddress, deliveryCost } = useSupabaseContext();
  const { updateCart } = useCart();

  const [currentStep, setCurrentStep] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [mpesaCode, setMpesaCode] = useState('');
  const [savedAddress, setSavedAddress] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const initializeCheckout = async () => {
      if (hasInitialized) return;

      try {
        const localCart = localStorage.getItem('cart');
        const parsedCart = localCart ? JSON.parse(localCart) : [];
        setCheckoutItems(parsedCart);
      } catch (error) {
        console.error('Error initializing checkout:', error);
        toast.error('Error loading checkout data');
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    initializeCheckout();
  }, [hasInitialized]);
  // Memoized calculations
  const subtotal = checkoutItems.reduce((acc, item) =>
    acc + (item.product.price * item.quantity), 0
  );
  const ProgressStepper = ({ currentStep, setCurrentStep }) => {
    const steps = ['summary', 'delivery', 'payment'];
    const currentIndex = steps.indexOf(currentStep);

    const handleStepClick = (stepIndex) => {
      if (stepIndex < currentIndex) {
        setCurrentStep(steps[stepIndex]);
      }
    };

    return (
      <div className="sticky top-16 bg-white py-4 px-4 border-b">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Summary Circle */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick(0)}
          >
            <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${currentIndex >= 0 ? 'bg-primarycolor border-primarycolor' : 'border-gray-300'
              }`} />
            <span className={`text-xs mt-1 transition-colors duration-300 ${currentIndex >= 0 ? 'text-primarycolor' : 'text-gray-500'
              }`}>Summary</span>
          </div>

          {/* Line 1 */}
          <div className="flex-1 mx-2 relative">
            <div className="absolute inset-0 border-t-2 border-dashed border-gray-300" />
            <div
              className={`absolute inset-0 border-t-2 border-primarycolor transition-all duration-500 ease-in-out`}
              style={{ width: currentIndex >= 1 ? '100%' : '0%' }}
            />
          </div>

          {/* Delivery Circle */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick(1)}
          >
            <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${currentIndex >= 1 ? 'bg-primarycolor border-primarycolor' : 'border-gray-300'
              }`} />
            <span className={`text-xs mt-1 transition-colors duration-300 ${currentIndex >= 1 ? 'text-primarycolor' : 'text-gray-500'
              }`}>Delivery</span>
          </div>

          {/* Line 2 */}
          <div className="flex-1 mx-2 relative">
            <div className="absolute inset-0 border-t-2 border-dashed border-gray-300" />
            <div
              className={`absolute inset-0 border-t-2 border-primarycolor transition-all duration-500 ease-in-out`}
              style={{ width: currentIndex >= 2 ? '100%' : '0%' }}
            />
          </div>

          {/* Payment Circle */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick(2)}
          >
            <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${currentIndex >= 2 ? 'bg-primarycolor border-primarycolor' : 'border-gray-300'
              }`} />
            <span className={`text-xs mt-1 transition-colors duration-300 ${currentIndex >= 2 ? 'text-primarycolor' : 'text-gray-500'
              }`}>Payment</span>
          </div>
        </div>
      </div>
    );
  };
  const totalCost = subtotal + (deliveryCost || 0);
  const OrderSummaryStep = () => (
    <div className="p-4">
      {checkoutItems.length > 0 ? (
        <div className="space-y-4">
          {checkoutItems.map((item) => (
            <div key={item.productId} className="bg-secondaryvariant rounded-lg p-4 mb-4 flex items-center">
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
              <span className="text-primarycolor">Ksh. {deliveryCost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-primarycolor">Total:</span>
              <span className="text-primarycolor">Ksh. {totalCost.toFixed(2)}</span>
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
    const { deliveryAddress } = useSupabaseContext();

    return (
      <div className="my-8 p-6 border-2 border-primarycolor rounded-lg">
        <h3 className="text-2xl font-semibold text-primarycolor mb-6">DELIVERY DETAILS</h3>
        {deliveryAddress ? (
          <div className="space-y-4">
            <p className="text-lg">
              <span className="font-medium text-primarycolor">Delivery Option: </span>
              <span className="text-secondarycolor">{deliveryAddress.delivery_option}</span>
            </p>

            {deliveryAddress.delivery_option === 'Nairobi Delivery' && (
              <p className="text-lg">
                <span className="font-medium text-primarycolor">Area: </span>
                <span className="text-secondarycolor">{deliveryAddress.area}</span>
              </p>
            )}

            {deliveryAddress.delivery_option === 'CBD Pickup Point' && (
              <p className="text-lg">
                <span className="font-medium text-primarycolor">Pickup Point: </span>
                <span className="text-secondarycolor">{deliveryAddress.pickup_point}</span>
              </p>
            )}

            {deliveryAddress.delivery_option === 'Rest of Kenya' && (
              <>
                {/* <p className="text-lg">
                  <span className="font-medium text-primarycolor">Region: </span>
                  <span className="text-secondarycolor">{deliveryAddress.region}</span>
                </p> */}
                <p className="text-lg">
                  <span className="font-medium text-primarycolor">Area: </span>
                  <span className="text-secondarycolor">{deliveryAddress.area}</span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-primarycolor">Courier Service: </span>
                  <span className="text-secondarycolor">{deliveryAddress.courier_service}</span>
                </p>
              </>
            )}

            <p className="text-lg">
              <span className="font-medium text-primarycolor">Delivery Cost: </span>
              <span className="text-secondarycolor">Ksh. {deliveryAddress.cost}</span>
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-primarycolor">No delivery address found</p>
            <button
              onClick={() => router.push('/profile/address')}
              className="mt-4 bg-primarycolor text-white px-6 py-2 rounded-full"
            >
              Add Delivery Address
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleOrderConfirmation = async () => {
    if (!mpesaCode) {
      toast.error("Please enter Mpesa code");
      return;
    }

    setIsLoading(true);
    setCurrentStep('processing');

    try {
      const orderData = {
        user_id: user.id,
        status: 'PENDING',
        total_amount: totalCost,
        mpesa_code: mpesaCode,
        delivery_option: deliveryAddress.delivery_option,
        region: deliveryAddress.region || null,
        area: deliveryAddress.area || null,
        courier_service: deliveryAddress.courier_service || null,
        pickup_point: deliveryAddress.pickup_point || null,
        delivery_cost: deliveryCost,
        cart_items: checkoutItems // Store current cart items
      };

      const order = await supabaseHook.createOrder(orderData);

      // Subscribe to order status changes
      const subscription = supabaseHook.subscribeToOrderStatus(order.id, async (updatedOrder) => {
        if (updatedOrder.status === 'CONFIRMED') {
          try {
            // Create order items from the stored cart_items
            const orderItems = updatedOrder.cart_items.map(item => ({
              product_id: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              user_id: user.id
            }));

            await supabaseHook.createOrderItems(orderItems);

            // Clear cart from both localStorage and database
            localStorage.removeItem('cart');
            await supabaseHook.clearUserCart(user.id);

            // Update cart context
            updateCart([]);

            toast.success(
              <div>
                Order confirmed successfully!
                <div
                  className="mt-2 cursor-pointer text-white hover:text-primarycolorvariant"
                  onClick={() => router.push('/profile?tab=orders')}
                >
                  Check Orders
                </div>
                <div className="mt-2 h-1 bg-secondarycolor rounded-full animate-shrink" />
              </div>,
              {
                position: 'top-right',
                duration: 5000,
                className: 'custom-toast',
                style: {
                  background: 'var(--primarycolor)',
                  color: 'var(--secondarycolor)',
                  border: '1px solid var(--secondarycolor) '
                }
              }
            );
            setCurrentStep('success');
            subscription.unsubscribe();
          } catch (error) {
            console.error('Error processing confirmed order:', error);
          }
        }
      });

      // Keep UI in processing state until confirmation
      toast.success("Order submitted! Waiting for confirmation...");

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Error processing order");
      setCurrentStep('payment');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="sticky top-0 bg-white p-4 flex items-center border-b text-primarycolor">
        <button onClick={() => router.back()} className="text-primarycolor">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold mx-auto">CHECKOUT</h1>
      </div>

      {/* Only show ProgressStepper in active checkout steps */}
      {(currentStep === 'summary' || currentStep === 'delivery' || currentStep === 'payment') && (
        <ProgressStepper currentStep={currentStep} setCurrentStep={setCurrentStep} />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        </div>
      ) : (
        <>
          {currentStep === 'summary' && <OrderSummaryStep />}
          {currentStep === 'delivery' && <DeliveryDetailsStep />}
          {currentStep === 'payment' && (
            <div className="p-4 pb-0">
              <h2 className="text-4xl font-semibold text-primarycolor mb-4 w-[50%]">PAYMENT METHOD</h2>

              <div className="mb-6">
                <div className="mb-4">
                  <Image src="/mpesa.png" alt="Mpesa" width={64} height={64} className="ml-0" />
                </div>

                <ol className="text-sm space-y-2 text-primarycolor">
                  <li>1. Go to <strong>Mpesa</strong> menu</li>
                  <li>2. Click on <strong>Lipa na Mpesa</strong></li>
                  <li>3. Click on <strong>Pay Bill</strong></li>
                  <li>4. Enter <strong>Business No. 714888</strong></li>
                  <li>5. Enter <strong>Account No. 100345</strong></li>
                  <li>6. Enter <strong>Amount</strong></li>
                  <li>7. Click <strong>Ok</strong></li>
                  <li>8. Enter the <strong>Mpesa Code</strong> in the input box below</li>
                  <li>9. <strong>Confirm order</strong></li>
                </ol>
              </div>
              {currentStep === 'payment' && (
                <div className="bg-secondarycolor rounded-t-[2rem] mt- -mx-4 6 px-6 pt-6 pb-28 h-[50%]]">
                  <h3 className="text-lg font-semibold text-primarycolor text-center mb-4">
                    Confirm Your Order
                  </h3>
                  <input
                    type="text"
                    className="w-full p-4 border border-primarycolor text-center text-primarycolor rounded-full mb-4 focus outline-none"
                    placeholder="Enter Mpesa code"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value)}
                  />
                  <button
                    onClick={handleOrderConfirmation}
                    className="w-full bg-primarycolor text-white py-4 rounded-full"
                  >
                    Confirm Order
                  </button>
                </div>
              )}
            </div>
          )}
          {currentStep === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 text-primarycolor animate-spin" />
              <p className="mt-4 text-primarycolor">Please be patient as we process your order.</p>
              <p className="text-primarycolor">This will be confirmed shortly.</p>
            </div>
          )}
          {currentStep === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-green-500 mb-6">
                Your order was successful.
              </h2>
            </div>
          )}
        </>
      )}

      {/* Only show bottom button during active checkout steps */}
      {!isLoading &&
        (currentStep === 'summary' || currentStep === 'delivery') && (
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
            <button
              className="w-full py-3 rounded-full bg-primarycolor text-white"
              onClick={() => {
                if (currentStep === 'summary') setCurrentStep('delivery');
                else if (currentStep === 'delivery') setCurrentStep('payment');
              }}
            >
              {currentStep === 'summary' ? 'Continue to Delivery' : 'Proceed to Payment'}
            </button>
          </div>
        )}
    </div>
  );
}
