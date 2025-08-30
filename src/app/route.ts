import { NextRequest, NextResponse } from 'next/server';

// Handle POST requests to root that are causing 405 errors
export async function POST(request: NextRequest) {
  // Log the request for debugging
  console.log('Caught POST request to root:', {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  // Return a simple OK response to prevent 405 errors
  return NextResponse.json({ 
    message: 'Request handled',
    timestamp: new Date().toISOString() 
  });
}

// Also handle other methods that might be hitting root
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ message: 'Method handled' });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Method handled' });
}