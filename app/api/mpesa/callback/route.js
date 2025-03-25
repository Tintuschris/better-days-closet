import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(req) {
  console.log('M-Pesa callback received at:', new Date().toISOString());
  
  try {
    // Get the raw request body
    const rawBody = await req.text();
    console.log('Raw callback body:', rawBody);
    
    // Parse the JSON
    const callbackData = JSON.parse(rawBody);
    console.log('Parsed M-Pesa callback:', callbackData);
    
    const { Body: { stkCallback } } = callbackData;
    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = stkCallback;
    
    console.log('Processing callback for CheckoutRequestID:', CheckoutRequestID);
    
    // Update order status in database
    if (ResultCode === 0 && CallbackMetadata) {
      // Extract payment details
      const items = CallbackMetadata.Item;
      const mpesaCode = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;
      const amount = items.find(item => item.Name === 'Amount')?.Value;
      const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;

      console.log('Payment details:', { mpesaCode, amount, phoneNumber });

      if (!mpesaCode || !amount) {
        throw new Error('Missing required callback data');
      }

      // Update order with payment details
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'CONFIRMED',
          mpesa_code: mpesaCode,
          transaction_date: transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString(),
          confirmed_amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', CheckoutRequestID);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Successfully processed payment:', {
        checkoutRequestId: CheckoutRequestID,
        mpesaCode,
        amount
      });
    } else {
      // Handle failed payment
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'FAILED',
          updated_at: new Date().toISOString(),
          failure_reason: ResultDesc
        })
        .eq('checkout_request_id', CheckoutRequestID);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Payment failed:', {
        checkoutRequestId: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
