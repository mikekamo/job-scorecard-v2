import { NextResponse } from 'next/server'

// Simple API route for testing deployment
export async function GET() {
  console.log('API route called - testing deployment')
  
  try {
    // Return a simple response for now to test deployment
    return NextResponse.json({ 
      message: 'API route is working', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: !!process.env.VERCEL
    })
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 })
  }
}

// Simple POST handler
export async function POST(request) {
  console.log('POST request to API route')
  
  try {
    return NextResponse.json({ 
      message: 'POST endpoint working', 
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    console.error('Error in POST route:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 })
  }
} 