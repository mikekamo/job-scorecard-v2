import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { jobTitle, jobDescription, company } = await request.json()

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      )
    }

    console.log(`🧠 Generating competencies for: ${jobTitle} at ${company?.name || 'company'}`)

    const prompt = `Based on the following job information, create 5-7 key competencies that would be essential for evaluating candidates for this role.

Job Title: "${jobTitle}"
${company?.name ? `Company: ${company.name}` : ''}
${company?.website ? `Company website: ${company.website}` : ''}
${company?.description ? `Company description: ${company.description}` : ''}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

IMPORTANT: These competencies will be used to score candidates on a scale of 1-5 during interviews, where:
- 1 = Poor/Unacceptable
- 2 = Below Average
- 3 = Average/Meets Expectations
- 4 = Above Average/Exceeds Expectations
- 5 = Outstanding/Exceptional

For each competency, provide:
1. A clear, concise name (2-4 words)
2. A brief description explaining what this competency measures and how it can be evaluated

Generate competencies that are:
- Specific to this role and industry
- Clearly measurable and observable during interviews
- Can be scored on a 1-5 scale with distinct performance levels
- Mix of technical skills, soft skills, and role-specific abilities
- Professional and relevant for hiring decisions
- Avoid vague concepts that are difficult to score objectively

Return ONLY a JSON array in this exact format:
[
  {
    "name": "Technical Expertise",
    "description": "Proficiency in required technical skills and tools"
  },
  {
    "name": "Communication Skills", 
    "description": "Ability to communicate clearly with team members and stakeholders"
  }
]

Do not include any other text, explanations, or formatting - just the JSON array.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR specialist who creates precise competency frameworks for hiring. You always respond with valid JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })

    let competenciesText = response.choices[0].message.content.trim()
    
    // Clean up any markdown formatting
    competenciesText = competenciesText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    console.log(`📋 Raw AI response: ${competenciesText}`)
    
    try {
      const competenciesArray = JSON.parse(competenciesText)
      
      // Add unique IDs to each competency
      const competencies = competenciesArray.map((comp, index) => ({
        id: Date.now().toString() + '_' + index,
        name: comp.name,
        description: comp.description,
        weight: 1
      }))
      
      console.log(`✅ Generated ${competencies.length} competencies`)
      
      return NextResponse.json({ competencies })
      
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError)
      console.error('Raw response:', competenciesText)
      
      // Fallback to default competencies if AI response can't be parsed
      const fallbackCompetencies = [
        { id: Date.now().toString() + '_1', name: 'Technical Skills', description: 'Proficiency in required technical skills and tools', weight: 1 },
        { id: Date.now().toString() + '_2', name: 'Communication', description: 'Verbal and written communication abilities', weight: 1 },
        { id: Date.now().toString() + '_3', name: 'Problem Solving', description: 'Ability to analyze and solve complex problems', weight: 1 },
        { id: Date.now().toString() + '_4', name: 'Team Collaboration', description: 'Works effectively with team members', weight: 1 },
        { id: Date.now().toString() + '_5', name: 'Adaptability', description: 'Ability to adapt to changing requirements and environments', weight: 1 }
      ]
      
      return NextResponse.json({ competencies: fallbackCompetencies })
    }

  } catch (error) {
    console.error('Error generating competencies:', error)
    return NextResponse.json(
      { error: 'Failed to generate competencies' },
      { status: 500 }
    )
  }
} 