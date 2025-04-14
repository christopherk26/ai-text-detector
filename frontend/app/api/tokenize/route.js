// Create this file at: frontend/app/api/tokenize/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Tokenize API route received request:', body);
    
    // Forward the request to your Flask backend
    const response = await fetch('http://127.0.0.1:5000/api/tokenize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('Flask tokenize response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flask tokenize error response:', errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Successful response from Flask tokenize:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Tokenize API route error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy tokenization request to backend', message: error.message },
      { status: 500 }
    );
  }
}