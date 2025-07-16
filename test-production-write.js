#!/usr/bin/env node

const https = require('https')

// Test a simple job write to production
function testProductionWrite() {
  const testJob = {
    id: 'test-write-' + Date.now(),
    title: 'Test Job Write',
    description: 'Testing production write functionality',
    competencies: [],
    interviewQuestions: [],
    candidates: [],
    dateCreated: new Date().toISOString()
  }
  
  const testData = JSON.stringify([testJob])
  
  console.log('🧪 Testing production write functionality...')
  console.log(`📦 Test data size: ${(testData.length / 1024).toFixed(2)} KB`)
  
  const options = {
    hostname: 'job-scorecard-v2-6w8y-git-main-mike-kamos-projects.vercel.app',
    port: 443,
    path: '/api/data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  }
  
  const req = https.request(options, (res) => {
    let responseData = ''
    
    res.on('data', (chunk) => {
      responseData += chunk
    })
    
    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`)
      console.log(`📋 Response: ${responseData}`)
      
      if (res.statusCode === 200) {
        console.log('✅ Production write test: SUCCESS')
      } else {
        console.log('❌ Production write test: FAILED')
      }
    })
  })
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error)
  })
  
  req.write(testData)
  req.end()
}

testProductionWrite() 