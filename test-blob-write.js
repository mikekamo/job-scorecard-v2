#!/usr/bin/env node

const https = require('https')

// Test blob storage write functionality
function testBlobWrite() {
  const testData = JSON.stringify([
    {
      id: 'test-job-' + Date.now(),
      title: 'Test Job for Blob Storage',
      description: 'Testing blob storage functionality',
      competencies: [
        { 
          id: 'comp-1',
          name: 'Test Competency',
          description: 'Testing competency'
        }
      ],
      interviewQuestions: [],
      candidates: [],
      dateCreated: new Date().toISOString()
    }
  ])
  
  console.log('🧪 Testing Vercel Blob storage write functionality...')
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
      console.log(`📊 Response status: ${res.statusCode}`)
      console.log(`📄 Response data: ${responseData}`)
      
      if (res.statusCode === 200) {
        console.log('✅ Blob storage write test: SUCCESS')
        try {
          const parsedResponse = JSON.parse(responseData)
          if (parsedResponse.success) {
            console.log(`✅ Successfully saved ${parsedResponse.count} job(s) to blob storage`)
            if (parsedResponse.url) {
              console.log(`🔗 Blob URL: ${parsedResponse.url}`)
            }
          }
        } catch (e) {
          console.log('⚠️  Response parsing error:', e.message)
        }
      } else {
        console.log('❌ Blob storage write test: FAILED')
      }
    })
  })
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error)
  })
  
  req.write(testData)
  req.end()
}

testBlobWrite() 