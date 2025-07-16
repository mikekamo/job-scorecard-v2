import { NextResponse } from 'next/server'
import { put, head } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'jobs.json')
const BLOB_KEY = 'job-scorecard-data.json'

// Check if we're in development or production
const isLocalhost = process.env.NODE_ENV === 'development' || 
                   !process.env.VERCEL || 
                   !process.env.BLOB_READ_WRITE_TOKEN

// Ensure data directory exists (for development)
function ensureDataDirectory() {
  if (isLocalhost) {
    const dataDir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }
}

// GET - Load jobs from Vercel Blob or file
export async function GET() {
  try {
    if (isLocalhost) {
      // Development - use file storage
      console.log('🏠 Loading jobs from local file storage')
      ensureDataDirectory()
      
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8')
        const jobs = JSON.parse(data)
        return NextResponse.json(jobs)
      } else {
        return NextResponse.json([])
      }
    } else {
      // Production - use Vercel Blob
      console.log('☁️ Loading jobs from Vercel Blob')
      
      try {
        // Check if blob exists
        const blobInfo = await head(BLOB_KEY)
        
        if (blobInfo) {
          // Fetch the blob data
          const response = await fetch(blobInfo.url)
          const jobs = await response.json()
          console.log(`☁️ Loaded ${jobs.length} jobs from Vercel Blob`)
          return NextResponse.json(jobs)
        } else {
          console.log('☁️ No blob found, returning empty array')
          return NextResponse.json([])
        }
      } catch (blobError) {
        console.log('☁️ Blob not found or error, returning empty array:', blobError.message)
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error('Error loading jobs:', error)
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 })
  }
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