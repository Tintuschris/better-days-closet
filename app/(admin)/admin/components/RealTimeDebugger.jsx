// components/RealtimeDebugger.jsx
"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function RealTimeDebugger() {
    const [testResults, setTestResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [checkoutRequestId, setCheckoutRequestId] = useState('');

    // Function to format phone number
    const formatPhoneNumber = (phone) => {
        let cleaned = phone.replace(/[^\d+]/g, '');
        cleaned = cleaned.replace('+', '');
        
        if (cleaned.startsWith('254')) {
            return cleaned;
        }
        if (cleaned.startsWith('0')) {
            return `254${cleaned.slice(1)}`;
        }
        if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
            return `254${cleaned}`;
        }
        return cleaned;
    };

    const runTests = async () => {
        setIsLoading(true);
        setTestResults([]); // Clear previous results
        try {
            // 1. Test Database Connection
            const dbTest = await testDatabaseConnection();
            setTestResults([dbTest]);
            
            // 2. Test STK Push
            const stkTest = await testSTKPush();
            setTestResults(prev => [...prev, stkTest]);
            
            // If STK Push successful, store CheckoutRequestID and start subscription
            if (stkTest.status === 'success' && stkTest.data) {
                const requestId = stkTest.data.CheckoutRequestID;
                setCheckoutRequestId(requestId);
                                  // Subscribe to changes for this specific CheckoutRequestID
                                  const channel = supabase
                                      .channel(`order-${requestId}`)
                                      .on(
                                          'postgres_changes',
                                          {
                                              event: 'UPDATE',
                                              schema: 'public',
                                              table: 'orders',
                                              filter: `checkout_request_id=eq.${requestId}`
                                          },
                                          (payload) => {
                                              console.log('Received update for requestId:', requestId);
                                              console.log('Payload:', payload);
                                              if (payload.new.status === 'CONFIRMED') {
                                                  setTestResults(prev => [...prev, {
                                                      name: 'Payment Status',
                                                      status: 'success',
                                                      data: {
                                                          message: 'Payment confirmed successfully',
                                                          mpesaCode: payload.new.mpesa_code,
                                                          amount: payload.new.confirmed_amount
                                                      }
                                                  }]);
                                              }
                                          }
                                      )
                                      .subscribe((status) => {
                                          console.log(`Subscription status for ${requestId}:`, status);
                                      });
                // Set a timeout to unsubscribe and show timeout message if no confirmation received
                setTimeout(() => {
                    channel.unsubscribe();
                    setTestResults(prev => {
                        // Only add timeout message if we haven't received a confirmation
                        if (!prev.some(result => result.name === 'Payment Status')) {
                            return [...prev, {
                                name: 'Payment Status',
                                status: 'failed',
                                error: 'Timeout waiting for payment confirmation'
                            }];
                        }
                        return prev;
                    });
                }, 60000); // 60 seconds timeout
            }
        } catch (err) {
            console.error('Test error:', err);
            setTestResults(prev => [...prev, {
                name: 'Error',
                status: 'failed',
                error: err.message
            }]);
        }
        setIsLoading(false);
    };

    const testDatabaseConnection = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    status: 'TEST',
                    total_amount: 1,
                    checkout_request_id: 'TEST' + Date.now(),
                    mpesa_code: null,
                    user_id: '90a3bed7-2b2c-4113-96f8-d352d4cf0d15',
                    delivery_option: 'test',
                    region: 'test'
                }])
                .select();

            return {
                name: 'Database Connection',
                status: error ? 'failed' : 'success',
                error: error?.message,
                data
            };
        } catch (err) {
            return {
                name: 'Database Connection',
                status: 'failed',
                error: err.message
            };
        }
    };

    const testSTKPush = async () => {
        if (!testPhone) {
            return {
                name: 'STK Push',
                status: 'failed',
                error: 'Phone number is required'
            };
        }

        try {
            const formattedPhone = formatPhoneNumber(testPhone);
            const response = await fetch('/api/mpesa/stkpush', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formattedPhone,
                    amount: 1
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                return {
                    name: 'STK Push',
                    status: 'failed',
                    error: data.error
                };
            }

            // Add console.log to debug
            console.log('STK Push Response:', data);

            // Simulate successful callback after 5 seconds for testing
            if (data.ResponseCode === '0') {
                const checkoutRequestId = data.CheckoutRequestID;
                
                // Add console.log to debug
                console.log('Setting up simulation for CheckoutRequestID:', checkoutRequestId);

                // First create a record with this checkout_request_id if it doesn't exist
                const { error: createError } = await supabase
                    .from('orders')
                    .upsert({ 
                        checkout_request_id: checkoutRequestId,
                        status: 'PENDING',
                        total_amount: 1,
                        user_id: '90a3bed7-2b2c-4113-96f8-d352d4cf0d15',
                        delivery_option: 'test',
                        region: 'test'
                    });

                if (createError) {
                    console.error('Error creating order record:', createError);
                }

                // Then simulate the callback
                setTimeout(async () => {
                    // Add console.log to debug
                    console.log('Simulating callback for CheckoutRequestID:', checkoutRequestId);
                    
                    const { error } = await supabase
                        .from('orders')
                        .update({ 
                            status: 'CONFIRMED',
                            mpesa_code: 'TEST' + Date.now(),
                            transaction_date: new Date().toISOString(),
                            confirmed_amount: 1,
                            updated_at: new Date().toISOString()
                        })
                        .eq('checkout_request_id', checkoutRequestId);

                    if (error) {
                        console.error('Error simulating callback:', error);
                    } else {
                        console.log('Successfully simulated callback');
                    }
                }, 5000);
            }
            return {
                name: 'STK Push',
                status: data.ResponseCode === '0' ? 'success' : 'failed',
                error: data.ResponseDescription,
                data
            };
        } catch (err) {
            return {
                name: 'STK Push',
                status: 'failed',
                error: err.message
            };
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-primarycolor">System Tests</h2>
            
            <div className="mb-4">
                <input
                    type="tel"
                    className="w-full max-w-md p-2 border border-gray-300 rounded"
                    placeholder="Enter test phone number (e.g., 0712345678)"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                    Format: 0712345678 or 254712345678 or +254712345678
                </p>
            </div>

            <button
                onClick={runTests}
                disabled={isLoading}
                className={`px-4 py-2 rounded ${
                    isLoading 
                    ? 'bg-gray-400' 
                    : 'bg-primarycolor hover:bg-primarycolor/90'
                } text-white`}
            >
                {isLoading ? 'Testing...' : 'Run Tests'}
            </button>

            <div className="mt-4 space-y-4">
                {testResults.map((result, index) => (
                    <div 
                        key={index}
                        className={`p-4 rounded ${
                            result.status === 'success' 
                            ? 'bg-green-100 border border-green-200' 
                            : 'bg-red-100 border border-red-200'
                        }`}
                    >
                        <h3 className="font-semibold">{result.name}</h3>
                        <p className="text-sm">
                            Status: <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                                {result.status}
                            </span>
                        </p>
                        {result.error && (
                            <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>
                        )}
                        {result.data && (
                            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}