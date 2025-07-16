#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

// Read local data
const DATA_FILE = path.join(__dirname, 'data', 'jobs.json')

function cleanJobData(jobs) {
  return jobs.map(job => {
    const cleanedJob = {
      ...job,
      candidates: job.candidates ? job.candidates.map(candidate => {
        const cleanedCandidate = {
          ...candidate,
          // Keep essential fields for interview links
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          notes: candidate.notes,
          dateAdded: candidate.dateAdded,
          isNew: candidate.isNew,
          lastViewedAt: candidate.lastViewedAt,
          scores: candidate.scores || {},
          aiScores: candidate.aiScores || {},
          explanations: candidate.explanations || {},
          transcript: candidate.transcript || '',
          interviews: candidate.interviews || [],
        }
        
        // Remove large video data but keep essential video response metadata
        if (candidate.videoResponses) {
          cleanedCandidate.videoResponses = candidate.videoResponses.map(response => ({
            questionIndex: response.questionIndex,
            question: response.question,
            cloudUrl: response.cloudUrl,
            timestamp: response.timestamp,
            // Remove large blob data
            // video: undefined, // Remove blob data
            // base64: undefined // Remove base64 data
          }))
        }
        
        return cleanedCandidate
      }) : []
    }
    
    return cleanedJob
  })
}

function syncData() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting data sync...')
    
    let jobs = []
    
    // Check if local data file exists
    if (fs.existsSync(DATA_FILE)) {
      try {
        const data = fs.readFileSync(DATA_FILE, 'utf8')
        jobs = JSON.parse(data)
        console.log(`📂 Found ${jobs.length} jobs in local storage`)
      } catch (error) {
        console.error('❌ Error reading local data file:', error)
        reject(error)
        return
      }
    } else {
      console.log('⚠️ No local data file found. Create some jobs first.')
      reject(new Error('No local data file found'))
      return
    }
    
    if (jobs.length === 0) {
      console.log('⚠️ No jobs to sync')
      resolve()
      return
    }
    
    // Clean up the data to reduce payload size
    console.log('🧹 Cleaning up data to reduce payload size...')
    const cleanedJobs = cleanJobData(jobs)
    
    const originalSize = JSON.stringify(jobs).length
    const cleanedSize = JSON.stringify(cleanedJobs).length
    console.log(`📦 Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`)
    console.log(`📦 Cleaned size: ${(cleanedSize / 1024 / 1024).toFixed(2)}MB`)
    console.log(`📦 Reduction: ${(((originalSize - cleanedSize) / originalSize) * 100).toFixed(1)}%`)
    
    // Prepare data to send
    const data = JSON.stringify(cleanedJobs)
    
    const options = {
      hostname: 'job-scorecard-v2-6w8y-git-main-mike-kamos-projects.vercel.app',
      port: 443,
      path: '/api/data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }
    
    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Data synced successfully!')
          console.log('Response:', responseData)
          
          // Verify the sync
          console.log('🔍 Verifying sync...')
          const verifyReq = https.request({
            hostname: 'job-scorecard-v2-6w8y-git-main-mike-kamos-projects.vercel.app',
            port: 443,
            path: '/api/data',
            method: 'GET'
          }, (verifyRes) => {
            let verifyData = ''
            
            verifyRes.on('data', (chunk) => {
              verifyData += chunk
            })
            
            verifyRes.on('end', () => {
              if (verifyRes.statusCode === 200) {
                try {
                  const serverJobs = JSON.parse(verifyData)
                  console.log(`✅ Verification: Server now has ${serverJobs.length} jobs`)
                  resolve(serverJobs)
                } catch (parseError) {
                  console.log(`✅ Verification: Server responded successfully`)
                  resolve()
                }
              } else {
                console.error('❌ Verification failed:', verifyRes.statusCode)
                resolve() // Still resolve since main sync worked
              }
            })
          })
          
          verifyReq.on('error', (error) => {
            console.error('❌ Verification error:', error)
            resolve() // Still resolve since main sync worked
          })
          
          verifyReq.end()
          
        } else {
          console.error('❌ Sync failed:', res.statusCode, responseData)
          reject(new Error(`Sync failed: ${res.statusCode}`))
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Network error:', error)
      reject(error)
    })
    
    req.write(data)
    req.end()
  })
}

// Run the sync
syncData()
  .then(() => {
    console.log('🎉 Sync completed successfully!')
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }) 