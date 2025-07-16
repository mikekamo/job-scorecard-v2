#!/usr/bin/env node

const https = require('https')

// Test blob storage with minimal data
function testBlob() {
  const testData = JSON.stringify([
    {
      id: 'test-job-1',
      title: 'Test Job',
      description: 'This is a test job',
      competencies: [],
      interviewQuestions: [],
      candidates: []
    }
  ])
  
  console.log('🧪 Testing Vercel Blob storage with minimal data...')
  
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
      console.log('Status:', res.statusCode)
      console.log('Response:', responseData)
      
      if (res.statusCode === 200) {
        console.log('✅ Blob storage is working!')
        
        // Test reading the data back
        console.log('🔍 Testing read from blob storage...')
        const getReq = https.request({
          hostname: 'job-scorecard-v2-6w8y-git-main-mike-kamos-projects.vercel.app',
          port: 443,
          path: '/api/data',
          method: 'GET'
        }, (getRes) => {
          let getData = ''
          
          getRes.on('data', (chunk) => {
            getData += chunk
          })
          
          getRes.on('end', () => {
            console.log('Read Status:', getRes.statusCode)
            console.log('Read Response:', getData)
            
            if (getRes.statusCode === 200) {
              console.log('✅ Read from blob storage successful!')
            } else {
              console.log('❌ Read from blob storage failed')
            }
          })
        })
        
        getReq.on('error', (error) => {
          console.error('❌ Read error:', error)
        })
        
        getReq.end()
        
      } else {
        console.log('❌ Blob storage test failed')
      }
    })
  })
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error)
  })
  
  req.write(testData)
  req.end()
}

testBlob() 