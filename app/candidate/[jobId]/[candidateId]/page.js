'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Plus, Brain, Save, Trash2, Video, MessageSquare, User, Check, Upload, X } from 'lucide-react'
import { useJobStorage } from '../../../hooks/useJobStorage'

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { jobs, updateJob } = useJobStorage()
  
  const [job, setJob] = useState(null)
  const [candidate, setCandidate] = useState(null)
  const [selectedInterviewIndex, setSelectedInterviewIndex] = useState(0)
  const [showAddInterviewModal, setShowAddInterviewModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showExplanationModal, setShowExplanationModal] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  const [showNoContentModal, setShowNoContentModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [newInterviewContent, setNewInterviewContent] = useState('')
  const [newInterviewType, setNewInterviewType] = useState('text')
  const [tempTranscript, setTempTranscript] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadContent, setUploadContent] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Global escape key handler
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close modals in order of priority
        if (showExplanationModal) {
          setShowExplanationModal(null)
        } else if (showVideoModal) {
          setShowVideoModal(false)
        } else if (showConfirmModal) {
          setShowConfirmModal(null)
        } else if (showAddInterviewModal) {
          setShowAddInterviewModal(false)
        } else if (showUploadModal) {
          setShowUploadModal(false)
          setUploadContent('')
          setIsDragOver(false)
        }
      }
    }

    // Add event listener when any modal is open
    if (showExplanationModal || showVideoModal || showConfirmModal || showAddInterviewModal || showUploadModal) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showExplanationModal, showVideoModal, showConfirmModal, showAddInterviewModal, showUploadModal])

  // Load job and candidate data
  useEffect(() => {
    const foundJob = jobs.find(j => j.id === params.jobId)
    if (foundJob) {
      setJob(foundJob)
      const foundCandidate = foundJob.candidates?.find(c => c.id === params.candidateId)
      if (foundCandidate) {
        // Migrate old format to new numbered interview format
        const migratedCandidate = migrateToInterviewFormat(foundCandidate)
        let finalCandidate = migratedCandidate !== foundCandidate ? migratedCandidate : foundCandidate
        
        // Mark candidate as viewed if not already
        if (finalCandidate.isNew !== false) {
          finalCandidate = {
            ...finalCandidate,
            isNew: false,
            lastViewedAt: new Date().toISOString()
          }
          
          // Update the job with the viewed candidate
          const updatedJob = {
            ...foundJob,
            candidates: foundJob.candidates.map(c => 
              c.id === foundCandidate.id ? finalCandidate : c
            )
          }
          updateJob(updatedJob)
          setJob(updatedJob)
        }
        
        setCandidate(finalCandidate)
      }
    }
  }, [jobs, params.jobId, params.candidateId])

  // Migration function to convert old format to numbered interviews
  const migrateToInterviewFormat = (candidate) => {
    let interviews = []
    
    // If already has interviews array, use it as starting point
    if (candidate.interviews && Array.isArray(candidate.interviews)) {
      interviews = [...candidate.interviews]
    } else {
      // Create new interviews array from old data
      
      // Check if there's a video interview
      if (candidate.videoResponses && candidate.videoResponses.length > 0) {
        interviews.push({
          id: '1',
          title: 'Interview 1',
          type: 'video',
          content: candidate.transcript || candidate.videoResponses.map((response, index) => 
            `Question ${index + 1}: ${response.question}\n[Video Response - Transcript needed]\n`
          ).join('\n'),
          transcript: candidate.transcript || '', // Include legacy transcript
          videoResponses: candidate.videoResponses,
          manualScores: candidate.scores || {},
          aiScores: candidate.aiScores || {},
          explanations: candidate.explanations || {},
          createdAt: new Date().toISOString()
        })
      }
      
      // Check if there's old transcript data
      if (candidate.transcript && candidate.transcript.trim()) {
        const interviewNumber = interviews.length + 1
        interviews.push({
          id: interviewNumber.toString(),
          title: `Interview ${interviewNumber}`,
          type: 'text',
          content: candidate.transcript,
          transcript: candidate.transcript, // Include transcript field
          manualScores: {},
          aiScores: candidate.aiScores || {},
          explanations: candidate.explanations || {},
          createdAt: new Date().toISOString()
        })
      }
    }

    // ALWAYS ensure there's at least one interview for scoring (even for previously migrated candidates)
    if (interviews.length === 0) {
      interviews.push({
        id: '1',
        title: 'Interview 1',
        type: 'text',
        content: '',
        transcript: '', // Include transcript field
        manualScores: candidate.scores || {},
        aiScores: candidate.aiScores || {},
        explanations: candidate.explanations || {},
        createdAt: new Date().toISOString()
      })
    }

    return {
      ...candidate,
      interviews,
      // Keep old fields for backward compatibility
      scores: candidate.scores || {},
      transcript: candidate.transcript || '',
      aiScores: candidate.aiScores || {},
      explanations: candidate.explanations || {}
    }
  }

  // Update candidate data
  const updateCandidateData = (updatedCandidate) => {
    if (!job || !job.candidates) return
    
    const updatedJob = {
      ...job,
      candidates: job.candidates.map(c => 
        c.id === candidate.id ? updatedCandidate : c
      )
    }
    
    updateJob(updatedJob)
    setJob(updatedJob)
    setCandidate(updatedCandidate)
  }

  // Get current interview
  const getCurrentInterview = () => {
    if (!candidate?.interviews || selectedInterviewIndex >= candidate.interviews.length) {
      return null
    }
    return candidate.interviews[selectedInterviewIndex]
  }

  // Check if current interview has content that can be analyzed
  const hasAnalyzableContent = () => {
    const currentInterview = getCurrentInterview()
    if (!currentInterview) return false
    
    // For video interviews: check if there are video responses
    const isVideoInterview = currentInterview.type === 'video' && currentInterview.videoResponses && currentInterview.videoResponses.length > 0
    
    // For text interviews: check if there's content
    const isTextInterview = currentInterview.content && currentInterview.content.trim()
    
    return isVideoInterview || isTextInterview
  }

  // Handle transcript upload
  const handleUploadTranscript = () => {
    setUploadContent('')
    setIsDragOver(false)
    setShowUploadModal(true)
  }

  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const textFile = files.find(file => file.type === 'text/plain' || file.name.endsWith('.txt'))
    
    if (textFile) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadContent(event.target.result)
      }
      reader.readAsText(textFile)
    } else {
      alert('Please upload a text file (.txt)')
    }
  }

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  // Save uploaded transcript
  const handleSaveTranscript = () => {
    if (!uploadContent.trim()) return
    
    const currentInterview = getCurrentInterview()
    if (!currentInterview) return
    
    const updatedInterview = {
      ...currentInterview,
      content: uploadContent,
      transcript: uploadContent
    }
    
    const updatedCandidate = {
      ...candidate,
      interviews: candidate.interviews.map((interview, index) => 
        index === selectedInterviewIndex ? updatedInterview : interview
      )
    }
    
    updateCandidateData(updatedCandidate)
    setShowUploadModal(false)
    setUploadContent('')
    setHasUnsavedChanges(true)
  }

  // Handle manual score changes
  const handleScoreChange = (competencyId, score) => {
    const currentInterview = getCurrentInterview()
    if (!currentInterview) return
    
    const updatedInterview = {
      ...currentInterview,
      manualScores: {
        ...currentInterview.manualScores,
        [competencyId]: score
      }
    }
    
    const updatedCandidate = {
      ...candidate,
      interviews: candidate.interviews.map((interview, index) => 
        index === selectedInterviewIndex ? updatedInterview : interview
      ),
      // Update legacy scores field for backward compatibility
      scores: selectedInterviewIndex === 0 ? updatedInterview.manualScores : candidate.scores
    }
    
    updateCandidateData(updatedCandidate)
    setHasUnsavedChanges(true)
  }

  // Handle save changes
  const handleSaveChanges = () => {
    // The data is already saved in updateCandidateData, so we just need to clear the unsaved flag
    setHasUnsavedChanges(false)
    
    // Show visual success feedback
    setJustSaved(true)
    setTimeout(() => {
      setJustSaved(false)
    }, 2000) // Show "Saved" for 2 seconds
  }

  // Add new interview
  const handleAddInterview = () => {
    if (!newInterviewContent.trim()) return
    
    const interviews = candidate.interviews || []
    const newInterviewNumber = interviews.length + 1
    
    const newInterview = {
      id: newInterviewNumber.toString(),
      title: `Interview ${newInterviewNumber}`,
      type: newInterviewType,
      content: newInterviewContent,
      transcript: newInterviewContent, // Include transcript field (same as content for text interviews)
      manualScores: {},
      aiScores: {},
      explanations: {},
      createdAt: new Date().toISOString()
    }
    
    const updatedCandidate = {
      ...candidate,
      interviews: [...interviews, newInterview]
    }
    
    updateCandidateData(updatedCandidate)
    setSelectedInterviewIndex(interviews.length) // Select the new interview
    setShowAddInterviewModal(false)
    setNewInterviewContent('')
    setNewInterviewType('text')
  }

  // Show confirmation modal and return a Promise
  const showConfirmationModal = (config = {}) => {
    const defaultConfig = {
      title: 'Confirm Transcription',
      message: 'Are you sure you want to transcribe & analyze again? This will overwrite your previous transcript and AI analysis.',
      confirmText: 'Yes, Overwrite',
      cancelText: 'Cancel',
      type: 'transcription' // 'transcription' or 'delete'
    }
    
    const modalConfig = { ...defaultConfig, ...config }
    
    return new Promise((resolve) => {
      setShowConfirmModal(modalConfig)
      // Store the resolve function so we can call it from the modal buttons
      window.confirmModalResolve = resolve
    })
  }

  // Run AI analysis for current interview
  const runAIAnalysis = async () => {
    const currentInterview = getCurrentInterview()
    if (!currentInterview) {
      alert('No interview selected')
      return
    }
    
    // Check if it's a video interview or text interview
    const isVideoInterview = currentInterview.type === 'video' && currentInterview.videoResponses && currentInterview.videoResponses.length > 0
    const isTextInterview = currentInterview.content && currentInterview.content.trim()
    
    if (!isVideoInterview && !isTextInterview) {
      setShowNoContentModal(true)
      setLinkCopied(false) // Reset link copied state
      return
    }
    
    // Check if there's already a transcript and confirm before overwriting
    if (currentInterview.transcript && currentInterview.transcript.trim()) {
      const shouldContinue = await showConfirmationModal()
      if (!shouldContinue) {
        return
      }
    }
    
    setIsAnalyzing(true)
    
    try {
      // Prepare the request body based on interview type
      const requestBody = {
        competencies: job.competencies.map(comp => comp.name)
      }
      
      if (isVideoInterview) {
        console.log('🎥 Starting AI analysis with video transcription...')
        requestBody.videoResponses = currentInterview.videoResponses
        // For video interviews, we can provide placeholder transcript or empty string
        requestBody.transcript = currentInterview.content || ''
      } else {
        console.log('📄 Starting AI analysis with text transcript...')
        requestBody.transcript = currentInterview.content
      }
      
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze transcript')
      }
      
      const analysisResult = await response.json()
      
      // Convert competency names back to IDs for storage
      const aiScores = {}
      const explanations = {}
      
      job.competencies.forEach(comp => {
        if (analysisResult.scores && analysisResult.scores[comp.name]) {
          aiScores[comp.id] = analysisResult.scores[comp.name]
        }
        if (analysisResult.explanations && analysisResult.explanations[comp.name]) {
          explanations[comp.id] = analysisResult.explanations[comp.name]
        }
      })
      
      // Update the current interview with AI results and transcript
      const updatedInterview = {
        ...currentInterview,
        aiScores,
        explanations,
        transcript: analysisResult.transcript || currentInterview.transcript, // Store transcript from AI analysis
        content: analysisResult.transcript || currentInterview.content // Update content for display
      }
      
      const updatedCandidate = {
        ...candidate,
        interviews: candidate.interviews.map((interview, index) => 
          index === selectedInterviewIndex ? updatedInterview : interview
        ),
        // Update legacy fields for backward compatibility
        aiScores: selectedInterviewIndex === 0 ? updatedInterview.aiScores : candidate.aiScores,
        explanations: selectedInterviewIndex === 0 ? updatedInterview.explanations : candidate.explanations
      }
      
      updateCandidateData(updatedCandidate)
      
    } catch (error) {
      console.error('Error running AI analysis:', error)
      
      // Show more specific error messages based on interview type
      if (isVideoInterview) {
        alert('Failed to transcribe and analyze videos. Please ensure your videos are accessible and try again.')
      } else {
        alert('Failed to analyze transcript. Please try again.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate interview link
  const handleGenerateInterviewLink = () => {
    const interviewId = `${params.jobId}-${params.candidateId}`
    const interviewUrl = `${window.location.origin}/interview/${interviewId}`
    
    navigator.clipboard.writeText(interviewUrl).then(() => {
      // Show a nice success message
      const originalText = document.querySelector('[data-interview-link-btn]')?.textContent
      const btn = document.querySelector('[data-interview-link-btn]')
      if (btn) {
        btn.textContent = '✓ Link Copied!'
        btn.classList.add('bg-green-600', 'hover:bg-green-700')
        btn.classList.remove('bg-purple-600', 'hover:bg-purple-700')
        setTimeout(() => {
          btn.textContent = originalText
          btn.classList.remove('bg-green-600', 'hover:bg-green-700')
          btn.classList.add('bg-purple-600', 'hover:bg-purple-700')
        }, 2000)
      }
    }).catch(() => {
      // Fallback if clipboard doesn't work
      prompt(`🎥 Interview link for ${candidate.name}:\n\nCopy this link and send it to them:`, interviewUrl)
    })
  }

  // Delete candidate
  const handleDeleteCandidate = async () => {
    const shouldDelete = await showConfirmationModal({
      title: 'Delete Candidate',
      message: `Are you sure you want to delete ${candidate.name}? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'delete'
    })
    
    if (shouldDelete) {
      const updatedJob = {
        ...job,
        candidates: job.candidates.filter(c => c.id !== candidate.id)
      }
      updateJob(updatedJob)
      router.push(`/?job=${job.id}`)
    }
  }

  if (!job || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    )
  }

  const currentInterview = getCurrentInterview()
  const currentManualScores = currentInterview?.manualScores || {}
  const currentAIScores = currentInterview?.aiScores || {}
  const currentExplanations = currentInterview?.explanations || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                <p className="text-gray-600">{job.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {job.interviewQuestions && job.interviewQuestions.length > 0 && (
                <button
                  onClick={handleGenerateInterviewLink}
                  data-interview-link-btn
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Video size={16} />
                  Interview Link
                </button>
              )}
              
              <button
                onClick={() => setShowAddInterviewModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Interview
              </button>
              
              <button
                onClick={handleDeleteCandidate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Interview Tabs */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-t-lg p-1 gap-1">
            {candidate.interviews?.map((interview, index) => (
              <button
                key={interview.id}
                onClick={() => setSelectedInterviewIndex(index)}
                className={`px-5 py-3 font-medium transition-all duration-200 rounded-lg relative flex items-center gap-2 ${
                  selectedInterviewIndex === index
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{interview.title}</span>
                {interview.type === 'video' && (
                  <Video size={14} className={`${
                    selectedInterviewIndex === index ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                )}
              </button>
            ))}
          </div>
          
          {/* Interview Actions */}
          {currentInterview && (
            <div className="bg-white px-6 py-4 rounded-b-lg border-t">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handleUploadTranscript}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                  
                  <div 
                    className="relative"
                    onMouseEnter={() => {
                      if (!hasAnalyzableContent()) {
                        setShowTooltip(true)
                      }
                    }}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <button
                      onClick={runAIAnalysis}
                      disabled={isAnalyzing || !hasAnalyzableContent()}
                      className={`px-4 py-2 rounded-lg text-white font-medium ${
                        isAnalyzing || !hasAnalyzableContent()
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          {currentInterview?.type === 'video' ? 'Transcribing & Analyzing...' : 'Analyzing...'}
                        </>
                      ) : (
                        <>
                          <Brain size={16} className="inline mr-2" />
                          {currentInterview?.type === 'video' ? 'Transcribe & Analyze Videos' : 'Run AI Analysis'}
                        </>
                      )}
                    </button>
                    
                    {/* Custom Tooltip */}
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-10">
                        Upload transcript to enable AI analysis
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                  
                  {currentInterview.type === 'video' && candidate.videoResponses && (
                    <button
                      onClick={() => {
                        setCurrentVideoIndex(0)
                        setShowVideoModal(true)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Play size={16} />
                      View Videos
                    </button>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  {currentInterview.type === 'video' ? (
                    <div>
                      <span>Video Interview</span>
                      {currentInterview.createdAt && (
                        <span className="ml-2">
                          • {new Date(currentInterview.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        ✨ AI analysis will automatically transcribe videos using OpenAI Whisper
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span>Text Interview</span>
                      {currentInterview.createdAt && (
                        <span className="ml-2">
                          • {new Date(currentInterview.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Competency Scoring Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/50 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Candidate Evaluation</h2>
              {currentInterview && (
                <div className="text-sm text-gray-600">
                  Showing scores for: <span className="font-semibold">{currentInterview.title}</span>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium">Competency</th>
                    <th className="px-4 py-4 text-center text-sm font-medium">Your Score</th>
                    <th className="px-4 py-4 text-center text-sm font-medium">AI Score</th>
                    <th className="px-4 py-4 text-center text-sm font-medium">AI Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {job.competencies.map((competency, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="font-medium">{competency.name}</div>
                        {competency.description && (
                          <div className="text-sm text-gray-600 mt-1">{competency.description}</div>
                        )}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        <select 
                          value={currentManualScores[competency.id] || ''}
                          onChange={(e) => handleScoreChange(competency.id, e.target.value)}
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-</option>
                          {[1, 2, 3, 4, 5].map(score => (
                            <option key={score} value={score}>{score}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          currentAIScores[competency.id] 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'text-gray-400'
                        }`}>
                          {currentAIScores[competency.id] || '-'}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        {currentExplanations[competency.id] ? (
                          <button
                            onClick={() => setShowExplanationModal({
                              competency: competency.name,
                              explanation: currentExplanations[competency.id]
                            })}
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            View Analysis
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No analysis</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Total Scores Summary */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Total Scores</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Your Score</h4>
                  {(() => {
                    const scores = Object.values(currentManualScores).filter(score => score && score !== '');
                    const total = scores.reduce((sum, score) => sum + parseInt(score), 0);
                    const maxPossible = job.competencies.length * 5;
                    const percentage = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
                    
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-800">{total}/{maxPossible}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          percentage >= 80 ? 'bg-green-100 text-green-800' :
                          percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          percentage === 0 ? 'bg-gray-100 text-gray-500' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">AI Score</h4>
                  {(() => {
                    const scores = Object.values(currentAIScores).filter(score => score && score !== '');
                    const total = scores.reduce((sum, score) => sum + parseInt(score), 0);
                    const maxPossible = job.competencies.length * 5;
                    const percentage = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
                    
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-800">{total}/{maxPossible}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          percentage >= 80 ? 'bg-green-100 text-green-800' :
                          percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          percentage === 0 ? 'bg-gray-100 text-gray-500' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="px-6 pb-6">
              <div className="flex justify-between items-center pt-4 border-t">
                {hasUnsavedChanges ? (
                  <div className="text-sm text-amber-600">
                    You have unsaved changes
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    All changes saved
                  </div>
                )}
                <button
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges && !justSaved}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    justSaved 
                      ? 'bg-green-600 text-white' 
                      : hasUnsavedChanges 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {justSaved ? (
                    <>
                      <Check size={16} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Notes */}
        {candidate.notes && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-600" />
                Notes
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800 leading-relaxed">
                  {candidate.notes}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interview Content */}
        {currentInterview && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              {currentInterview.type === 'video' && currentInterview.videoResponses ? (
                <div className="space-y-4">
                  {/* Transcript Display */}
                  {currentInterview.transcript ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-yellow-800">Interview Transcript</h4>
                      <div className="text-sm text-yellow-700 bg-white p-3 rounded border max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono">
                          {currentInterview.transcript}
                        </pre>
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">
                        * This transcript was automatically generated from the video responses
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-600">
                        Video interview completed - transcript will appear here after AI analysis
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {currentInterview.content || 'No content available'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Interview Modal */}
      {showAddInterviewModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddInterviewModal(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Interview</h2>
                <button
                  onClick={() => setShowAddInterviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Interview Type</label>
                  <select
                    value={newInterviewType}
                    onChange={(e) => setNewInterviewType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text/Transcript</option>
                    <option value="video">Video Upload (Coming Soon)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Interview Content</label>
                  {newInterviewType === 'video' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500">Video upload functionality coming soon</p>
                      <p className="text-sm text-gray-400">For now, please use text/transcript option</p>
                    </div>
                  ) : (
                    <textarea
                      value={newInterviewContent}
                      onChange={(e) => setNewInterviewContent(e.target.value)}
                      placeholder="Enter interview transcript or notes..."
                      className="w-full px-3 py-2 border rounded-lg h-32 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddInterview}
                  disabled={!newInterviewContent.trim() || newInterviewType === 'video'}
                  className={`px-4 py-2 rounded-lg ${
                    !newInterviewContent.trim() || newInterviewType === 'video'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Add Interview
                </button>
                <button
                  onClick={() => setShowAddInterviewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && candidate.videoResponses && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVideoModal(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Video Interview Responses</h2>
                  <p className="text-gray-600">{candidate.name} • {job.title}</p>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(90vh-80px)]">
              {/* Video Player Section (Left) */}
              <div className="flex-1 p-6">
                <div className="h-full flex flex-col">
                  {/* Current Question Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Question {currentVideoIndex + 1} of {candidate.videoResponses.length}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {candidate.videoResponses[currentVideoIndex]?.question}
                    </h3>
                  </div>

                  {/* Video Player */}
                  <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
                    {candidate.videoResponses[currentVideoIndex]?.cloudUrl ? (
                      <video 
                        key={currentVideoIndex} // Force re-render when question changes
                        controls 
                        autoPlay
                        className="w-full h-full object-cover rounded-lg"
                        src={candidate.videoResponses[currentVideoIndex].cloudUrl}
                        onError={(e) => {
                          console.error('Video load error:', e.target.error);
                        }}
                        onLoadStart={() => console.log('Video loading started for question:', currentVideoIndex + 1)}
                        onLoadedData={(e) => {
                          console.log('Video loaded successfully for question:', currentVideoIndex + 1);
                          // Auto-play the video
                          e.target.play().catch(err => console.log('Autoplay prevented:', err));
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="text-center p-8 text-white">
                        <p className="text-lg mb-2">Video not available</p>
                        <p className="text-sm text-gray-300">
                          URL: {candidate.videoResponses[currentVideoIndex]?.cloudUrl || 'Not found'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                      disabled={currentVideoIndex === 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentVideoIndex === 0 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentVideoIndex(Math.min(candidate.videoResponses.length - 1, currentVideoIndex + 1))}
                      disabled={currentVideoIndex === candidate.videoResponses.length - 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentVideoIndex === candidate.videoResponses.length - 1 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Navigation (Right) */}
              <div className="w-80 bg-gray-50 border-l p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Questions</h3>
                <div className="space-y-2">
                  {candidate.videoResponses.map((response, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        index === currentVideoIndex
                          ? 'bg-blue-100 border-2 border-blue-300 shadow-sm'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          index === currentVideoIndex ? 'text-blue-800' : 'text-gray-600'
                        }`}>
                          Question {index + 1}
                        </span>
                        {response.cloudUrl && (
                          <div className="flex items-center gap-1">
                            <Video size={12} className={index === currentVideoIndex ? 'text-blue-600' : 'text-green-600'} />
                          </div>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        index === currentVideoIndex ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {response.question.length > 100 
                          ? response.question.substring(0, 100) + '...' 
                          : response.question
                        }
                      </p>

                    </button>
                  ))}
                </div>

                {/* Stats Summary */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Interview Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Questions:</span>
                      <span className="font-medium">{candidate.videoResponses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">
                        {candidate.videoResponses.filter(r => r.cloudUrl).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(null)
              window.confirmModalResolve?.(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full"
               onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  showConfirmModal.type === 'delete' 
                    ? 'bg-red-100' 
                    : 'bg-blue-100'
                }`}>
                  {showConfirmModal.type === 'delete' ? (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{showConfirmModal.title}</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {showConfirmModal.message}
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(null)
                    window.confirmModalResolve?.(false)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showConfirmModal.cancelText}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(null)
                    window.confirmModalResolve?.(true)
                  }}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    showConfirmModal.type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {showConfirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExplanationModal(null)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">AI Analysis: {showExplanationModal.competency}</h2>
                <button
                  onClick={() => setShowExplanationModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Analysis</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {showExplanationModal.explanation}
                  </p>
                </div>
                
                <div className="text-sm text-gray-500 pt-4 border-t">
                  Source: {currentInterview?.title || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Content Modal */}
      {showNoContentModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNoContentModal(false)
              setTempTranscript('')
              setLinkCopied(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Transcript or Video Interview Required</h2>
                <button
                  onClick={() => {
                    setShowNoContentModal(false)
                    setTempTranscript('')
                    setLinkCopied(false)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  AI analysis requires either a transcript or video interview to proceed. Choose one of the options below:
                </p>
                
                <div className="space-y-4">
                  {/* Option 1: Paste Transcript */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-600" />
                      Option 1: Paste Transcript
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      If you have an interview transcript, paste it below and run AI analysis.
                    </p>
                    <textarea
                      value={tempTranscript}
                      onChange={(e) => setTempTranscript(e.target.value)}
                      placeholder="Paste your interview transcript here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (tempTranscript.trim()) {
                          // Update the current interview with the transcript
                          const currentInterview = getCurrentInterview()
                          if (currentInterview) {
                            const updatedInterview = {
                              ...currentInterview,
                              content: tempTranscript
                            }
                            const updatedCandidate = {
                              ...candidate,
                              interviews: candidate.interviews.map((interview, index) => 
                                index === selectedInterviewIndex ? updatedInterview : interview
                              )
                            }
                            updateCandidateData(updatedCandidate)
                          }
                          setTempTranscript('')
                          setShowNoContentModal(false)
                          // Automatically trigger AI analysis
                          setTimeout(() => {
                            runAIAnalysis()
                          }, 100)
                        }
                      }}
                      disabled={!tempTranscript.trim()}
                      className={`mt-2 px-4 py-2 rounded-lg text-white font-medium ${
                        tempTranscript.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add Transcript & Run Analysis
                    </button>
                  </div>
                  
                  {/* Option 2: Generate Video Link */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Video size={18} className="text-purple-600" />
                      Option 2: Generate Video Interview Link
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Send a video interview link to the candidate to record their responses.
                    </p>
                                         <button
                       onClick={() => {
                         // Generate and copy the link
                         const interviewId = `${params.jobId}-${params.candidateId}`
                         const interviewUrl = `${window.location.origin}/interview/${interviewId}`
                         
                         navigator.clipboard.writeText(interviewUrl).then(() => {
                           // Show success feedback
                           setLinkCopied(true)
                           
                           setTimeout(() => {
                             setShowNoContentModal(false)
                             setTempTranscript('')
                             setLinkCopied(false)
                           }, 1500) // Close modal after showing success
                         }).catch(() => {
                           // Fallback if clipboard doesn't work
                           prompt(`🎥 Interview link for ${candidate.name}:\n\nCopy this link and send it to them:`, interviewUrl)
                           setShowNoContentModal(false)
                           setTempTranscript('')
                           setLinkCopied(false)
                         })
                       }}
                       className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white font-medium ${
                         linkCopied 
                           ? 'bg-green-600 hover:bg-green-700' 
                           : 'bg-purple-600 hover:bg-purple-700'
                       }`}
                     >
                       {linkCopied ? (
                         <>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                           </svg>
                           Link Copied!
                         </>
                       ) : (
                         <>
                           <Video size={16} />
                           Generate Interview Link
                         </>
                       )}
                     </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowNoContentModal(false)
                    setTempTranscript('')
                    setLinkCopied(false)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Transcript Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadModal(false)
              setUploadContent('')
              setIsDragOver(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upload Transcript</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadContent('')
                    setIsDragOver(false)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Upload size={48} className={`mx-auto mb-4 ${
                    isDragOver ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop your transcript file here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse for a .txt file
                  </p>
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setUploadContent(event.target.result)
                        }
                        reader.readAsText(file)
                      }
                    }}
                    className="hidden"
                    id="transcript-file-input"
                  />
                  <label
                    htmlFor="transcript-file-input"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>

                {/* Text Area for Pasting */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Or paste your transcript directly
                  </h3>
                  <textarea
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                    placeholder="Paste your interview transcript here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-40 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Character Count */}
                {uploadContent && (
                  <div className="text-sm text-gray-500">
                    {uploadContent.length} characters
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadContent('')
                    setIsDragOver(false)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTranscript}
                  disabled={!uploadContent.trim()}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    uploadContent.trim()
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save Transcript
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 