#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Read local data
const DATA_FILE = path.join(__dirname, 'data', 'jobs.json')

function createInterviewData() {
  console.log('🔄 Creating interview-only data...')
  
  let jobs = []
  
  // Check if local data file exists
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      jobs = JSON.parse(data)
      console.log(`📂 Found ${jobs.length} jobs in local storage`)
    } catch (error) {
      console.error('❌ Error reading local data file:', error)
      return
    }
  } else {
    console.log('⚠️ No local data file found.')
    return
  }
  
  // Extract only the essential data needed for interview links
  const interviewData = jobs.map(job => {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      companyId: job.companyId,
      department: job.department,
      isDraft: job.isDraft,
      interviewQuestions: job.interviewQuestions || [],
      competencies: job.competencies || [],
      candidates: job.candidates ? job.candidates.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        notes: candidate.notes,
        dateAdded: candidate.dateAdded,
        // Keep just essential fields, no large data
        interviews: candidate.interviews || []
      })) : []
    }
  })
  
  console.log(`📦 Created interview data for ${interviewData.length} jobs`)
  
  // Save to a separate file
  const interviewDataFile = path.join(__dirname, 'interview-data.json')
  fs.writeFileSync(interviewDataFile, JSON.stringify(interviewData, null, 2))
  
  console.log(`✅ Interview data saved to ${interviewDataFile}`)
  console.log(`📊 File size: ${(fs.statSync(interviewDataFile).size / 1024).toFixed(2)} KB`)
  
  // Also create a compact version for deployment
  const compactData = JSON.stringify(interviewData)
  const compactFile = path.join(__dirname, 'interview-data-compact.json')
  fs.writeFileSync(compactFile, compactData)
  
  console.log(`✅ Compact interview data saved to ${compactFile}`)
  console.log(`📊 Compact file size: ${(fs.statSync(compactFile).size / 1024).toFixed(2)} KB`)
  
  // Show instructions
  console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS:')
  console.log('1. Copy the contents of interview-data-compact.json')
  console.log('2. Go to your Vercel dashboard')
  console.log('3. Navigate to your project settings')
  console.log('4. Add a new environment variable:')
  console.log('   - Name: INTERVIEW_DATA')
  console.log('   - Value: [paste the compact JSON content]')
  console.log('5. Redeploy your project')
  
  return interviewData
}

// Run the script
createInterviewData() 