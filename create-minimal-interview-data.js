#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Read local data
const DATA_FILE = path.join(__dirname, 'data', 'jobs.json')

function createMinimalInterviewData() {
  console.log('🔄 Creating minimal interview data...')
  
  let jobs = []
  
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
  
  // Filter only jobs with interview questions (needed for interview links)
  const jobsWithQuestions = jobs.filter(job => job.interviewQuestions && job.interviewQuestions.length > 0)
  console.log(`📋 Found ${jobsWithQuestions.length} jobs with interview questions`)
  
  // Sort by ID (newer jobs have higher IDs) and take the most recent ones
  const sortedJobs = jobsWithQuestions.sort((a, b) => {
    // Extract numeric part from ID for sorting
    const aId = parseInt(a.id.replace('draft-', '').split('-')[0])
    const bId = parseInt(b.id.replace('draft-', '').split('-')[0])
    return bId - aId // Descending order (newest first)
  })
  
  // Take only the most recent 20 jobs to fit within size limit
  const recentJobs = sortedJobs.slice(0, 20)
  console.log(`📋 Taking the most recent ${recentJobs.length} jobs`)
  
  // Extract only the absolute minimum data
  const minimalData = recentJobs.map(job => {
    return {
      id: job.id,
      title: job.title,
      companyId: job.companyId,
      isDraft: job.isDraft,
      interviewQuestions: job.interviewQuestions.map(q => ({
        id: q.id,
        question: q.question,
        timeLimit: q.timeLimit,
        competencyId: q.competencyId
      })),
      competencies: (job.competencies || []).map(c => ({
        id: c.id,
        name: c.name,
        weight: c.weight
      })),
      candidates: job.candidates ? job.candidates.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email || ''
      })) : []
    }
  })
  
  console.log(`📦 Created minimal data for ${minimalData.length} jobs`)
  
  // Save to file
  const compactData = JSON.stringify(minimalData)
  const minimalFile = path.join(__dirname, 'minimal-interview-data.json')
  fs.writeFileSync(minimalFile, compactData)
  
  console.log(`✅ Minimal interview data saved to ${minimalFile}`)
  console.log(`📊 File size: ${(fs.statSync(minimalFile).size / 1024).toFixed(2)} KB`)
  console.log(`📊 File size in bytes: ${fs.statSync(minimalFile).size}`)
  
  // Check if it's under the limit
  const sizeLimit = 65535
  const actualSize = fs.statSync(minimalFile).size
  
  if (actualSize < sizeLimit) {
    console.log(`✅ File is under the ${sizeLimit} byte limit!`)
  } else {
    console.log(`❌ File is still too large (${actualSize} bytes > ${sizeLimit} bytes)`)
    console.log(`📊 Trying even smaller dataset...`)
    
    // Try with even fewer jobs if still too large
    const evenSmallerData = minimalData.slice(0, 10)
    const evenSmallerJson = JSON.stringify(evenSmallerData)
    const evenSmallerFile = path.join(__dirname, 'even-smaller-interview-data.json')
    fs.writeFileSync(evenSmallerFile, evenSmallerJson)
    
    console.log(`✅ Even smaller data saved to ${evenSmallerFile}`)
    console.log(`📊 Size: ${(fs.statSync(evenSmallerFile).size / 1024).toFixed(2)} KB (${fs.statSync(evenSmallerFile).size} bytes)`)
    
    if (fs.statSync(evenSmallerFile).size < sizeLimit) {
      console.log(`✅ Even smaller file is under the ${sizeLimit} byte limit!`)
      console.log(`📋 Contains ${evenSmallerData.length} most recent jobs`)
    }
  }
  
  return minimalData
}

// Run the script
createMinimalInterviewData() 