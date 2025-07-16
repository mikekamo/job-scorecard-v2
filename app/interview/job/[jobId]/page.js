'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Video, User, Mail, Play, CheckCircle, Clock, Shield } from 'lucide-react'

export default function GenericInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [company, setCompany] = useState(null)
  const [candidateData, setCandidateData] = useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadJobData = async () => {
      const jobId = params.jobId;
      let foundJob = null;

      console.log('Attempting to load job with ID:', jobId);

      try {
        // First check localStorage
        const savedJobs = localStorage.getItem('jobScorecards');
        console.log('savedJobs from jobScorecards:', savedJobs);
        if (savedJobs) {
          const jobs = JSON.parse(savedJobs);
          console.log('Parsed jobs from jobScorecards:', jobs);
          foundJob = jobs.find(j => j.id === jobId);
          console.log('Found in jobScorecards:', foundJob);
        }

        // Draft functionality removed - jobs are only stored in jobScorecards now

        // If still not found, check server storage
        if (!foundJob) {
          console.log('🔍 Job not found in localStorage, checking server storage...');
          try {
            const response = await fetch('/api/data');
            if (response.ok) {
              const serverJobs = await response.json();
              console.log('🔍 Server returned', serverJobs.length, 'jobs');
              foundJob = serverJobs.find(j => j.id === jobId);
              console.log('🔍 Found in server storage:', foundJob ? foundJob.title : 'NOT FOUND');
              
              // If found on server, sync to localStorage for future use
              if (foundJob) {
                console.log('🔄 Syncing server data to localStorage...');
                const existingJobs = JSON.parse(localStorage.getItem('jobScorecards') || '[]');
                const updatedJobs = [...existingJobs, foundJob];
                localStorage.setItem('jobScorecards', JSON.stringify(updatedJobs));
                console.log('✅ Server data synced to localStorage');
              }
            } else {
              console.error('❌ Failed to fetch server data:', response.status);
            }
          } catch (serverError) {
            console.error('❌ Error fetching from server:', serverError);
          }
        }

        if (foundJob) {
          console.log('Setting job:', foundJob);
          setJob(foundJob);
          
          // Load company information
          const savedCompanies = localStorage.getItem('scorecard-companies');
          if (savedCompanies) {
            const companies = JSON.parse(savedCompanies);
            const foundCompany = companies.find(c => c.id === foundJob.companyId);
            if (foundCompany) {
              setCompany(foundCompany);
            }
          }
          
          // Check if job has interview questions
          if (!foundJob.interviewQuestions || foundJob.interviewQuestions.length === 0) {
            alert('This interview link is not configured with questions. Please contact the hiring team.');
            return;
          }
        } else {
          console.error('❌ Job not found in localStorage or server storage');
          alert('Interview not found. Please check the link or contact the hiring team.');
        }
      } catch (error) {
        console.error('Error loading job:', error);
        alert('Error loading interview data. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobData();
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

      // Add candidate to job (only using jobScorecards storage now)
      const storageKey = 'jobScorecards'
      
      let jobs = []
      const savedJobs = localStorage.getItem(storageKey)
      
      if (savedJobs) {
        jobs = JSON.parse(savedJobs)
      } else {
        // If localStorage is empty, fetch from server
        try {
          const response = await fetch('/api/data')
          if (response.ok) {
            jobs = await response.json()
            // Save to localStorage for future use
            localStorage.setItem(storageKey, JSON.stringify(jobs))
          }
        } catch (error) {
          console.error('Error fetching server data:', error)
        }
      }
      
      console.log('🔍 Total jobs before adding candidate:', jobs.length)
      
      const jobIndex = jobs.findIndex(j => j.id === job.id)
      console.log('🔍 Job found at index:', jobIndex)
      console.log('🔍 Looking for job ID:', job.id)
      console.log('🔍 Available job IDs:', jobs.map(j => j.id))
      
      if (jobIndex !== -1) {
        if (!jobs[jobIndex].candidates) {
          jobs[jobIndex].candidates = []
        }
        jobs[jobIndex].candidates.push(newCandidate)
        console.log('🔍 Added candidate to job, total candidates now:', jobs[jobIndex].candidates.length)
        console.log('🔍 Candidate saved with ID:', newCandidate.id)
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(jobs))
        console.log('🔍 Saved to localStorage key:', storageKey)
        
        // Also save to server
        try {
          const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobs)
          })
          if (response.ok) {
            console.log('✅ Data synced to server successfully')
          } else {
            console.warn('⚠️ Server sync failed, but localStorage saved successfully')
          }
        } catch (syncError) {
          console.warn('⚠️ Server sync failed, but localStorage saved successfully:', syncError)
        }

        // Generate interview ID and redirect to normal interview flow
        const interviewId = `${job.id}-${newCandidate.id}-${Date.now()}`
        console.log('🔍 Generated interview ID:', interviewId)
        console.log('🔍 Redirecting to interview...')
        
        // Add a small delay to ensure data is properly saved
        setTimeout(() => {
          router.push(`/interview/${interviewId}`)
        }, 100)
      } else {
        console.error('❌ Job not found in jobs array')
        alert('Unable to find the job. Please try again.')
      }
    } catch (error) {
      console.error('Error creating candidate:', error)
      alert('There was an error starting your interview. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Interview...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Not Found</h2>
          <p className="text-gray-600 mb-4">The interview link appears to be invalid or expired.</p>
          <p className="text-gray-600">Please check the link or contact the hiring team.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Welcome to {company?.name || 'Our Company'}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-3">
            {job.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-600 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>{job.department}</span>
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Video Interview</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Thank you for your interest in this position. We're excited to learn more about you through this video interview.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Ready to Start</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Working camera & microphone
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Quiet, well-lit space
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Allow permissions when prompted
                </li>
              </ul>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Interview Format</h3>
              </div>
              <p className="text-sm text-gray-600">
                You'll be presented with {job.interviewQuestions?.length || 5} questions, each with a specific time limit for your response.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Privacy</h3>
              </div>
              <p className="text-sm text-gray-600">
                This interview will be recorded for evaluation purposes only.
              </p>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Let's Get Started
              </h3>
              <p className="text-gray-600 text-center mb-8">
                Please provide your details below to begin the interview
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={candidateData.name}
                      onChange={(e) => setCandidateData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={candidateData.email}
                      onChange={(e) => setCandidateData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="your.email@example.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Optional - for follow-up communication</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !candidateData.name.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting Interview...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Video Interview
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 mb-2">
            Having technical issues? Please contact {company?.name || 'the hiring team'} for assistance.
          </p>
        </div>
      </div>
    </div>
  )
} 