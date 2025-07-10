import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { jobTitle, company, userPrompt } = await request.json()

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      )
    }

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'User description is required' },
        { status: 400 }
      )
    }

    console.log(`🤖 Expanding job description for: ${jobTitle} at ${company?.name || 'company'} based on user input`)

    const prompt = `Based on the following brief description, write a comprehensive and professional job description for the position: "${jobTitle}"${company?.name ? ` at ${company.name}` : ''}.

${company?.website ? `Company website: ${company.website}` : ''}
${company?.description ? `Company description: ${company.description}` : ''}

User's brief description:
"${userPrompt}"

Create a well-structured job description with clear headers and bullet points in this format:

## About the Role
[Write a compelling overview paragraph that incorporates the user's vision and mentions the company context]

## Key Responsibilities
• [Responsibility 1 based on user description]
• [Responsibility 2 based on user description]
• [Responsibility 3 based on user description]
• [Responsibility 4 based on user description]
• [Additional relevant responsibility]

## Required Qualifications
• [Qualification 1 relevant to the role]
• [Qualification 2 relevant to the role]
• [Qualification 3 relevant to the role]
• [Education/experience requirement]

## What We Offer
• [Benefit/opportunity 1 - try to incorporate company culture if known]
• [Growth opportunity]
• [Company-specific perks if you can infer from company info]

Use markdown formatting with ## for headers and • for bullet points. Keep it professional, engaging, and expand on the user's ideas while maintaining their intent and focus. Make sure to honor the specific requirements mentioned in the user's description. If company information is provided, try to incorporate relevant details about the company culture, industry, or benefits that might be typical for this type of company.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional HR specialist who writes compelling job descriptions that attract top talent.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    let description = response.choices[0].message.content.trim()
    
    // Post-process the description to remove markdown # signs and format headers properly for textarea
    description = description
      // Remove ## markdown headers and make them standout headers for textarea
      .replace(/^## (.+)$/gm, '\n--- $1 ---\n')
      // Keep bullet points as they are (• character works well)
      
    console.log(`✅ Generated job description: ${description.length} characters`)
    
    return NextResponse.json({ description })

  } catch (error) {
    console.error('Error generating job description:', error)
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    )
  }
} 