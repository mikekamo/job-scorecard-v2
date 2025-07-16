#!/usr/bin/env node

const { list, put } = require('@vercel/blob')

async function testBlobToken() {
  console.log('🔐 Testing Vercel Blob token permissions...')
  
  // Check if token is set
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.log('❌ BLOB_READ_WRITE_TOKEN not found in environment')
    return
  }
  
  console.log('✅ Token found in environment')
  console.log(`🔑 Token preview: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`)
  
  try {
    // Test 1: List blobs (READ permission)
    console.log('\n📖 Testing READ permission...')
    const { blobs } = await list({ token })
    console.log(`✅ READ permission: SUCCESS - Found ${blobs.length} blobs`)
    
    if (blobs.length > 0) {
      console.log('📄 Existing blobs:')
      blobs.forEach((blob, index) => {
        console.log(`  ${index + 1}. ${blob.pathname} (${(blob.size / 1024).toFixed(2)} KB)`)
      })
    }
    
    // Test 2: Write a small test blob (WRITE permission)
    console.log('\n📝 Testing WRITE permission...')
    const testData = JSON.stringify({ test: 'blob-token-test', timestamp: Date.now() })
    
    const result = await put(`test-token-${Date.now()}.json`, testData, {
      access: 'public',
      contentType: 'application/json',
      token
    })
    
    console.log('✅ WRITE permission: SUCCESS')
    console.log(`🔗 Test blob URL: ${result.url}`)
    console.log(`📊 Test blob size: ${(result.size / 1024).toFixed(2)} KB`)
    
  } catch (error) {
    console.log('❌ Token permission test FAILED')
    console.log('🔍 Error details:')
    console.log(`   Type: ${error.name}`)
    console.log(`   Message: ${error.message}`)
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('🚨 DIAGNOSIS: Token is invalid or expired')
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('🚨 DIAGNOSIS: Token lacks required permissions')
    } else if (error.message.includes('429')) {
      console.log('🚨 DIAGNOSIS: Rate limit exceeded')
    } else if (error.message.includes('quota')) {
      console.log('🚨 DIAGNOSIS: Storage quota exceeded')
    } else {
      console.log('🔍 DIAGNOSIS: Unknown error - check network/service status')
    }
  }
}

testBlobToken() 