'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Briefcase, FileText } from 'lucide-react'
import JobsList from './components/JobsList'
import JobForm from './components/JobForm'
import ScorecardView from './components/ScorecardView'
import DebugPanel from './components/DebugPanel'
import { useJobStorage } from './hooks/useJobStorage'

export default function Home() {
  // Temporarily bypass complex storage for debugging
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [storageError, setStorageError] = useState(null)

  // Simple localStorage loading
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('jobScorecards')
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs)
        setJobs(parsedJobs)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Simple localStorage saving
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('jobScorecards', JSON.stringify(jobs))
    }
  }, [jobs, isLoading])
  const [currentView, setCurrentView] = useState('jobs') // 'jobs', 'create-job', 'scorecard'
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const addJob = (jobData) => {
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      candidates: [],
      dateCreated: new Date().toISOString()
    }
    setJobs([...jobs, newJob])
    setCurrentView('jobs')
  }

  const updateJob = (jobId, jobData) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, ...jobData } : job
    ))
  }

  const deleteJob = (jobId) => {
    setJobs(jobs.filter(job => job.id !== jobId))
  }

  const duplicateJob = (job) => {
    const duplicatedJob = {
      ...job,
      id: Date.now().toString(),
      title: `${job.title} (Copy)`,
      candidates: [], // Start with no candidates in the copy
      dateCreated: new Date().toISOString()
    }
    setJobs([...jobs, duplicatedJob])
  }

  const addCandidate = (jobId, candidateData) => {
    const newCandidate = {
      id: Date.now().toString(),
      ...candidateData,
      scores: {},
      aiScores: {},
      explanations: {},
      transcript: candidateData.transcript || '',
      dateAdded: new Date().toISOString()
    }
    
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, candidates: [...job.candidates, newCandidate] }
        : job
    ))
  }

  const updateCandidateScore = (jobId, candidateId, competencyId, score) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? {
            ...job,
            candidates: job.candidates.map(candidate =>
              candidate.id === candidateId
                ? {
                    ...candidate,
                    scores: { ...candidate.scores, [competencyId]: score }
                  }
                : candidate
            )
          }
        : job
    ))
  }

  const updateCandidate = (jobId, updatedCandidate) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? {
            ...job,
            candidates: job.candidates.map(candidate =>
              candidate.id === updatedCandidate.id
                ? { ...candidate, ...updatedCandidate }
                : candidate
            )
          }
        : job
    ))
  }



  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (storageError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {storageError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {currentView === 'jobs' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Job Scorecards</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('create-job')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} />
                New Job
              </button>
              <button
                onClick={() => {
                  document.cookie = 'authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                  window.location.reload()
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm"
                title="Logout"
              >
                🚪 Logout
              </button>
            </div>
          </div>
          
          <JobsList
            jobs={jobs}
            onEditJob={(job) => {
              setSelectedJob(job)
              setCurrentView('create-job')
            }}
            onDeleteJob={deleteJob}
            onDuplicateJob={duplicateJob}
            onViewScorecard={(job) => {
              setSelectedJob(job)
              setCurrentView('scorecard')
            }}
          />
        </div>
      )}

      {currentView === 'create-job' && (
        <JobForm
          job={selectedJob}
          onSave={selectedJob ? 
            (data) => updateJob(selectedJob.id, data) : 
            addJob
          }
          onCancel={() => {
            setSelectedJob(null)
            setCurrentView('jobs')
          }}
        />
      )}

      {currentView === 'scorecard' && selectedJob && (() => {
        // Get the current job data from the jobs array to ensure we have the latest state
        const currentJob = jobs.find(job => job.id === selectedJob.id)
        if (!currentJob) return null
        
        return (
          <ScorecardView
            job={currentJob}
            onAddCandidate={(candidateData) => addCandidate(selectedJob.id, candidateData)}
            onUpdateScore={(candidateId, competencyId, score) =>
              updateCandidateScore(selectedJob.id, candidateId, competencyId, score)
            }
            onUpdateCandidate={(candidateData) => updateCandidate(selectedJob.id, candidateData)}
            onBack={() => {
              setSelectedJob(null)
              setCurrentView('jobs')
            }}
            onUpdateJob={(data) => updateJob(selectedJob.id, data)}
          />
        )
      })()}
      <DebugPanel />
    </div>
  )
} 