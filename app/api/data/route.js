import { NextResponse } from 'next/server'
import { put, head } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

// Force redeploy - API route fix 2025-01-16 - attempt 2

// Temporary test - return simple response to test if route works
export async function GET() {
  return NextResponse.json({ message: 'API route is working', timestamp: new Date().toISOString() })
}

// POST - Save jobs to Vercel Blob or file
export async function POST(request) {
  try {
    const jobs = await request.json()
    
    if (isLocalhost) {
      // Development - use file storage
      console.log('🏠 Saving jobs to local file storage')
      ensureDataDirectory()
      
      // Save to file with pretty formatting
      fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2))
      console.log(`💾 Saved ${jobs.length} jobs to file`)
      
    } else {
      // Production - use Vercel Blob
      console.log('☁️ Saving jobs to Vercel Blob')
      
      // Convert jobs to JSON string
      const jsonData = JSON.stringify(jobs, null, 2)
      
      // Save to Vercel Blob
      const blob = await put(BLOB_KEY, jsonData, {
        access: 'public',
        contentType: 'application/json',
      })
      
      console.log(`☁️ Saved ${jobs.length} jobs to Vercel Blob at ${blob.url}`)
    }
    
    return NextResponse.json({ success: true, count: jobs.length })
  } catch (error) {
    console.error('Error saving jobs:', error)
    return NextResponse.json({ error: 'Failed to save jobs' }, { status: 500 })
  }
} 