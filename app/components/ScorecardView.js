'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, User, Edit, Calculator, Download, ArrowUpRight, Trash2, RefreshCw, MoreHorizontal, Check, CheckCircle, Eye, Clock, BarChart3, Brain } from 'lucide-react'

export default function ScorecardView({ job, company, onAddCandidate, onUpdateScore, onBack, onUpdateJob, onUpdateCandidate, reloadData }) {
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [showEditCandidate, setShowEditCandidate] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', notes: '', transcript: '' })
  const [analyzingCandidate, setAnalyzingCandidate] = useState(null)
  const [showExplanationModal, setShowExplanationModal] = useState(false)
  const [selectedExplanation, setSelectedExplanation] = useState({ competency: '', candidate: '', explanation: '' })
  const [showAIScores, setShowAIScores] = useState(true)
  const [sortBy, setSortBy] = useState('name') // name, myScore, aiScore
  const [sortOrder, setSortOrder] = useState('asc') // asc, desc
  const [showOnlyNew, setShowOnlyNew] = useState(false) // Filter for new candidates
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCompetencyModal, setShowCompetencyModal] = useState(null) // Track which competency modal is open

  // Global escape key handler
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close modals in order of priority
        if (showCompetencyModal) {
          setShowCompetencyModal(null)
        } else if (showExplanationModal) {
          setShowExplanationModal(false)
        } else if (showEditCandidate) {
          setShowEditCandidate(false)
          setEditingCandidate(null)
        } else if (showAddCandidate) {
          setShowAddCandidate(false)
        }
      }
    }

    // Add event listener when any modal is open
    if (showCompetencyModal || showExplanationModal || showEditCandidate || showAddCandidate) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showCompetencyModal, showExplanationModal, showEditCandidate, showAddCandidate])

  // Show competency description modal
  const showCompetencyDescription = (competency) => {
    setShowCompetencyModal(competency)
  }

  // Auto-refresh to check for new candidates every 10 seconds
  useEffect(() => {
    if (!reloadData) return

    const interval = setInterval(async () => {
      try {
        await reloadData()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [reloadData])

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (!reloadData) return
    
    setIsRefreshing(true)
    try {
      await reloadData()
    } catch (error) {
      console.error('Manual refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAddCandidate = (e) => {
    e.preventDefault()
    if (newCandidate.name.trim()) {
      const createdCandidate = onAddCandidate(newCandidate)
      setNewCandidate({ name: '', email: '', notes: '', transcript: '' })
      setShowAddCandidate(false)
      
      // Navigate to the candidate detail page
      if (createdCandidate) {
        window.location.href = `/candidate/${job.id}/${createdCandidate.id}`
      }
    }
  }

  const handleEditCandidate = (candidate) => {
    setEditingCandidate({ ...candidate })
    setShowEditCandidate(true)
  }

  const handleSaveEditCandidate = (e) => {
    e.preventDefault()
    if (editingCandidate.name.trim()) {
      onUpdateCandidate(editingCandidate)
      setEditingCandidate(null)
      setShowEditCandidate(false)
    }
  }

  const handleAnalyzeTranscript = async (candidate) => {
    if (!candidate.transcript || !candidate.transcript.trim()) {
      alert('No transcript available for this candidate.')
      return
    }

    setAnalyzingCandidate(candidate.id)
    
    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: candidate.transcript,
          competencies: job.competencies.map(comp => comp.name)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze transcript')
      }

      const analysis = await response.json()
      
      // Convert competency names back to IDs for storage
      const aiScores = {}
      const explanations = {}
      
      job.competencies.forEach(comp => {
        if (analysis.scores[comp.name]) {
          aiScores[comp.id] = analysis.scores[comp.name]
        }
        if (analysis.explanations[comp.name]) {
          explanations[comp.id] = analysis.explanations[comp.name]
        }
      })
      
      // Update candidate with AI scores and explanations
      const updatedCandidate = {
        ...candidate,
        aiScores,
        explanations
      }
      
      onUpdateCandidate(updatedCandidate)
      
    } catch (error) {
      console.error('Error analyzing transcript:', error)
      alert('Failed to analyze transcript: ' + error.message)
    } finally {
      setAnalyzingCandidate(null)
    }
  }

  const handleShowExplanation = (competency, candidate, explanation) => {
    setSelectedExplanation({
      competency: competency.name,
      candidate: candidate.name,
      explanation: explanation
    })
    setShowExplanationModal(true)
  }



  const handleDeleteCandidate = (candidate) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${candidate.name}?\n\n` +
      `This will permanently remove:\n` +
      `• All scores and evaluations\n` +
      `• Interview transcript\n` +
      `• Video responses\n` +
      `• All candidate data\n\n` +
      `This action cannot be undone.`
    )
    
    if (confirmDelete) {
      // Remove candidate from job's candidates array
      const updatedJob = {
        ...job,
        candidates: job.candidates.filter(c => c.id !== candidate.id)
      }
      
      onUpdateJob(updatedJob)
      
      console.log(`Deleted candidate: ${candidate.name}`)
    }
  }



  const calculateCandidateScore = (candidate) => {
    const scores = Object.values(candidate.scores || {}).filter(score => score !== null && score !== '')
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, score) => sum + parseInt(score), 0) / scores.length)
  }

  // Total points calculation to match candidate details page
  const calculateTotalPoints = (candidate) => {
    if (!candidate.scores || !job.competencies) return { current: 0, total: job?.competencies?.length * 5 || 0 }
    
    const currentScore = Object.values(candidate.scores)
      .filter(score => score && !isNaN(score))
      .reduce((sum, score) => sum + parseInt(score), 0)
    
    const totalPossible = job.competencies.length * 5
    
    return { current: currentScore, total: totalPossible }
  }

  // AI total points calculation
  const calculateAITotalPoints = (candidate) => {
    if (!candidate.aiScores || !job.competencies) return { current: 0, total: job?.competencies?.length * 5 || 0 }
    
    const currentScore = Object.values(candidate.aiScores)
      .filter(score => score && !isNaN(score))
      .reduce((sum, score) => sum + parseInt(score), 0)
    
    const totalPossible = job.competencies.length * 5
    
    return { current: currentScore, total: totalPossible }
  }

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-50'
    if (score >= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // Check if candidate is new (has completed interview but not viewed yet)
  const isNewCandidate = (candidate) => {
    return candidate.isNew === true
  }

  // Get count of new candidates
  const getNewCandidatesCount = () => {
    return job.candidates?.filter(isNewCandidate).length || 0
  }

  // Sort candidates based on current settings
  const getSortedCandidates = () => {
    let candidates = [...(job.candidates || [])]
    
    // Apply new candidates filter
    if (showOnlyNew) {
      candidates = candidates.filter(isNewCandidate)
    }
    
    return candidates.sort((a, b) => {
      let valueA, valueB
      
      switch(sortBy) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'myScore':
          const pointsA = calculateTotalPoints(a)
          const pointsB = calculateTotalPoints(b)
          valueA = pointsA.total > 0 ? (pointsA.current / pointsA.total) : 0
          valueB = pointsB.total > 0 ? (pointsB.current / pointsB.total) : 0
          break
        case 'aiScore':
          const aiPointsA = calculateAITotalPoints(a)
          const aiPointsB = calculateAITotalPoints(b)
          valueA = aiPointsA.total > 0 ? (aiPointsA.current / aiPointsA.total) : 0
          valueB = aiPointsB.total > 0 ? (aiPointsB.current / aiPointsB.total) : 0
          break
        default:
          return 0
      }
      
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      } else {
        return sortOrder === 'asc' 
          ? valueA - valueB
          : valueB - valueA
      }
    })
  }

  const exportScorecard = () => {
    const data = {
      job: job.title,
      department: job.department,
      candidates: job.candidates.map(candidate => ({
        name: candidate.name,
        email: candidate.email,
        overallScore: calculateCandidateScore(candidate),
        competencyScores: job.competencies.map(comp => ({
          competency: comp.name,
          score: candidate.scores?.[comp.id] || 'Not scored'
        }))
      }))
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${job.title.replace(/\s+/g, '_')}_scorecard.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
                <p className="text-lg text-gray-600 mt-1">{job.title} • {job.department}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Refresh to check for new candidates"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportScorecard}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => setShowAddCandidate(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {job.candidates && job.candidates.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-white/50 overflow-hidden">
            {/* Filter Panel */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Sort candidates by:</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name">Name</option>
                      <option value="myScore">Total Score</option>
                      <option value="aiScore">AI Total Score</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOnlyNew}
                      onChange={(e) => setShowOnlyNew(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">
                      Show Only New
                      {getNewCandidatesCount() > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {getNewCandidatesCount()}
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Candidates Table */}
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="pl-6 pr-2 py-4 text-left text-sm font-medium">Competency</th>
                                         {getSortedCandidates().map((candidate, index) => (
                       <th key={candidate.id} className={`${index === 0 ? 'pl-2' : 'pl-3'} pr-3 py-4 text-center text-sm font-medium min-w-[120px]`}>
                         <div className="flex flex-col items-center gap-2">
                           <div className="truncate max-w-[100px]" title={candidate.name}>
                             {candidate.name.length > 10 ? candidate.name.substring(0, 10) + '...' : candidate.name}
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <div className="w-4 h-4 flex items-center justify-center">
                               {isNewCandidate(candidate) && (
                                 <div 
                                   className="w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                                   title="New candidate"
                                 >
                                   !
                                 </div>
                               )}
                             </div>
                             <button
                               onClick={() => {
                                 const candidateDetailUrl = `/candidate/${job.id}/${candidate.id}`
                                 window.location.href = candidateDetailUrl
                               }}
                               className="bg-white/20 hover:bg-white/30 p-1 rounded transition-all"
                               title="View candidate details"
                             >
                               <ArrowUpRight className="h-3 w-3" />
                             </button>

                             <button
                               onClick={() => handleDeleteCandidate(candidate)}
                               className="bg-white/20 hover:bg-red-500/50 p-1 rounded transition-all"
                               title="Delete candidate"
                             >
                               <Trash2 className="h-3 w-3" />
                             </button>
                           </div>
                         </div>
                       </th>
                     ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {job.competencies.map((competency, index) => (
                    <tr key={competency.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      {/* Competency Info */}
                      <td className="pl-6 pr-2 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900">{competency.name}</div>
                          {competency.description && (
                            <button
                              onClick={() => showCompetencyDescription(competency)}
                              className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                              title="Show description"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" className="fill-none">
                                <path d="M2 3c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H6l-3 3V11c-.6 0-1-.4-1-1V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      
                      {/* Individual Candidate Scores for this competency */}
                      {getSortedCandidates().map((candidate, candidateIndex) => (
                        <td key={candidate.id} className={`${candidateIndex === 0 ? 'pl-2' : 'pl-3'} pr-3 py-4 text-center`}>
                          <div className="flex flex-col items-center justify-center gap-1">
                            {/* Manual Score */}
                            <div className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${
                              candidate.scores?.[competency.id] ? 
                                candidate.scores[competency.id] >= 4 ? 'bg-green-100 text-green-800' :
                                candidate.scores[competency.id] >= 3 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {candidate.scores?.[competency.id] || '-'}
                            </div>
                            
                            {/* AI Score with Brain Icon */}
                            <div className="relative flex items-center justify-center">
                              <div className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${
                                candidate.aiScores?.[competency.id] ? 
                                  candidate.aiScores[competency.id] >= 4 ? 'bg-blue-100 text-blue-800' :
                                  candidate.aiScores[competency.id] >= 3 ? 'bg-blue-100 text-blue-700' :
                                  'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {candidate.aiScores?.[competency.id] || '-'}
                              </div>
                              <Brain className="w-3 h-3 text-blue-600 absolute -left-4" />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td className="pl-6 pr-2 py-4 font-bold text-gray-900">TOTAL</td>
                    
                    {/* Individual Candidate Totals */}
                    {getSortedCandidates().map((candidate, candidateIndex) => (
                      <td key={candidate.id} className={`${candidateIndex === 0 ? 'pl-2' : 'pl-3'} pr-3 py-4 text-center`}>
                        <div className="flex flex-col items-center gap-1">
                          {/* Manual Total */}
                          {(() => {
                            const points = calculateTotalPoints(candidate)
                            const percentage = points.total > 0 ? (points.current / points.total) * 100 : 0
                            return points.current > 0 ? (
                              <div className={`px-2 py-1 rounded text-xs font-bold ${
                                percentage >= 80 ? 'bg-green-100 text-green-800' :
                                percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {points.current}/{points.total}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">n/a</div>
                            )
                          })()}
                          
                          {/* AI Total with Brain Icon */}
                          <div className="relative flex items-center justify-center">
                            {(() => {
                              const aiPoints = calculateAITotalPoints(candidate)
                              const aiPercentage = aiPoints.total > 0 ? (aiPoints.current / aiPoints.total) * 100 : 0
                              return aiPoints.current > 0 ? (
                                <div className={`px-2 py-1 rounded text-xs font-bold ${
                                  aiPercentage >= 80 ? 'bg-blue-100 text-blue-800' :
                                  aiPercentage >= 60 ? 'bg-blue-100 text-blue-700' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {aiPoints.current}/{aiPoints.total}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">n/a</div>
                              )
                            })()}
                            <Brain className="w-3 h-3 text-blue-600 absolute -left-4" />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{job.candidates.length}</div>
                  <div className="text-sm text-gray-600">Total Candidates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{job.competencies.length}</div>
                  <div className="text-sm text-gray-600">Competencies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {getNewCandidatesCount()}
                  </div>
                  <div className="text-sm text-gray-600">New Candidates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {job.candidates.filter(c => {
                      const points = calculateTotalPoints(c)
                      const percentage = points.total > 0 ? (points.current / points.total) * 100 : 0
                      return percentage >= 80
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">High Performers (80%+)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      if (job.candidates.length === 0) return '0%'
                      const totalPercentage = job.candidates.reduce((sum, c) => {
                        const points = calculateTotalPoints(c)
                        return sum + (points.total > 0 ? (points.current / points.total) * 100 : 0)
                      }, 0)
                      return Math.round(totalPercentage / job.candidates.length) + '%'
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No candidates yet</h3>
            <p className="text-gray-600 mb-6">Add your first candidate to get started with scoring.</p>
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Add Candidate
            </button>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddCandidate(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Candidate</h3>
            </div>
            <form onSubmit={handleAddCandidate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Candidate name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="candidate@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newCandidate.notes}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about the candidate..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript
                    <span className="ml-2 text-xs text-gray-500">
                      ({newCandidate.transcript.length} characters)
                    </span>
                  </label>
                  <textarea
                    rows={8}
                    value={newCandidate.transcript}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, transcript: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Paste the interview transcript here... (AI can generate a score based on this transcript)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Candidate Modal */}
      {showEditCandidate && editingCandidate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditCandidate(false)
              setEditingCandidate(null)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Candidate</h3>
            </div>
            <form onSubmit={handleSaveEditCandidate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCandidate.name}
                    onChange={(e) => setEditingCandidate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Candidate name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingCandidate.email || ''}
                    onChange={(e) => setEditingCandidate(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="candidate@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingCandidate.notes || ''}
                    onChange={(e) => setEditingCandidate(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about the candidate..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript
                    <span className="ml-2 text-xs text-gray-500">
                      ({(editingCandidate.transcript || '').length} characters)
                    </span>
                  </label>
                  <textarea
                    rows={8}
                    value={editingCandidate.transcript || ''}
                    onChange={(e) => setEditingCandidate(prev => ({ ...prev, transcript: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Paste the interview transcript here... (AI can generate a score based on this transcript)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCandidate(false)
                    setEditingCandidate(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExplanationModal(false)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Analysis Explanation</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{selectedExplanation.competency}</span> • {selectedExplanation.candidate}
                  </p>
                </div>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.547.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Grok AI Analysis</h4>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap leading-relaxed">
                        {selectedExplanation.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Powered by Grok 3 • Click outside or press ESC to close
                </p>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competency Description Modal */}
      {showCompetencyModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCompetencyModal(null)
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Competency Description</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{showCompetencyModal.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowCompetencyModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Definition & Evaluation Criteria</h4>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap leading-relaxed">
                        {showCompetencyModal.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Use this description to guide your scoring • Click outside or press ESC to close
                </p>
                <button
                  onClick={() => setShowCompetencyModal(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  )
} 