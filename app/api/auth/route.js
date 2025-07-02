import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password } = await request.json()
    
    // Get the password from environment variable, with a fallback
    const correctPassword = process.env.APP_PASSWORD || 'scorecard123'
    
    if (password === correctPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 