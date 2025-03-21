import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('Test callback endpoint hit at:', new Date().toISOString());
  
  try {
    const body = await req.text();
    console.log('Received data:', body);
    
    return NextResponse.json({ 
      success: true,
      message: 'Test callback received successfully'
    });
  } catch (error) {
    console.error('Error in test callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also handle GET requests for testing in browser
export async function GET() {
  console.log('Test callback GET endpoint hit');
  return NextResponse.json({ 
    success: true,
    message: 'Callback endpoint is accessible via GET'
  });
}
