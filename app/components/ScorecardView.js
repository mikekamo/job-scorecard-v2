'use client'

import React, { useState } from 'react'
import { ArrowLeft, Plus, User, Edit, Calculator, Download } from 'lucide-react'

export default function ScorecardView({ job, onAddCandidate, onUpdateScore, onBack, onUpdateJob, onUpdateCandidate }) {
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [showEditCandidate, setShowEditCandidate] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', notes: '', transcript: '' })
  const [analyzingCandidate, setAnalyzingCandidate] = useState(null)
  const [showExplanationModal, setShowExplanationModal] = useState(false)
  const [selectedExplanation, setSelectedExplanation] = useState({ competency: '', candidate: '', explanation: '' })

  const handleAddCandidate = (e) => {
    e.preventDefault()
    if (newCandidate.name.trim()) {
      onAddCandidate(newCandidate)
      setNewCandidate({ name: '', email: '', notes: '', transcript: '' })
      setShowAddCandidate(false)
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

  const calculateCandidateScore = (candidate) => {
    const scores = Object.values(candidate.scores || {}).filter(score => score !== null && score !== '')
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, score) => sum + parseInt(score), 0) / scores.length)
  }

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-50'
    if (score >= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
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
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-500">{job.department}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportScorecard}
              className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Export
            </button>
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium"
            >
              + Add Candidate
            </button>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                    placeholder="Paste the interview transcript here... (Grok 3 can handle very long transcripts)"
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
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                     placeholder="Paste the interview transcript here... (Grok 3 can handle very long transcripts)"
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

      {/* Scorecard Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full border-collapse">
            {/* Main Header Row */}
            <thead>
              <tr>
                <th rowSpan="2" className="bg-blue-500 text-white px-3 py-3 text-left text-sm font-medium border border-gray-300 sticky left-0 z-20 min-w-[200px]">
                  Competencies
                </th>
                {job.candidates && job.candidates.length > 0 ? (
                  job.candidates.map((candidate, index) => (
                    <th key={candidate.id} colSpan="3" className={`bg-gray-400 px-3 py-2 text-center text-sm font-medium border border-gray-300 min-w-[360px] ${index > 0 ? 'border-l-4 border-l-black' : ''}`}>
                      <div className="flex items-center justify-center gap-2">
                        <span>{candidate.name}</span>
                        <div className="flex gap-1">
                          {candidate.transcript && candidate.transcript.trim() && (
                            <button
                              onClick={() => handleAnalyzeTranscript(candidate)}
                              disabled={analyzingCandidate === candidate.id}
                              className="text-blue-500 hover:text-blue-700 p-1 disabled:text-gray-400"
                              title={analyzingCandidate === candidate.id ? "Analyzing..." : "Analyze with AI"}
                            >
                              {analyzingCandidate === candidate.id ? (
                                <div className="h-3 w-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              ) : (
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.547.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleEditCandidate(candidate)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Edit candidate"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))
                ) : (
                  <th colSpan="3" className="bg-gray-400 px-3 py-2 text-center text-sm font-medium border border-gray-300 min-w-[360px]">
                    No Candidates
                  </th>
                )}
              </tr>
              
              {/* Sub-header row */}
              <tr>
                {job.candidates && job.candidates.length > 0 ? (
                  job.candidates.map((candidate, index) => (
                    <React.Fragment key={`${candidate.id}-headers`}>
                      <th className={`bg-blue-500 text-white px-3 py-2 text-center text-xs font-medium border border-gray-300 ${index > 0 ? 'border-l-4 border-l-black' : ''}`}>
                        Score
                      </th>
                      <th className="bg-blue-500 text-white px-3 py-2 text-center text-xs font-medium border border-gray-300">
                        AI Score
                      </th>
                      <th className="bg-blue-500 text-white px-3 py-2 text-center text-xs font-medium border border-gray-300">
                        Explanation
                      </th>
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <th className="bg-blue-500 text-white px-3 py-2 text-center text-xs font-medium border border-gray-300">
                      Score
                    </th>
                    <th className="bg-blue-500 text-white px-3 py-2 text-center text-xs font-medium border border-gray-300">
                      AI Score
                    </th>
                    <th className="bg-blue-500 text-white px-3 py-2 text-center text-xs font-medium border border-gray-300">
                      Explanation
                    </th>
                  </>
                )}
              </tr>
            </thead>
            
            <tbody>
              {job.competencies.map((competency, index) => (
                <tr key={competency.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 border border-gray-300 sticky left-0 z-10 bg-inherit">
                    <div className="text-sm font-medium text-gray-900">{competency.name}</div>
                    {competency.description && (
                      <div className="text-xs text-gray-600 mt-1">{competency.description}</div>
                    )}
                  </td>
                  {job.candidates && job.candidates.length > 0 ? (
                    job.candidates.map((candidate, candidateIndex) => (
                      <React.Fragment key={`${candidate.id}-${competency.id}-cells`}>
                        <td className={`px-2 py-2 border border-gray-300 text-center ${candidateIndex > 0 ? 'border-l-4 border-l-black' : ''}`}>
                          <select
                            value={candidate.scores?.[competency.id] || ''}
                            onChange={(e) => onUpdateScore(candidate.id, competency.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value=""></option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          <input
                            type="text"
                            value={candidate.aiScores?.[competency.id] || ''}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 text-center"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-300">
                          {candidate.explanations?.[competency.id] ? (
                            <div
                              onClick={() => handleShowExplanation(competency, candidate, candidate.explanations[competency.id])}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors min-h-[32px] flex items-center"
                              title="Click to view full explanation"
                            >
                              <span className="truncate text-gray-700">
                                {candidate.explanations[competency.id].length > 50 
                                  ? candidate.explanations[competency.id].substring(0, 50) + '...' 
                                  : candidate.explanations[competency.id]
                                }
                              </span>
                              <svg className="w-3 h-3 ml-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 min-h-[32px] flex items-center text-gray-400">
                              -
                            </div>
                          )}
                        </td>
                      </React.Fragment>
                    ))
                  ) : (
                    <>
                      <td className="px-3 py-2 border border-gray-300 text-center text-gray-400">
                        -
                      </td>
                      <td className="px-3 py-2 border border-gray-300 text-center text-gray-400">
                        -
                      </td>
                      <td className="px-3 py-2 border border-gray-300 text-center text-gray-400">
                        -
                      </td>
                    </>
                  )}
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="bg-yellow-100 font-semibold">
                <td className="px-3 py-3 border border-gray-300 text-sm font-bold sticky left-0 z-10 bg-yellow-100">
                  Total
                </td>
                {job.candidates && job.candidates.length > 0 ? (
                  job.candidates.map((candidate, candidateIndex) => {
                    const totalScore = job.competencies.reduce((sum, comp) => {
                      const score = candidate.scores?.[comp.id];
                      return sum + (score ? parseInt(score) : 0);
                    }, 0);
                    const totalPossible = job.competencies.length * 5;
                    return (
                      <React.Fragment key={`${candidate.id}-total-cells`}>
                        <td className={`px-3 py-3 border border-gray-300 text-center text-sm font-bold ${candidateIndex > 0 ? 'border-l-4 border-l-black' : ''}`}>
                          {totalScore}/{totalPossible}
                        </td>
                        <td className="px-3 py-3 border border-gray-300 text-center text-sm font-bold bg-gray-50">
                          {(() => {
                            const aiTotalScore = job.competencies.reduce((sum, comp) => {
                              const aiScore = candidate.aiScores?.[comp.id];
                              return sum + (aiScore ? parseInt(aiScore) : 0);
                            }, 0);
                            return `${aiTotalScore}/${totalPossible}`;
                          })()}
                        </td>
                        <td className="px-3 py-3 border border-gray-300 text-center text-sm font-bold bg-gray-50">
                          -
                        </td>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <>
                    <td className="px-3 py-3 border border-gray-300 text-center text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-3 border border-gray-300 text-center text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-3 border border-gray-300 text-center text-gray-400">
                      -
                    </td>
                  </>
                )}
              </tr>
              
              {/* Grade Row */}
              <tr className="bg-yellow-100 font-semibold">
                <td className="px-3 py-3 border border-gray-300 text-sm font-bold sticky left-0 z-10 bg-yellow-100">
                  Grade
                </td>
                {job.candidates && job.candidates.length > 0 ? (
                  job.candidates.map((candidate, candidateIndex) => {
                    const totalScore = job.competencies.reduce((sum, comp) => {
                      const score = candidate.scores?.[comp.id];
                      return sum + (score ? parseInt(score) : 0);
                    }, 0);
                    const totalPossible = job.competencies.length * 5;
                    const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100 * 10) / 10 : 0;
                    return (
                      <React.Fragment key={`${candidate.id}-grade-cells`}>
                        <td className={`px-3 py-3 border border-gray-300 text-center text-sm font-bold ${candidateIndex > 0 ? 'border-l-4 border-l-black' : ''}`}>
                          {percentage}%
                        </td>
                        <td className="px-3 py-3 border border-gray-300 text-center text-sm font-bold bg-gray-50">
                          {(() => {
                            const aiTotalScore = job.competencies.reduce((sum, comp) => {
                              const aiScore = candidate.aiScores?.[comp.id];
                              return sum + (aiScore ? parseInt(aiScore) : 0);
                            }, 0);
                            const aiPercentage = totalPossible > 0 ? Math.round((aiTotalScore / totalPossible) * 100 * 10) / 10 : 0;
                            return `${aiPercentage}%`;
                          })()}
                        </td>
                        <td className="px-3 py-3 border border-gray-300 text-center text-sm font-bold bg-gray-50">
                          -
                        </td>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <>
                    <td className="px-3 py-3 border border-gray-300 text-center text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-3 border border-gray-300 text-center text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-3 border border-gray-300 text-center text-gray-400">
                      -
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
          
          {/* Empty state when no candidates */}
          {(!job.candidates || job.candidates.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No candidates added</h3>
              <p className="mt-1 text-sm text-gray-500">Click "Add Candidate" to start evaluating.</p>
            </div>
          )}
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExplanationModal(false)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowExplanationModal(false)
            }
          }}
          tabIndex={-1}
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
    </div>
  )
} 