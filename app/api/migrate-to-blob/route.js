import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'jobs.json')
const BLOB_KEY = 'job-scorecard-data.json'

export async function POST() {
  try {
    // Check if we have the blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ 
        error: 'Blob storage not configured - missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 })
    }

    // Check if we have local data to migrate
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ 
        error: 'No local data file found to migrate' 
      }, { status: 404 })
    }

    // Read the local data
    const localData = fs.readFileSync(DATA_FILE, 'utf8')
    const jobs = JSON.parse(localData)

    console.log(`🔄 Migrating ${jobs.length} jobs to Vercel Blob...`)

    // Upload to Vercel Blob
    const blob = await put(BLOB_KEY, localData, {
      access: 'public',
      contentType: 'application/json',
    })

    console.log(`✅ Successfully migrated ${jobs.length} jobs to Vercel Blob`)
    console.log(`📍 Blob URL: ${blob.url}`)

    return NextResponse.json({ 
      success: true, 
      jobCount: jobs.length,
      blobUrl: blob.url,
      message: 'Data successfully migrated to Vercel Blob storage'
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({ 
      error: 'Migration failed: ' + error.message 
    }, { status: 500 })
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    const hasLocalData = fs.existsSync(DATA_FILE)
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
    
    let localJobCount = 0
    if (hasLocalData) {
      const localData = fs.readFileSync(DATA_FILE, 'utf8')
      const jobs = JSON.parse(localData)
      localJobCount = jobs.length
    }

    return NextResponse.json({
      hasLocalData,
      hasBlobToken,
      localJobCount,
      ready: hasLocalData && hasBlobToken
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check migration status: ' + error.message 
    }, { status: 500 })
  }
} 