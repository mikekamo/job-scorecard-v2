'use client'

import { useState, useEffect, useCallback } from 'react'

export function useJobStorage() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [storageError, setStorageError] = useState(null)

  // Load data with server storage as primary source of truth
  const loadData = useCallback(async () => {
    console.log('🔄 Starting to load data...')
    setIsLoading(true)
    setStorageError(null)

    try {
      // Try server storage first (primary source of truth)
      console.log('📡 Checking server storage...')
      const response = await fetch('/api/data')
      
      if (response.ok) {
        const serverJobs = await response.json()
        console.log(`📡 Found ${serverJobs.length} jobs on server`)
        
        // Also check localStorage for any new local data to sync
        const savedJobs = localStorage.getItem('jobScorecards')
        if (savedJobs) {
          const localJobs = JSON.parse(savedJobs)
          console.log(`📦 Found ${localJobs.length} jobs in localStorage`)
          
          // Smart merge: combine server data with local-only data
          const serverJobIds = new Set(serverJobs.map(j => j.id))
          const localOnlyJobs = localJobs.filter(j => !serverJobIds.has(j.id))
          
          if (localOnlyJobs.length > 0) {
            console.log(`🔄 Found ${localOnlyJobs.length} local-only jobs to sync`)
            
            // Merge server jobs with local-only jobs
            const mergedJobs = [...serverJobs, ...localOnlyJobs]
            
            // Save merged data back to server
            try {
              await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mergedJobs)
              })
              console.log('✅ Synced local-only jobs to server')
            } catch (syncError) {
              console.warn('⚠️ Failed to sync local jobs to server:', syncError)
            }
            
            setJobs(mergedJobs)
          } else {
            setJobs(serverJobs)
          }
        } else {
          setJobs(serverJobs)
        }
        
        // Update localStorage with server data for offline access
        localStorage.setItem('jobScorecards', JSON.stringify(serverJobs))
        console.log('✅ Data loaded from server and cached locally')
        
      } else {
        // Server failed, try localStorage as fallback
        console.log('⚠️ Server storage failed, trying localStorage fallback')
        const savedJobs = localStorage.getItem('jobScorecards')
        
        if (savedJobs) {
          const localJobs = JSON.parse(savedJobs)
          console.log(`📦 Using ${localJobs.length} jobs from localStorage fallback`)
          
          const updatedJobs = localJobs.map(job => ({
            ...job,
            candidates: (job.candidates || []).map(candidate => ({
              ...candidate,
              scores: candidate.scores || {},
              aiScores: candidate.aiScores || {},
              explanations: candidate.explanations || {},
              transcript: candidate.transcript || ''
            }))
          }))
          
          setJobs(updatedJobs)
          setStorageError('Using offline data - server unavailable')
        } else {
          console.log('ℹ️ No server data and no localStorage, starting fresh')
          setJobs([])
        }
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      
      // Final fallback to localStorage
      try {
        const savedJobs = localStorage.getItem('jobScorecards')
        if (savedJobs) {
          const localJobs = JSON.parse(savedJobs)
          console.log(`📦 Emergency fallback: using ${localJobs.length} jobs from localStorage`)
          setJobs(localJobs)
          setStorageError('Using offline data - connection failed')
        } else {
          setJobs([])
          setStorageError('Failed to load data - no offline backup available')
        }
      } catch (localError) {
        console.error('❌ Even localStorage failed:', localError)
        setJobs([])
        setStorageError('Failed to load data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save data to server storage (primary) and localStorage (backup)
  const saveData = useCallback(async (newJobs) => {
    console.log(`💾 Saving ${newJobs.length} jobs...`)
    
    try {
      // Save to server first (primary storage)
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobs)
      })
      
      if (response.ok) {
        console.log(`✅ Saved ${newJobs.length} jobs to server`)
        
        // Update localStorage as backup/cache
        localStorage.setItem('jobScorecards', JSON.stringify(newJobs))
        console.log(`💾 Also cached ${newJobs.length} jobs locally`)
        
        // Update state
        setJobs(newJobs)
        setStorageError(null)
        
      } else {
        throw new Error('Server save failed')
      }
      
    } catch (error) {
      console.error('❌ Error saving to server:', error)
      
      // Fallback to localStorage only
      try {
        localStorage.setItem('jobScorecards', JSON.stringify(newJobs))
        console.log(`⚠️ Saved ${newJobs.length} jobs to localStorage only (server failed)`)
        
        setJobs(newJobs)
        setStorageError('Data saved locally - will sync when server is available')
        
      } catch (localError) {
        console.error('❌ Even localStorage save failed:', localError)
        setStorageError('Failed to save data')
        throw localError
      }
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Export data function
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `job-scorecard-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [jobs])

  // Upload data function
  const uploadData = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (Array.isArray(data)) {
            await saveData(data)
            resolve(data.length)
          } else {
            reject(new Error('Invalid data format'))
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsText(file)
    })
  }, [saveData])

  // Sync function to manually sync local data to server
  const syncToServer = useCallback(async () => {
    console.log('🔄 Manual sync to server...')
    const savedJobs = localStorage.getItem('jobScorecards')
    
    if (savedJobs) {
      const localJobs = JSON.parse(savedJobs)
      try {
        await saveData(localJobs)
        console.log('✅ Manual sync completed')
        return true
      } catch (error) {
        console.error('❌ Manual sync failed:', error)
        return false
      }
    }
    return false
  }, [saveData])

  // Update a single job
  const updateJob = useCallback(async (updatedJob) => {
    console.log('🔄 Updating job:', updatedJob.id)
    
    try {
      // Get current jobs from storage
      const currentJobs = localStorage.getItem('jobScorecards')
      let jobsArray = currentJobs ? JSON.parse(currentJobs) : []
      
      // Update the job in the array
      const jobIndex = jobsArray.findIndex(job => job.id === updatedJob.id)
      if (jobIndex !== -1) {
        jobsArray[jobIndex] = {
          ...updatedJob,
          lastModified: new Date().toISOString()
        }
        
        // Save back to localStorage
        localStorage.setItem('jobScorecards', JSON.stringify(jobsArray))
        
        // Also save to server
        await saveData(jobsArray)
        
        // Update local state
        setJobs(prevJobs => {
          const newJobs = [...prevJobs]
          const stateIndex = newJobs.findIndex(job => job.id === updatedJob.id)
          if (stateIndex !== -1) {
            newJobs[stateIndex] = jobsArray[jobIndex]
          }
          return newJobs
        })
        
        console.log('✅ Job updated successfully')
      } else {
        console.warn('⚠️ Job not found for update:', updatedJob.id)
      }
    } catch (error) {
      console.error('❌ Failed to update job:', error)
      throw error
    }
  }, [saveData, setJobs])

  return {
    jobs,
    isLoading,
    storageError,
    saveData,
    exportData,
    uploadData,
    syncToServer,
    updateJob,
    reloadData: loadData
  }
} 