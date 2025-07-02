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
      // Try localStorage first (more reliable)
      console.log('📦 Checking localStorage...')
      const savedJobs = localStorage.getItem('jobScorecards')
      
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs)
        const updatedJobs = parsedJobs.map(job => ({
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
        console.log(`✅ Loaded ${updatedJobs.length} jobs from localStorage`)
      } else {
        // Try file storage as backup
        try {
          console.log('📡 No localStorage, trying file storage...')
          const response = await fetch('/api/data')
          if (response.ok) {
            const jobs = await response.json()
            const updatedJobs = jobs.map(job => ({
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

  return {
    jobs,
    setJobs,
    isLoading,
    storageError,
    createManualBackup,
    restoreFromFile,
    clearAllData,
    reloadData: loadData
  }
} 