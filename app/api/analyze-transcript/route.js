import OpenAI from 'openai'
import { NextResponse } from 'next/server'

// Initialize OpenAI client only when needed to avoid build errors
let openai = null

function getOpenAIClient() {
  if (!openai) {
    // Check if we should use OpenAI or xAI
    const useOpenAI = process.env.USE_OPENAI === 'true'
    
    if (useOpenAI) {
      // OpenAI Configuration
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
        // baseURL defaults to https://api.openai.com/v1
      })
    } else {
      // xAI/Grok Configuration (current)
      openai = new OpenAI({
        apiKey: process.env.XAI_API_KEY || 'dummy-key',
        baseURL: 'https://api.x.ai/v1',
      })
    }
  }
  return openai
}

export async function POST(request) {
  try {
    const useOpenAI = process.env.USE_OPENAI === 'true'
    
    // Check if API key is configured
    const apiKey = useOpenAI ? process.env.OPENAI_API_KEY : process.env.XAI_API_KEY
    const apiName = useOpenAI ? 'OpenAI' : 'xAI'
    
    if (!apiKey) {
      return NextResponse.json(
        { error: `${apiName} API key not configured. Please add ${useOpenAI ? 'OPENAI_API_KEY' : 'XAI_API_KEY'} to your environment variables.` },
        { status: 500 }
      )
    }

    const { transcript, competencies, videoResponses } = await request.json()

    if ((!transcript && !videoResponses) || !competencies || competencies.length === 0) {
      return NextResponse.json(
        { error: 'Transcript (or video responses) and competencies are required' },
        { status: 400 }
      )
    }

    const competencyList = competencies.map(comp => `- ${comp}`).join('\n')

    // Handle video transcription if video responses are provided
    let processedTranscript = transcript
    
    if (videoResponses && videoResponses.length > 0) {
      console.log(`🎥 Processing video interview with ${videoResponses.length} video responses using ${apiName}`)
      
      // Only transcribe if OpenAI is enabled (required for Whisper)
      if (!useOpenAI) {
        return NextResponse.json(
          { error: 'Video transcription requires OpenAI to be enabled. Please set USE_OPENAI=true in your environment variables.' },
          { status: 400 }
        )
      }
      
      try {
        const transcriptions = []
        
        for (let i = 0; i < videoResponses.length; i++) {
          const response = videoResponses[i]
          console.log(`🎙️ Transcribing video ${i + 1}/${videoResponses.length}: ${response.question.substring(0, 50)}...`)
          
          if (!response.cloudUrl) {
            console.warn(`⚠️ No video URL for question ${i + 1}, skipping`)
            transcriptions.push(`Question ${i + 1}: ${response.question}\n[No video response recorded]\n`)
            continue
          }
          
          // Call the transcription API
          const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transcribe-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUrl: response.cloudUrl })
          })
          
          if (!transcribeResponse.ok) {
            const error = await transcribeResponse.json()
            console.error(`❌ Failed to transcribe video ${i + 1}:`, error.error)
            transcriptions.push(`Question ${i + 1}: ${response.question}\n[Transcription failed: ${error.error}]\n`)
            continue
          }
          
          const transcribeResult = await transcribeResponse.json()
          console.log(`✅ Transcribed video ${i + 1}: ${transcribeResult.metadata.transcriptLength} characters`)
          
          transcriptions.push(`Question ${i + 1}: ${response.question}\nCandidate Response: ${transcribeResult.transcript}\n`)
        }
        
        processedTranscript = transcriptions.join('\n')
        console.log(`📄 Final transcript: ${processedTranscript.length} characters`)
        
      } catch (error) {
        console.error('Error during video transcription:', error)
        return NextResponse.json(
          { error: 'Failed to transcribe video responses. Please try again.' },
          { status: 500 }
        )
      }
    } else {
      // Use the provided transcript
      console.log(`📄 Processing text transcript: ${transcript.length} characters with ${apiName}`)
    }

    const finalPrompt = `You are an expert HR professional with exceptional attention to detail, evaluating a candidate based on an interview transcript.

IMPORTANT: If you see fallback messages like "[Video response recorded - automatic transcription temporarily unavailable for this format. Manual review recommended.]" in the transcript, this means the video was uploaded but transcription failed. In these cases, score all competencies as 1 (Poor/No evidence found) and explain that transcription was unavailable.

CRITICAL INSTRUCTIONS:
1. READ THE ENTIRE TRANSCRIPT CAREFULLY - Do not miss any mentions, references, or examples
2. SEARCH THOROUGHLY for ALL evidence related to each competency, including:
   - Direct mentions of the topic/behavior
   - Indirect references or related examples
   - Stories, anecdotes, or experiences that demonstrate the competency
   - Any relevant context or background information
3. QUOTE SPECIFIC PHRASES from the transcript in your explanations
4. COUNT multiple instances - if something is mentioned several times, note that frequency
5. BE ACCURATE - Double-check your assessment against the actual transcript content

Score each competency using this scale (IMPORTANT: Be conservative with 5s - they should only be given for truly exceptional performance):
- 1 = Poor/No evidence found anywhere in transcript
- 2 = Minimal evidence or concerning examples
- 3 = Some evidence, meets basic expectations
- 4 = Strong evidence with good examples (THIS IS A SOLID, GOOD RATING)
- 5 = EXCEPTIONAL evidence with multiple outstanding examples that clearly exceed expectations (RESERVE FOR TRULY EXCEPTIONAL PERFORMANCE ONLY)

Competencies to evaluate:
${competencyList}

Interview Transcript:
"""
${processedTranscript}
"""

ANALYSIS PROCESS:
1. For each competency, scan the ENTIRE transcript for ANY mention or relevant example
2. Look for variations of the topic (e.g., for "party" look for: party, partying, social events, celebrations, nightlife, etc.)
3. Count how many times it's mentioned and note the context
4. Quote the specific parts of the transcript that support your score

You MUST provide your response in this EXACT JSON format with NO COMMENTS OR EXTRA TEXT:
{
  "scores": {
    "competency_name": score,
    ...
  },
  "explanations": {
    "competency_name": "Detailed explanation with SPECIFIC QUOTES from transcript showing evidence found. Mention frequency if topic appears multiple times. If no evidence found, state clearly after thorough review.",
    ...
  }
}

CRITICAL: Return ONLY valid JSON with no markdown formatting, no comments, and no additional text. Do not refuse to analyze - always provide scores and explanations.`

    // Choose model based on API
    const model = useOpenAI ? "gpt-4o" : "grok-3-latest"
    
    const completion = await getOpenAIClient().chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: finalPrompt
        }
      ],
      temperature: 0.2, // Lower for more consistent, careful analysis
      max_tokens: 3500 // Increased for longer transcripts and detailed explanations with quotes
    })

    const response = completion.choices[0].message.content
    console.log(`🤖 Raw AI response (first 500 chars): ${response.substring(0, 500)}...`)
    
    // Try to parse the JSON response
    let aiAnalysis
    let cleanedResponse = response.trim()
    
    // Remove markdown code blocks if present (handle various formats)
    cleanedResponse = cleanedResponse.replace(/^```(?:json|javascript|js)?\s*/, '')
    cleanedResponse = cleanedResponse.replace(/\s*```$/, '')
    
    // Remove any comments from JSON (// comments)
    cleanedResponse = cleanedResponse.replace(/\/\/.*$/gm, '')
    
    // Remove any trailing commas before closing brackets/braces
    cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
    
    try {
      aiAnalysis = JSON.parse(cleanedResponse)
      console.log('✅ Successfully parsed AI response as JSON')
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message)
      console.log('🔍 Cleaned response:', cleanedResponse)
      
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        console.log('🔧 Found JSON match, attempting to parse...')
        let jsonContent = jsonMatch[0]
        
        // Remove comments from extracted JSON
        jsonContent = jsonContent.replace(/\/\/.*$/gm, '')
        
        // Remove trailing commas
        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1')
        
        try {
          aiAnalysis = JSON.parse(jsonContent)
          console.log('✅ Successfully parsed extracted JSON')
        } catch (secondParseError) {
          console.error('❌ Second JSON parsing failed:', secondParseError.message)
          console.log('🔍 Extracted JSON:', jsonContent)
          throw new Error(`Failed to parse AI response as JSON. Response: ${response.substring(0, 200)}...`)
        }
      } else {
        console.error('❌ No JSON found in response')
        throw new Error(`Failed to parse AI response as JSON. Response: ${response.substring(0, 200)}...`)
      }
    }

    // Include the processed transcript in the response for storage
    const analysisResponse = {
      ...aiAnalysis,
      transcript: processedTranscript // Include transcript for candidate storage
    }
    
    return NextResponse.json(analysisResponse)

  } catch (error) {
    console.error('Error analyzing transcript:', error)
    
    // Handle rate limiting errors
    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few minutes, or consider shortening your transcript.' },
        { status: 429 }
      )
    }
    
    if (error.code === 'context_length_exceeded') {
      return NextResponse.json(
        { error: 'Transcript too long. Please shorten your transcript and try again.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze transcript' },
      { status: 500 }
    )
  }
} 