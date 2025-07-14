'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  Eye, 
  Star, 
  Calendar,
  Briefcase,
  ArrowUpRight,
  User,
  Brain,
  Clock,
  Building2
} from 'lucide-react'

export default function CandidatesPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [currentCompany, setCurrentCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showNewOnly, setShowNewOnly] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        // Load current company
        const savedCompanies = localStorage.getItem('scorecard-companies')
        const savedCurrentCompany = localStorage.getItem('current-company-id')
        
        if (savedCompanies && savedCurrentCompany) {
          const companies = JSON.parse(savedCompanies)
          const currentComp = companies.find(c => c.id === savedCurrentCompany)
          setCurrentCompany(currentComp)
          
          // Load jobs for current company
          const savedJobs = localStorage.getItem('jobScorecards')
          if (savedJobs) {
            const allJobs = JSON.parse(savedJobs)
            const companyJobs = allJobs.filter(job => job.companyId === savedCurrentCompany)
            setJobs(companyJobs)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Get all candidates across all jobs
  const getAllCandidates = () => {
    const allCandidates = []
    
    jobs.forEach(job => {
      if (job.candidates) {
        job.candidates.forEach(candidate => {
          allCandidates.push({
            ...candidate,
            jobId: job.id,
            jobTitle: job.title,
            jobCompany: job.company || currentCompany?.name || 'Unknown'
          })
        })
      }
    })
    
    return allCandidates
  }

  // Filter and sort candidates
  const getFilteredCandidates = () => {
    let candidates = getAllCandidates()
    
    // Filter by search term
    if (searchTerm) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by job
    if (selectedJob !== 'all') {
      candidates = candidates.filter(candidate => candidate.jobId === selectedJob)
    }
    
    // Filter by new only
    if (showNewOnly) {
      candidates = candidates.filter(candidate => candidate.isNew === true)
    }
    
    // Sort candidates
    candidates.sort((a, b) => {
      let valueA, valueB
      
      switch(sortBy) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'job':
          valueA = a.jobTitle.toLowerCase()
          valueB = b.jobTitle.toLowerCase()
          break
        case 'score':
          valueA = calculateCandidateScore(a)
          valueB = calculateCandidateScore(b)
          break
        case 'aiScore':
          valueA = calculateAIScore(a)
          valueB = calculateAIScore(b)
          break
        case 'date':
          valueA = new Date(a.dateAdded || 0)
          valueB = new Date(b.dateAdded || 0)
          break
        default:
          return 0
      }
      
      if (sortBy === 'name' || sortBy === 'job') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      } else {
        return sortOrder === 'asc' 
          ? valueA - valueB
          : valueB - valueA
      }
    })
    
    return candidates
  }

  // Calculate candidate score
  const calculateCandidateScore = (candidate) => {
    const scores = Object.values(candidate.scores || {}).filter(score => score !== null && score !== '')
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, score) => sum + parseInt(score), 0) / scores.length)
  }

  // Calculate AI score
  const calculateAIScore = (candidate) => {
    const scores = Object.values(candidate.aiScores || {}).filter(score => score !== null && score !== '')
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, score) => sum + parseInt(score), 0) / scores.length)
  }

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-50'
    if (score >= 3) return 'text-yellow-600 bg-yellow-50'
    if (score >= 2) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  // Get candidate status
  const getCandidateStatus = (candidate) => {
    if (candidate.isNew) return { label: 'New', color: 'bg-red-100 text-red-800' }
    if (candidate.interviewCompletedAt) return { label: 'Interviewed', color: 'bg-blue-100 text-blue-800' }
    if (candidate.scores && Object.keys(candidate.scores).length > 0) return { label: 'Scored', color: 'bg-green-100 text-green-800' }
    return { label: 'Added', color: 'bg-gray-100 text-gray-800' }
  }

  // Navigate to candidate detail
  const viewCandidate = (candidate) => {
    router.push(`/candidate/${candidate.jobId}/${candidate.id}`)
  }

  // Get unique jobs for filter
  const getUniqueJobs = () => {
    return jobs.filter(job => job.candidates && job.candidates.length > 0)
  }

  const filteredCandidates = getFilteredCandidates()
  const newCandidatesCount = getAllCandidates().filter(c => c.isNew === true).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
                <p className="text-lg text-gray-600">
                  {currentCompany?.name || 'All Companies'} • {filteredCandidates.length} candidates
                  {newCandidatesCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {newCandidatesCount} new
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Job Filter */}
            <div className="relative">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Jobs</option>
                {getUniqueJobs().map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setSortBy(sort)
                  setSortOrder(order)
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="job-asc">Job A-Z</option>
                <option value="job-desc">Job Z-A</option>
                <option value="score-desc">Score High-Low</option>
                <option value="score-asc">Score Low-High</option>
                <option value="aiScore-desc">AI Score High-Low</option>
                <option value="aiScore-asc">AI Score Low-High</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* New Only Toggle */}
            <button
              onClick={() => setShowNewOnly(!showNewOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                showNewOnly 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              New Only
            </button>
          </div>
        </div>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedJob !== 'all' || showNewOnly
                ? 'Try adjusting your filters'
                : 'Start by adding jobs and candidates'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map(candidate => {
              const status = getCandidateStatus(candidate)
              const manualScore = calculateCandidateScore(candidate)
              const aiScore = calculateAIScore(candidate)
              
              return (
                <div
                  key={`${candidate.jobId}-${candidate.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                  onClick={() => viewCandidate(candidate)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        {candidate.email && (
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                        )}
                      </div>
                    </div>
                    
                    {candidate.isNew && (
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{candidate.jobTitle}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    {candidate.dateAdded && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(candidate.dateAdded).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Scores */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Manual Score */}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(manualScore)}`}>
                          {manualScore > 0 ? manualScore : '—'}
                        </span>
                      </div>
                      
                      {/* AI Score */}
                      <div className="flex items-center gap-1">
                        <Brain className="h-4 w-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(aiScore)}`}>
                          {aiScore > 0 ? aiScore : '—'}
                        </span>
                      </div>
                    </div>
                    
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 