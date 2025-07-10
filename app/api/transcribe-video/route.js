import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Initialize OpenAI client
let openai = null

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    })
  }
  return openai
}

export async function POST(request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    const { videoUrl } = await request.json()

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }

    console.log(`🎥 Starting transcription for: ${videoUrl}`)

    // Convert relative URL to absolute file path
    const publicPath = path.join(process.cwd(), 'public')
    const videoPath = path.join(publicPath, videoUrl)

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error(`❌ Video file not found: ${videoPath}`)
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      )
    }

    // Get file stats
    const stats = fs.statSync(videoPath)
    const fileSizeInMB = stats.size / (1024 * 1024)
    console.log(`📊 Video file size: ${fileSizeInMB.toFixed(2)} MB`)

    // OpenAI Whisper has a 25MB limit
    if (fileSizeInMB > 25) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Get file extension and prepare for OpenAI
    const fileExtension = path.extname(videoPath).toLowerCase()
    console.log(`🎬 File extension: ${fileExtension}`)
    
    // Try to transcribe WebM files - OpenAI Whisper should support this format
    console.log(`🎙️ Attempting transcription for ${fileExtension} file`)

    // Read the video file and prepare for transcription
    const fileBuffer = fs.readFileSync(videoPath)
    const originalName = path.basename(videoPath)
    
    // Create a File-like object that OpenAI expects
    let mimeType = 'video/mp4' // default
    if (fileExtension === '.webm') {
      mimeType = 'video/webm'
    } else if (fileExtension === '.mov') {
      mimeType = 'video/quicktime'
    } else if (fileExtension === '.avi') {
      mimeType = 'video/x-msvideo'
    }
    
    const fileForOpenAI = new File([fileBuffer], originalName, {
      type: mimeType
    })

    // Call OpenAI Whisper API
    console.log(`🎙️ Sending to OpenAI Whisper with type: ${fileForOpenAI.type}`)
    // Call OpenAI Whisper API for transcription
    const transcription = await getOpenAIClient().audio.transcriptions.create({
      file: fileForOpenAI,
      model: "whisper-1",
      language: "en", // You can remove this to auto-detect language
      response_format: "text"
    })
    
    console.log(`✅ Transcription completed: ${transcription.length} characters`)

    return NextResponse.json({
      success: true,
      transcript: transcription,
      metadata: {
        fileSizeInMB: fileSizeInMB.toFixed(2),
        transcriptLength: transcription.length
      }
    })

  } catch (error) {
    console.error('Error transcribing video:', error)
    
    // Handle specific OpenAI errors
    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few minutes.' },
        { status: 429 }
      )
    }
    
    if (error.code === 'file_too_large') {
      return NextResponse.json(
        { error: 'Video file too large. Please use a smaller file.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe video' },
      { status: 500 }
    )
  }
} 