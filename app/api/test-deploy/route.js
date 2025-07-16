import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Test deployment route is working!', 
    timestamp: new Date().toISOString() 
  })
} 