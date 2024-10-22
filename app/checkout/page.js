'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

export default function Checkout() {
  const router = useRouter();
  const { addToCart, updateCartInDatabase } = useSupabase();
  
  // Step management
  const [currentStep, setCurrentStep] = useState('summary'); // summary, delivery, payment, processing, success
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [cartItems, setCartItems] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState('');
  const [region, setRegion] = useState('');
  const [area, setArea] = useState('');
  const [courierService, setCourierService] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  
  // Order totals
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(300); // Default delivery cost
  
  useEffect(() => {
    // Fetch cart items and calculate totals
    const fetchCart = async () => {
      // Implementation here
    };
    fetchCart();
  }, []);

  const handleDeliverySubmit = async () => {
    if (!deliveryOption) {
      alert('Please select a delivery option');
      return;
    }

    // Validate fields based on delivery option
    if (deliveryOption === 'Nairobi Delivery') {
      if (!region || !area) {
        alert('Please fill in all delivery details');
        return;
      }
    } else if (deliveryOption === 'Rest of Kenya Delivery') {
      if (!courierService) {
        alert('Please select a courier service');
        return;
      }
    } else if (deliveryOption === 'Pick-up Point Delivery') {
      if (!pickupPoint) {
        alert('Please select a pickup point');
        return;
      }
    }

    setCurrentStep('payment');
  };

  const handleOrderConfirmation = async () => {
    if (!mpesaCode) {
      alert('Please enter your Mpesa code');
      return;
    }

    setIsLoading(true);
    setCurrentStep('processing');

    try {
      // Create order in database
      const orderData = {
        status: 'pending',
        total_amount: subtotal + deliveryCost,
        mpesa_code: mpesaCode,
        delivery_option: deliveryOption,
        region,
        area,
        courier_service: courierService,
        pickup_point: pickupPoint,
        delivery_cost: deliveryCost
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white p-4 flex items-center border-b">
        <button onClick={() => router.back()} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold mx-auto">CHECKOUT</h1>
      </div>

      {/* Order Summary Step */}
      {currentStep === 'summary' && (
        <div className="p-4">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">Ksh. {item.price}</p>
                  <p className="text-sm">Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span>Total Price:</span>
              <span>Ksh. {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Cost:</span>
              <span>Ksh. {deliveryCost}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Cost:</span>
              <span>Ksh. {subtotal + deliveryCost}</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('delivery')}
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-6"
          >
            Continue
          </button>
        </div>
      )}

      {/* Delivery Details Step */}
      {currentStep === 'delivery' && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
          
          <div className="space-y-4">
            <select
              value={deliveryOption}
              onChange={(e) => setDeliveryOption(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Delivery Option</option>
              <option value="Nairobi Delivery">Nairobi Delivery</option>
              <option value="Rest of Kenya Delivery">Rest of Kenya Delivery</option>
              <option value="Pick-up Point Delivery">Pick-up Point Delivery</option>
            </select>

            {deliveryOption === 'Nairobi Delivery' && (
              <>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Region</option>
                  <option value="Nairobi">Nairobi</option>
                </select>

                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Area</option>
                  <option value="Ruaka">Ruaka</option>
                  {/* Add more areas */}
                </select>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">
                    Delivery to this address happens with the help of a rider. Your contact will be given
                    to the rider for specific details of the drop-off point of your product. We request that
                    you stay on until you receive your product
                  </p>
                </div>
              </>
            )}

            {deliveryOption === 'Rest of Kenya Delivery' && (
              <>
                <select
                  value={courierService}
                  onChange={(e) => setCourierService(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Courier Service</option>
                  <option value="Ena Coach">Ena Coach</option>
                </select>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">
                    Ena Coach delivers to different parts of the country. The price of delivery might change
                    depending on weight. The cost indicated is the base cost for any delivery.
                  </p>
                </div>
              </>
            )}

            {deliveryOption === 'Pick-up Point Delivery' && (
              <>
                <select
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Pickup Point</option>
                  <option value="Pickup Mtaani">Pickup Mtaani</option>
                </select>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">
                    Pickup mtaani is located at Room B5 Star Mall along Tom Mboya Street. Operating
                    hours is 8am to 6pm, They also do doorstep delivery. Please visit their website
                    www.pickupmtaani.com for more info.
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleDeliverySubmit}
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-6"
          >
            Proceed
          </button>
        </div>
      )}

      {/* Payment Step */}
      {currentStep === 'payment' && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">PAYMENT METHOD</h2>

          <div className="mb-6">
            <div className="mb-4">
              <Image src="/images/mpesa.png" alt="Mpesa" width={64} height={64} className="mx-auto" />
            </div>

            <ol className="text-sm space-y-2 text-purple-700">
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

          <div className="bg-pink-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-700 text-center mb-4">
              Confirm Your Order
            </h3>
            <input
              type="text"
              className="w-full p-4 border border-purple-300 rounded-lg mb-4"
              placeholder="Enter Mpesa code"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
            />
            <button
              onClick={handleOrderConfirmation}
              className="w-full bg-purple-600 text-white py-4 rounded-lg"
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}

      {/* Processing Step */}
      {currentStep === 'processing' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="mt-4 text-purple-700">Please be patient as we process your order.</p>
          <p className="text-purple-700">This will be confirmed shortly.</p>
        </div>
      )}

      {/* Success Step */}
      {currentStep === 'success' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-green-500 mb-6">
            Your order was successful.
          </h2>
          <button
            onClick={() => router.push('/orders')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Check Orders
          </button>
        </div>
      )}
    </div>
  );
}