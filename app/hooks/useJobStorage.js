'use client'

import { useState, useEffect, useCallback } from 'react'

export function useJobStorage() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [storageError, setStorageError] = useState(null)



  // Load data with localStorage as primary (simpler and more reliable)
  const loadData = useCallback(async () => {
    console.log('🔄 Starting to load data...')
    setIsLoading(true)
    setStorageError(null)

    try {
      // Try localStorage first, but also check server for updates
      console.log('📦 Checking localStorage...')
      const savedJobs = localStorage.getItem('jobScorecards')
      
      if (savedJobs) {
        const localJobs = JSON.parse(savedJobs)
        console.log(`📦 Found ${localJobs.length} jobs in localStorage`)
        
        // Also check server for any updates and merge intelligently
        try {
          console.log('📡 Also checking server for updates...')
          const response = await fetch('/api/data')
          if (response.ok) {
            const serverJobs = await response.json()
            console.log(`📡 Found ${serverJobs.length} jobs on server`)
            
            // Smart merge: preserve local candidates that might not be on server yet
            const mergedJobs = serverJobs.map(serverJob => {
              const localJob = localJobs.find(j => j.id === serverJob.id)
              if (!localJob) return serverJob
              
              // Merge candidates: combine server candidates with local-only candidates
              const serverCandidateIds = new Set(serverJob.candidates?.map(c => c.id) || [])
              const localOnlyCandidates = (localJob.candidates || []).filter(c => !serverCandidateIds.has(c.id))
              
              console.log(`🔄 Job "${serverJob.title}": Server has ${serverJob.candidates?.length || 0} candidates, Local has ${localOnlyCandidates.length} additional candidates`)
              
              return {
                ...serverJob,
                candidates: [
                  ...(serverJob.candidates || []),
                  ...localOnlyCandidates
                ]
              }
            })
            
            // Add any local-only jobs that don't exist on server
            const serverJobIds = new Set(serverJobs.map(j => j.id))
            const localOnlyJobs = localJobs.filter(j => !serverJobIds.has(j.id))
            
            const finalJobs = [...mergedJobs, ...localOnlyJobs].map(job => ({
              ...job,
              candidates: (job.candidates || []).map(candidate => ({
                ...candidate,
                scores: candidate.scores || {},
                aiScores: candidate.aiScores || {},
                explanations: candidate.explanations || {},
                transcript: candidate.transcript || ''
              }))
            }))
            
            setJobs(finalJobs)
            // Update localStorage with merged data
            localStorage.setItem('jobScorecards', JSON.stringify(finalJobs))
            console.log(`✅ Smart merged ${finalJobs.length} jobs (localStorage + server)`)
          } else {
            // Server not available, just use localStorage data
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
            console.log(`✅ Loaded ${updatedJobs.length} jobs from localStorage only (server unavailable)`)
          }
        } catch (serverError) {
          // Server error, just use localStorage data
          console.log('⚠️ Server error, using localStorage only')
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
          console.log(`✅ Loaded ${updatedJobs.length} jobs from localStorage only (server error)`)
        }
      } else {
        // Try file storage as backup with smart merging
        try {
          console.log('📡 No localStorage, trying file storage...')
          const response = await fetch('/api/data')
          if (response.ok) {
            const serverJobs = await response.json()
            
            // Check if we have any localStorage data to merge
            const currentLocalJobs = JSON.parse(localStorage.getItem('jobScorecards') || '[]')
            
            if (currentLocalJobs.length > 0) {
              console.log('🔄 Smart merging file storage with localStorage data...')
              
              // Smart merge: combine server data with local data
              const mergedJobs = serverJobs.map(serverJob => {
                const localJob = currentLocalJobs.find(j => j.id === serverJob.id)
                if (!localJob) return serverJob
                
                // Merge candidates: combine server candidates with local-only candidates
                const serverCandidateIds = new Set(serverJob.candidates?.map(c => c.id) || [])
                const localOnlyCandidates = (localJob.candidates || []).filter(c => !serverCandidateIds.has(c.id))
                
                return {
                  ...serverJob,
                  candidates: [
                    ...(serverJob.candidates || []),
                    ...localOnlyCandidates
                  ]
                }
              })
              
              // Add any local-only jobs that don't exist on server
              const serverJobIds = new Set(serverJobs.map(j => j.id))
              const localOnlyJobs = currentLocalJobs.filter(j => !serverJobIds.has(j.id))
              
              const finalJobs = [...mergedJobs, ...localOnlyJobs].map(job => ({
                ...job,
                candidates: (job.candidates || []).map(candidate => ({
                  ...candidate,
                  scores: candidate.scores || {},
                  aiScores: candidate.aiScores || {},
                  explanations: candidate.explanations || {},
                  transcript: candidate.transcript || ''
                }))
              }))
              
              setJobs(finalJobs)
              console.log(`✅ Loaded ${finalJobs.length} jobs from merged file storage + localStorage`)
            } else {
              // No localStorage data, just use server data
              const updatedJobs = serverJobs.map(job => ({
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
              console.log(`✅ Loaded ${updatedJobs.length} jobs from file storage`)
            }
          } else {
            console.log('ℹ️ No data found anywhere, starting fresh')
            setJobs([])
          }
        } catch (fileError) {
          console.log('ℹ️ File storage failed, starting fresh')
          setJobs([])
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading jobs:', error)
      setStorageError(error.message)
      setJobs([])
    } finally {
      console.log('🏁 Setting loading to false')
      setIsLoading(false)
    }
  }, [])

  // Save data to localStorage (and file as backup)
  const saveData = useCallback(async (newJobs) => {
    try {
      // Save to localStorage first (primary storage)
      localStorage.setItem('jobScorecards', JSON.stringify(newJobs))
      console.log(`💾 Saved ${newJobs.length} jobs to localStorage`)
      
      // Try to backup to file storage (optional)
      try {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newJobs)
        })
        if (response.ok) {
          console.log(`💾 Also backed up to file storage`)
        }
      } catch (fileError) {
        console.log('⚠️ File backup failed, but localStorage saved successfully')
      }
      
    } catch (error) {
      console.error('❌ Error saving jobs:', error)
      setStorageError(error.message)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadData()
      } catch (error) {
        console.error('Failed to load data:', error)
        setIsLoading(false)
        setStorageError('Failed to load data')
      }
    }
    
    fetchData()
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout reached, forcing completion')
      setIsLoading(false)
      setJobs(prev => prev.length === 0 ? [] : prev)
    }, 10000) // 10 second timeout
    
    return () => clearTimeout(timeout)
  }, [])

  // Auto-save whenever jobs change
  useEffect(() => {
    if (!isLoading) {
      saveData(jobs)
    }
  }, [jobs, isLoading, saveData])

  // Manual backup function
  const createManualBackup = useCallback(() => {
    if (jobs.length > 0) {
      const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-scorecards-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      return true
    }
    return false
  }, [jobs])

  // Restore from backup file
  const restoreFromFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          setJobs(data)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }, [])

  // Clear all data
  const clearAllData = useCallback(() => {
    setJobs([])
  }, [])

  // Update a specific job
  const updateJob = useCallback((updatedJob) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    )
  }, [])

  return {
    jobs,
    setJobs,
    updateJob,
    isLoading,
    storageError,
    createManualBackup,
    restoreFromFile,
    clearAllData,
    reloadData: loadData
  }
} 