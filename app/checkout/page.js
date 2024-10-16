'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react'; // Import checkmark icon

export default function Checkout() {
  const [mpesaCode, setMpesaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [orderSuccess, setOrderSuccess] = useState(false); // Order success state
  const router = useRouter(); // Use Next.js navigation

  // Simulate order confirmation by the admin
  const simulateOrderConfirmation = () => {
    setTimeout(() => {
      setIsLoading(false); // Stop loading spinner
      setOrderSuccess(true); // Show success message
    }, 5000); // Simulate a 5-second delay for admin confirmation
  };

  const handleConfirmOrder = () => {
    if (mpesaCode) {
      setIsLoading(true); // Start loading spinner
      // Perform necessary API call to confirm the order with Mpesa code
      console.log(`Mpesa Code: ${mpesaCode}`);

      // Simulate admin confirmation (you should replace this with an actual API call)
      simulateOrderConfirmation();
    } else {
      alert('Please enter your Mpesa code.');
    }
  };

  return (
    <div className="checkout-page min-h-screen bg-white p-4 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full mb-6 flex justify-start">
        <button onClick={() => router.back()} className="text-purple-600">
          <ArrowLeft />
        </button>
      </div>

      {/* Checkout Title */}
      <h1 className="text-2xl font-semibold text-purple-700 mb-4">CHECKOUT</h1>

      {/* Payment Method Section */}
      {!isLoading && !orderSuccess && (
        <>
          <div className="payment-method mb-6">
            <h2 className="text-xl font-bold text-purple-700 mb-4">PAYMENT METHOD</h2>

            <div className="mb-4">
              <Image src="/images/mpesa.png" alt="Mpesa" width={64} height={64} className="mx-auto" />
            </div>
            <div className="instructions text-purple-700 text-center">
              <ol className="text-sm">
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
          </div>

          {/* Mpesa Code Input */}
          <div className="bg-pink-100 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-purple-700 text-center mb-4">Confirm Your Order</h3>
            <input
              type="text"
              className="block w-full p-4 border border-purple-300 rounded-lg mb-4"
              placeholder="Enter Mpesa code"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
            />
            <button
              onClick={handleConfirmOrder}
              className="bg-purple-700 text-white w-full py-4 rounded-lg"
            >
              Confirm Order
            </button>
          </div>
        </>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-purple-500 rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-purple-700">Processing your order...</p>
        </div>
      )}

      {/* Success Message after Order Confirmation */}
      {orderSuccess && (
        <div className="flex flex-col items-center">
          <CheckCircle size={64} className="text-green-500 mb-4" /> {/* Checkmark Icon */}
          <h3 className="text-2xl font-semibold text-green-500">Order Placed Successfully</h3>
        </div>
      )}
    </div>
  );
}
