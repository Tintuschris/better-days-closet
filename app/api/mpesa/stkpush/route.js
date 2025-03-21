import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';


const generateAccessToken = async () => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    // Change to production URL
    const response = await fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Access token request failed: ${response.status}`);
    }

    const data = await response.json();
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
    const tillNumber = process.env.MPESA_TILL_NUMBER;
    const passkey = process.env.MPESA_PASSKEY;
    
    const password = Buffer.from(
      `${tillNumber}${passkey}${timestamp}`
    ).toString('base64');

    const requestBody = {
      BusinessShortCode: tillNumber,
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