import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { jobTitle, jobDescription, competencies, company, onePerCompetency } = await request.json()

    if (!jobTitle || !competencies || competencies.length === 0) {
      return NextResponse.json(
        { error: 'Job title and competencies are required' },
        { status: 400 }
      )
    }

    console.log(`🎬 Generating interview questions for: ${jobTitle} at ${company?.name || 'company'}`)

    const competencyList = competencies.map(comp => `- ${comp.name}: ${comp.description}`).join('\n')

    let prompt
    
    if (onePerCompetency) {
      // Generate exactly one question per competency
      prompt = `Based on the following job information, create EXACTLY ${competencies.length} interview questions - ONE question for EACH competency listed below.

Job Title: "${jobTitle}"
${company?.name ? `Company: ${company.name}` : ''}
${company?.website ? `Company website: ${company.website}` : ''}
${company?.description ? `Company description: ${company.description}` : ''}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

COMPETENCIES TO EVALUATE (CREATE ONE QUESTION FOR EACH):
${competencyList}

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${competencies.length} questions - one for each competency
- Questions will be ordered to match the competency order above
- These are VIDEO INTERVIEW questions (candidates will record video responses)
- Questions will be analyzed by AI later to score candidates on a 1-5 scale for each competency
- Each question should directly target the specific competency it's meant to evaluate
- Questions should encourage candidates to provide specific examples and detailed responses
- Avoid yes/no questions - focus on experience-revealing questions
- Questions should be answerable within 2-5 minutes each

QUESTION STRATEGY:
Create questions that directly assess each competency through experience and examples:

1. **EXPERIENCE-BASED QUESTIONS (Primary focus):**
   - "Tell me about your experience with [competency area]..."
   - "Can you walk me through a project where you used [specific skill]?"
   - "Describe your background in [competency] and how you've applied it in previous roles"

2. **BEHAVIORAL/SITUATIONAL QUESTIONS (Secondary focus):**
   - "Tell me about a time when you had to use [competency] to solve a challenging problem..."
   - "How would you approach a situation requiring [competency]..."

For each question, provide:
1. A clear, well-structured question that directly evaluates the specific competency
2. An appropriate time limit in seconds (180-300 seconds for experience questions, 120-240 for scenarios)

Generate questions that:
- Directly target each specific competency
- Reveal the candidate's actual experience level in that competency area
- Allow candidates to showcase their relevant work history
- Include specific examples from previous roles
- Are professional and relevant for video interviews
- Provide rich data for 1-5 scoring on the specific competency

Return ONLY a JSON array in this exact format (maintain the same order as the competencies):
[
  {
    "question": "Tell me about your experience with [first competency]. Can you walk me through a specific project or situation where you applied this skill?",
    "timeLimit": 240
  },
  {
    "question": "Describe a time when you had to use [second competency] to solve a problem. What was your approach and what was the outcome?",
    "timeLimit": 180
  }
]

Do not include any other text, explanations, or formatting - just the JSON array.`
    } else {
      // Original prompt for multiple questions covering all competencies
      prompt = `Based on the following job information, create interview questions that will comprehensively evaluate candidates across ALL specified competencies.

Job Title: "${jobTitle}"
${company?.name ? `Company: ${company.name}` : ''}
${company?.website ? `Company website: ${company.website}` : ''}
${company?.description ? `Company description: ${company.description}` : ''}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

COMPETENCIES TO EVALUATE (MUST ALL BE COVERED):
${competencyList}

CRITICAL REQUIREMENTS:
- These are VIDEO INTERVIEW questions (candidates will record video responses)
- Questions will be analyzed by AI later to score candidates on a 1-5 scale for each competency
- EVERY SINGLE COMPETENCY MUST be addressed by at least one question
- Generate enough questions to ensure complete competency coverage
- Questions should encourage candidates to provide specific examples and detailed responses
- Avoid yes/no questions - focus on experience-revealing questions
- Questions should be answerable within 2-5 minutes each

MANDATORY COMPETENCY COVERAGE:
- EVERY competency must be addressed by at least one question
- Questions can and SHOULD address multiple competencies when they are similar or related
- If two competencies are similar (e.g., "Communication" and "Stakeholder Communication"), one well-crafted question can cover both
- Generate ${Math.max(3, Math.min(competencies.length, 7))} questions - fewer questions are better if they efficiently cover all competencies
- Do not leave any competency unaddressed
- Focus on efficiency: combine related competencies into single questions when possible

QUESTION STRATEGY:
Create a mix of question types that reveal both experience depth and capability:

1. **EXPERIENCE-BASED QUESTIONS (60% of questions):**
   - "What experience do you have with [competency area]?"
   - "Can you walk me through your background in [specific skill]?"
   - "Tell me about your experience with [competency] in previous roles"
   - These should reveal the candidate's actual experience level and background

2. **BEHAVIORAL/SITUATIONAL QUESTIONS (40% of questions):**
   - "Tell me about a time when..." (specific challenging scenarios)
   - "How would you handle..." (problem-solving scenarios)
   - These should test their capability and approach

COMPETENCY MAPPING REQUIREMENT:
- Ensure every competency from the list is addressed by at least one question
- ACTIVELY COMBINE similar competencies into single questions:
  * "Email Marketing" + "Digital Marketing" = One question about digital marketing experience including email campaigns
  * "Communication Skills" + "Stakeholder Communication" = One question about communicating with various stakeholders
  * "Project Management" + "Campaign Management" = One question about managing marketing projects/campaigns
  * "React Development" + "Frontend Development" = One question about frontend development including React
- Questions should be broad enough to evaluate multiple related competencies efficiently
- Prioritize fewer, more comprehensive questions over many narrow ones
- Focus on learning about their background and capability across all competency areas with minimal interview fatigue

For each question, provide:
1. A clear, well-structured question that explores experience and capability
2. An appropriate time limit in seconds (180-300 seconds for experience questions, 120-240 for scenarios)

Generate questions that:
- Reveal the candidate's actual experience level and background in each competency area
- Allow candidates to showcase their relevant work history
- Include specific examples from previous roles
- Mix experience exploration with challenging scenarios
- Are professional and relevant for video interviews
- Provide rich data for 1-5 scoring across competencies

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Tell me about a time when you had to solve a complex technical problem under pressure. Walk me through your approach and the outcome.",
    "timeLimit": 240
  },
  {
    "question": "Describe a situation where you had to collaborate with a difficult team member. How did you handle it?",
    "timeLimit": 180
  }
]

Do not include any other text, explanations, or formatting - just the JSON array.`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR specialist who creates behavioral interview questions designed for video interviews and competency-based scoring. You MUST ensure every single competency is addressed by at least one question. You always respond with valid JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    let questionsText = response.choices[0].message.content.trim()
    
    // Clean up any markdown formatting
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    console.log(`🎯 Raw AI response: ${questionsText}`)
    
    try {
      const questionsArray = JSON.parse(questionsText)
      
      // Add unique IDs to each question
      const questions = questionsArray.map((q, index) => ({
        id: Date.now().toString() + '_' + index,
        question: q.question,
        timeLimit: q.timeLimit
      }))
      
      // Add standard final question that candidates can choose to skip (except for onePerCompetency)
      if (!onePerCompetency) {
        const finalQuestion = {
          id: Date.now().toString() + '_final',
          question: 'Is there anything else you would like to add that you feel would be relevant to this position?',
          timeLimit: 180,
          isOptional: true
        }
        
        questions.push(finalQuestion)
      }
      
              console.log(`✅ Generated ${questions.length} interview questions${onePerCompetency ? ' (one per competency)' : ' (including optional final question)'}`)
      
      return NextResponse.json({ questions })
      
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError)
      console.error('Raw response:', questionsText)
      
      // Fallback to default questions if AI response can't be parsed
      const fallbackQuestions = [
        { id: Date.now().toString() + '_1', question: 'Tell me about yourself and your professional background relevant to this role.', timeLimit: 180 },
        { id: Date.now().toString() + '_2', question: 'Describe a challenging project you worked on and how you overcame the obstacles.', timeLimit: 240 },
        { id: Date.now().toString() + '_3', question: 'How do you prioritize tasks when facing multiple competing deadlines?', timeLimit: 180 },
        { id: Date.now().toString() + '_4', question: 'Tell me about a time when you had to learn a new skill quickly to complete a project.', timeLimit: 240 },
        { id: Date.now().toString() + '_final', question: 'Is there anything else you would like to add that you feel would be relevant to this position?', timeLimit: 180, isOptional: true }
      ]
      
      return NextResponse.json({ questions: fallbackQuestions })
    }

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
} 