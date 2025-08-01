'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft } from 'lucide-react'
import JobsList from '../../components/JobsList'
import JobForm from '../../components/JobForm'
import ScorecardView from '../../components/ScorecardView'
import DebugPanel from '../../components/DebugPanel'
import { useJobStorage } from '../../hooks/useJobStorage'

export default function CompanyJobsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const companyId = params.companyId
  
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState('jobs') // 'jobs', 'create-job', 'scorecard'
  const [selectedJob, setSelectedJob] = useState(null)
  
  // Use the job storage hook for consistent data management
  const { saveData } = useJobStorage()

  // Load company and jobs data
  useEffect(() => {
    loadJobs()
  }, [companyId])

  // Reload jobs and drafts when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadJobs()
      }
    }

    const handleFocus = () => {
      loadJobs()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [companyId])

  const loadJobs = () => {
    try {
      // Load company data
      const savedCompanies = localStorage.getItem('scorecard-companies')
      if (savedCompanies) {
        const companies = JSON.parse(savedCompanies)
        const currentCompany = companies.find(c => c.id === companyId)
        if (currentCompany) {
          setCompany(currentCompany)
        }
      }

      // Load jobs for this company
      const savedJobs = localStorage.getItem('jobScorecards')
      
      let allJobs = []
      
      // Load regular jobs
      if (savedJobs) {
        const jobs = JSON.parse(savedJobs)
        const companyJobs = jobs.filter(job => job.companyId === companyId)
        allJobs = companyJobs
      }
      
      // Sort by date created (newest first)
      allJobs.sort((a, b) => {
        return new Date(b.dateCreated) - new Date(a.dateCreated)
      })
      
      setJobs(allJobs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update company job count when jobs change
  useEffect(() => {
    if (!isLoading) {
      try {
        const savedCompanies = localStorage.getItem('scorecard-companies')
        if (savedCompanies) {
          const companies = JSON.parse(savedCompanies)
          const updatedCompanies = companies.map(c => 
            c.id === companyId ? { ...c, jobCount: jobs.length } : c
          )
          localStorage.setItem('scorecard-companies', JSON.stringify(updatedCompanies))
        }
      } catch (error) {
        console.error('Error updating company data:', error)
      }
    }
  }, [jobs.length, isLoading, companyId])

  // Handle job selection from URL parameter
  useEffect(() => {
    if (!isLoading && jobs.length > 0) {
      const jobId = searchParams.get('job')
      if (jobId) {
        const job = jobs.find(j => j.id === jobId)
        if (job) {
          setSelectedJob(job)
          setCurrentView('scorecard')
        }
      }
    }
  }, [searchParams, jobs, isLoading])

  // Handle add-job parameter to open job creation form
  useEffect(() => {
    if (!isLoading) {
      const addJob = searchParams.get('add-job')
      const templateData = searchParams.get('template')
      
      if (addJob === 'true') {
        setCurrentView('create-job')
        setSelectedJob(null)
        
        // If template data is provided, set it as the selected job for editing
        if (templateData) {
          try {
            const template = JSON.parse(decodeURIComponent(templateData))
            setSelectedJob(template)
          } catch (error) {
            console.error('Error parsing template data:', error)
          }
        }
        
        // Remove the parameters from URL
        router.replace(`/company/${companyId}`, undefined, { shallow: true })
      }
    }
  }, [searchParams, isLoading, companyId, router])

  // Function to reload data from server (for checking new video interviews)
  const reloadData = async () => {
    try {
      const response = await fetch('/api/data')
      if (response.ok) {
        const serverJobs = await response.json()
        const companyServerJobs = serverJobs.filter(job => job.companyId === companyId)
        
        // Smart merge logic (similar to original)
        const currentLocalJobs = jobs
        
        const mergedJobs = companyServerJobs.map(serverJob => {
          const localJob = currentLocalJobs.find(j => j.id === serverJob.id)
          if (!localJob) return serverJob
          
          // Merge candidates
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
        const serverJobIds = new Set(companyServerJobs.map(j => j.id))
        const localOnlyJobs = currentLocalJobs.filter(j => !serverJobIds.has(j.id))
        
        const finalJobs = [...mergedJobs, ...localOnlyJobs]
        setJobs(finalJobs)
      }
    } catch (error) {
      console.error('Error reloading data:', error)
    }
  }

  const addJob = async (jobData) => {
    // Use the ID provided by JobForm (don't generate a new one)
    const newJob = {
      ...jobData,
      companyId: companyId, // Associate job with company
      candidates: jobData.candidates || [],
      dateCreated: jobData.dateCreated || new Date().toISOString(),
      isDraft: false, // Ensure it's marked as complete
      lastModified: new Date().toISOString()
    }
    
    console.log('🔧 Company: Adding job with ID:', newJob.id)
    
    // Get all existing jobs and add the new one
    const savedJobs = localStorage.getItem('jobScorecards')
    const allJobs = savedJobs ? JSON.parse(savedJobs) : []
    const updatedJobs = [...allJobs, newJob]
    
    // Save using the proper storage system (saves to both server and localStorage)
    await saveData(updatedJobs)
    
    // Update local state
    setJobs([...jobs, newJob])
    setCurrentView('jobs')
  }

  const updateJob = async (jobId, jobData) => {
    // Get all existing jobs and update the specific one
    const savedJobs = localStorage.getItem('jobScorecards')
    const allJobs = savedJobs ? JSON.parse(savedJobs) : []
    
    const updatedJobs = allJobs.map(job => 
      job.id === jobId ? { 
        ...job, 
        ...jobData,
        isDraft: false, // Ensure it's marked as complete when updated
        lastModified: new Date().toISOString()
      } : job
    )
    
    console.log('🔧 Company: Updating job with ID:', jobId)
    
    // Save using the proper storage system (saves to both server and localStorage)
    await saveData(updatedJobs)
    
    // Update local state
    setJobs(jobs.map(job => 
      job.id === jobId ? { 
        ...job, 
        ...jobData,
        isDraft: false, // Ensure it's marked as complete when updated
        lastModified: new Date().toISOString()
      } : job
    ))
  }

  const deleteJob = async (jobId) => {
    // Get all existing jobs and remove the specific one
    const savedJobs = localStorage.getItem('jobScorecards')
    const allJobs = savedJobs ? JSON.parse(savedJobs) : []
    
    const updatedJobs = allJobs.filter(job => job.id !== jobId)
    
    console.log('🗑️ Company: Deleting job with ID:', jobId)
    
    // Save using the proper storage system (saves to both server and localStorage)
    await saveData(updatedJobs)
    
    // Update local state
    setJobs(jobs.filter(job => job.id !== jobId))
  }

  const duplicateJob = (job) => {
    const duplicatedJob = {
      ...job,
      id: Date.now().toString(),
      title: `${job.title} (Copy)`,
      candidates: [],
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
    
    return newCandidate
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Company not found</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentView === 'jobs' && (
        <>
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{company.name} Jobs</h1>
                    <p className="text-lg text-gray-600 mt-1">Manage and evaluate job positions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentView('create-job')
                      router.push(`/company/${companyId}`, undefined, { shallow: true })
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    New Job
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <JobsList
              jobs={jobs}
              onEditJob={(job) => {
                setSelectedJob(job)
                setCurrentView('create-job')
                router.push(`/company/${companyId}`, undefined, { shallow: true })
              }}
              onDeleteJob={deleteJob}
              onDuplicateJob={duplicateJob}
              onViewScorecard={(job) => {
                setSelectedJob(job)
                setCurrentView('scorecard')
                router.push(`/company/${companyId}?job=${job.id}`, undefined, { shallow: true })
              }}
            />
          </div>
        </>
      )}

      {currentView === 'create-job' && (
        <JobForm
          job={selectedJob}
          company={company} // Pass company data to form
          onSave={selectedJob ? 
            (data) => {
              updateJob(selectedJob.id, data)
              setCurrentView('jobs')
              // Small delay to ensure localStorage is updated before reload
              setTimeout(() => loadJobs(), 100)
              router.push(`/company/${companyId}`, undefined, { shallow: true })
            } : 
            (data) => {
              addJob(data)
              // Small delay to ensure localStorage is updated before reload
              setTimeout(() => loadJobs(), 100)
              router.push(`/company/${companyId}`, undefined, { shallow: true })
            }
          }
          onCancel={() => {
            setSelectedJob(null)
            setCurrentView('jobs')
            // Small delay to ensure localStorage is updated before reload
            setTimeout(() => loadJobs(), 100)
            router.push(`/company/${companyId}`, undefined, { shallow: true })
          }}
        />
      )}

      {currentView === 'scorecard' && selectedJob && (() => {
        const currentJob = jobs.find(job => job.id === selectedJob.id)
        if (!currentJob) return null
        
        return (
          <ScorecardView
            job={currentJob}
            company={company} // Pass company data to scorecard
            onAddCandidate={(candidateData) => addCandidate(selectedJob.id, candidateData)}
            onUpdateScore={(candidateId, competencyId, score) =>
              updateCandidateScore(selectedJob.id, candidateId, competencyId, score)
            }
            onUpdateCandidate={(candidateData) => updateCandidate(selectedJob.id, candidateData)}
            onBack={() => {
              setSelectedJob(null)
              setCurrentView('jobs')
              router.push(`/company/${companyId}`, undefined, { shallow: true })
            }}
            onUpdateJob={(data) => updateJob(selectedJob.id, data)}
            reloadData={reloadData}
          />
        )
      })()}
      
      <DebugPanel />
    </div>
  )
} 