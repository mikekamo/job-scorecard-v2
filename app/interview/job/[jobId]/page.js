'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function GenericInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [candidateData, setCandidateData] = useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load job data
    const jobId = params.jobId
    const savedJobs = localStorage.getItem('jobScorecards')
    if (savedJobs) {
      const jobs = JSON.parse(savedJobs)
      const foundJob = jobs.find(j => j.id === jobId)
      if (foundJob) {
        setJob(foundJob)
        // Check if job has interview questions
        if (!foundJob.interviewQuestions || foundJob.interviewQuestions.length === 0) {
          alert('This interview link is not configured with questions. Please contact the hiring team.')
          return
        }
      } else {
        alert('Interview not found. Please check the link or contact the hiring team.')
      }
    }
  }, [params.jobId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!candidateData.name.trim()) {
      alert('Please enter your name.')
      return
    }

    setIsSubmitting(true)

    try {
      // Create new candidate
      const newCandidate = {
        id: Date.now().toString(),
        name: candidateData.name.trim(),
        email: candidateData.email.trim(),
        notes: 'Added via generic interview link',
        transcript: '',
        scores: {},
        dateAdded: new Date().toISOString()
      }
      
      console.log('🔍 Creating new candidate:', newCandidate)

      // Add candidate to job
      const savedJobs = localStorage.getItem('jobScorecards')
      if (savedJobs) {
        const jobs = JSON.parse(savedJobs)
        const jobIndex = jobs.findIndex(j => j.id === job.id)
        if (jobIndex !== -1) {
          if (!jobs[jobIndex].candidates) {
            jobs[jobIndex].candidates = []
          }
          jobs[jobIndex].candidates.push(newCandidate)
          console.log('🔍 Added candidate to job, total candidates now:', jobs[jobIndex].candidates.length)
          
          localStorage.setItem('jobScorecards', JSON.stringify(jobs))
          console.log('🔍 Saved to localStorage')

          // Generate interview ID and redirect to normal interview flow
          const interviewId = `${job.id}-${newCandidate.id}-${Date.now()}`
          console.log('🔍 Generated interview ID:', interviewId)
          console.log('🔍 Redirecting to interview...')
          
          // Add a small delay to ensure localStorage is properly saved
          setTimeout(() => {
            router.push(`/interview/${interviewId}`)
          }, 100)
        }
      }
    } catch (error) {
      console.error('Error creating candidate:', error)
      alert('There was an error starting your interview. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Interview...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-2xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🎥</div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Video Interview</h1>
          <h2 className="text-2xl font-semibold text-blue-800 mb-2">{job.title}</h2>
          <p className="text-lg text-blue-700 mb-6">{job.department}</p>
        </div>

        {/* Candidate Info Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Let's get started! Please provide your details:
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={candidateData.name}
                onChange={(e) => setCandidateData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={candidateData.email}
                onChange={(e) => setCandidateData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">Optional - for follow-up communication</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Before you start:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure you have a working camera and microphone</li>
                <li>• Find a quiet, well-lit space</li>
                <li>• Allow camera/microphone permissions when prompted</li>
                <li>• Each question will have a time limit for your response</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !candidateData.name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Starting Interview...
                </>
              ) : (
                <>
                  <span>🎥</span>
                  Start Video Interview
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-blue-600">
            Having technical issues? Please contact the hiring team.
          </p>
        </div>
      </div>
    </div>
  )
} 