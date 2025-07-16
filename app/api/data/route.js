import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

// Force redeploy - API route fix 2025-01-16 - attempt 4 - Full functionality restored

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
  console.log('🏠 Loading jobs from', isLocalhost ? 'local file storage' : 'Vercel Blob storage')
  
  try {
    if (isLocalhost) {
      // Development: Use local file storage
      ensureDataDirectory()
      
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8')
        const jobs = JSON.parse(data)
        console.log(`📂 Loaded ${jobs.length} jobs from local storage`)
        return NextResponse.json(jobs)
      } else {
        console.log('📂 No local data file found, returning empty array')
        return NextResponse.json([])
      }
    } else {
      // Production: Use Vercel Blob storage
      try {
        // List blobs to find our data file
        const { blobs } = await list({
          prefix: BLOB_KEY,
          limit: 1,
          token: process.env.BLOB_READ_WRITE_TOKEN
        })
        
        if (blobs.length > 0) {
          // Found the blob, fetch it using the URL
          const blobUrl = blobs[0].url
          const response = await fetch(blobUrl)
          
          if (response.ok) {
            const jobs = await response.json()
            console.log(`☁️ Loaded ${jobs.length} jobs from Vercel Blob storage`)
            return NextResponse.json(jobs)
          } else {
            console.log('☁️ Failed to fetch blob content')
            return NextResponse.json([])
          }
        } else {
          console.log('☁️ No blob data found, returning empty array')
          return NextResponse.json([])
        }
      } catch (blobError) {
        console.error('❌ Error loading from Vercel Blob:', blobError)
        
        // Fallback to environment variable if Blob fails
        if (process.env.INTERVIEW_DATA) {
          try {
            const envJobs = JSON.parse(process.env.INTERVIEW_DATA)
            console.log(`📦 Loaded ${envJobs.length} jobs from environment variable fallback`)
            return NextResponse.json(envJobs)
          } catch (envError) {
            console.error('❌ Error parsing environment variable data:', envError)
          }
        }
        
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error('❌ Error in GET /api/data:', error)
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 })
  }
}

// POST - Save jobs to Vercel Blob or file
export async function POST(request) {
  console.log('💾 Saving jobs to', isLocalhost ? 'local file storage' : 'Vercel Blob storage')
  
  try {
    const jobs = await request.json()
    
    if (isLocalhost) {
      // Development: Save to local file
      ensureDataDirectory()
      fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2))
      console.log(`📂 Saved ${jobs.length} jobs to local storage`)
      return NextResponse.json({ success: true, count: jobs.length })
    } else {
      // Production: Save to Vercel Blob
      try {
        const blob = await put(BLOB_KEY, JSON.stringify(jobs), {
          access: 'public',
          contentType: 'application/json',
          token: process.env.BLOB_READ_WRITE_TOKEN
        })
        
        console.log(`☁️ Saved ${jobs.length} jobs to Vercel Blob storage`)
        return NextResponse.json({ success: true, count: jobs.length, url: blob.url })
      } catch (blobError) {
        console.error('❌ Error saving to Vercel Blob:', blobError)
        return NextResponse.json({ error: 'Failed to save jobs' }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('❌ Error in POST /api/data:', error)
    return NextResponse.json({ error: 'Failed to save jobs' }, { status: 500 })
  }
} 