import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';


const generateAccessToken = async () => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    console.log('Generating access token with:', {
      keyLength: consumerKey?.length,
      secretLength: consumerSecret?.length,
      keyPrefix: consumerKey?.substring(0, 4),
      secretPrefix: consumerSecret?.substring(0, 4)
    });
    
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    // Log the request details
    console.log('Access token request to:', 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials');
    
    const response = await fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Access token error:', {
        status: response.status,
        body: errorText
      });
      throw new Error(`Access token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Access token generated successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};


export async function POST(req) {
  try {
    const { phoneNumber, amount } = await req.json();
    
    if (!phoneNumber || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const accessToken = await generateAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    const tillNumber = process.env.MPESA_TILL_NUMBER;
    const passkey = process.env.MPESA_PASSKEY;
    
    const password = Buffer.from(
      `${businessShortCode}${passkey}${timestamp}`
    ).toString('base64');

    const requestBody = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: parseInt(amount),
      PartyA: phoneNumber,
      PartyB: tillNumber,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
      AccountReference: 'Better Days Closet',
      TransactionDesc: 'Purchase from Better Days Closet'
    };
// Add this before making the STK push request
console.log('STK Push request body:', {
  BusinessShortCode: requestBody.BusinessShortCode,
  Password: requestBody.Password.substring(0, 10) + '...',  // Don't log the full password
  Timestamp: requestBody.Timestamp,
  Amount: requestBody.Amount,
  PartyA: requestBody.PartyA,
  CallBackURL: requestBody.CallBackURL
});

    const response = await fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Safaricom API Error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to initiate payment' 
      }, { status: response.status });
    }

    const mpesaResponse = await response.json();
    return NextResponse.json(mpesaResponse);
  } catch (error) {
    console.error('STK Push Error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}