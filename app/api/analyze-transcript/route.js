import OpenAI from 'openai'
import { NextResponse } from 'next/server'

// Initialize OpenAI client only when needed to avoid build errors
let openai = null

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY || 'dummy-key',
      baseURL: 'https://api.x.ai/v1',
    })
  }
  return openai
}

export async function POST(request) {
  try {
    // Check if API key is configured
    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: 'xAI API key not configured. Please add XAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    const { transcript, competencies } = await request.json()

    if (!transcript || !competencies || competencies.length === 0) {
      return NextResponse.json(
        { error: 'Transcript and competencies are required' },
        { status: 400 }
      )
    }

    const competencyList = competencies.map(comp => `- ${comp}`).join('\n')

    // Use the full transcript - Grok 3 can handle long contexts
    console.log(`📄 Processing transcript: ${transcript.length} characters`)
    let processedTranscript = transcript

    const finalPrompt = `You are an expert HR professional with exceptional attention to detail, evaluating a candidate based on an interview transcript.

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

Provide your response in this JSON format:
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

Remember: Be thorough, accurate, and quote specific examples from the transcript to support every score.`

    const completion = await getOpenAIClient().chat.completions.create({
      model: "grok-3-latest", // Using Grok 3 latest - superior reasoning and analysis
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
    
    // Try to parse the JSON response
    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(response)
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI response as JSON')
      }
    }

    return NextResponse.json(aiAnalysis)

  } catch (error) {
    console.error('Error analyzing transcript:', error)
    
    // Handle specific xAI/Grok errors
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