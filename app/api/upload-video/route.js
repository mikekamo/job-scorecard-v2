import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video')
    const jobId = formData.get('jobId')
    const candidateId = formData.get('candidateId')
    const questionIndex = formData.get('questionIndex')

    if (!file || !jobId || !candidateId || questionIndex === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if we're in development (localhost)
    const isLocalhost = process.env.NODE_ENV === 'development' || 
                       !process.env.VERCEL || 
                       !process.env.BLOB_READ_WRITE_TOKEN

    if (isLocalhost) {
      // Local development - save to file system
      console.log('🏠 Using local file storage for development')
      
      try {
        // Create directory structure
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'interviews', jobId, candidateId)
        await mkdir(uploadsDir, { recursive: true })

        // Create filename with appropriate extension
        // Log the file type for debugging
        console.log(`📹 Video file type: ${file.type}`)
        
        // More accurate file extension detection - prefer MP4 for better OpenAI compatibility
        let fileExtension = 'mp4' // Default to mp4 for better OpenAI Whisper compatibility
        if (file.type) {
          if (file.type.includes('mp4') || file.type.includes('h264') || file.type.includes('avc1')) {
            fileExtension = 'mp4'
          } else if (file.type.includes('webm')) {
            fileExtension = 'webm'
          }
        }
        
        const filename = `question-${questionIndex}-${Date.now()}.${fileExtension}`
        console.log(`💾 Saving as: ${filename} (detected type: ${file.type})`)
        const filePath = path.join(uploadsDir, filename)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Return local URL that can be accessed via /uploads/...
        const localUrl = `/uploads/interviews/${jobId}/${candidateId}/${filename}`
        
        console.log('✅ Video saved locally:', localUrl)
        
        return NextResponse.json({ 
          success: true, 
          url: localUrl,
          filename,
          isLocal: true
        })
        
      } catch (error) {
        console.error('❌ Local file save failed:', error)
        
        // Fallback to base64 if file saving fails
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')
        const mimeType = file.type || 'video/webm'
        const dataUrl = `data:${mimeType};base64,${base64}`
        
        console.log('📦 Falling back to base64 data URL')
        
        return NextResponse.json({ 
          success: true, 
          url: dataUrl,
          filename: `fallback-${questionIndex}-${Date.now()}`,
          isLocal: true,
          isFallback: true
        })
      }
      
    } else {
      // Production - use Vercel Blob
      console.log('☁️ Using Vercel Blob for production')
      console.log(`📹 Video file type: ${file.type}`)
      
      // More accurate file extension detection - prefer MP4 for better OpenAI compatibility
      let fileExtension = 'mp4' // Default to mp4 for better OpenAI Whisper compatibility
      if (file.type) {
        if (file.type.includes('mp4') || file.type.includes('h264') || file.type.includes('avc1')) {
          fileExtension = 'mp4'
        } else if (file.type.includes('webm')) {
          fileExtension = 'webm'
        }
      }
      
      const filename = `interviews/${jobId}/${candidateId}/question-${questionIndex}-${Date.now()}.${fileExtension}`
      console.log(`☁️ Saving to Vercel Blob as: ${filename}`)

      const blob = await put(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-video',
      })

      return NextResponse.json({ 
        success: true, 
        url: blob.url,
        filename,
        isLocal: false
      })
    }

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload video',
      details: error.message 
    }, { status: 500 })
  }
} 