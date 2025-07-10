'use client'

import { useState } from 'react'
import { Plus, Trash2, ArrowLeft, Save, Sparkles, Loader2, Building2, ChevronDown, Settings, LogOut } from 'lucide-react'

// Question bank templates
const QUESTION_BANK = [
  {
    question: "Tell me the story of your life and the decisions you made along the way and why you made them.",
    timeLimit: 480 // 8 minutes
  },
  {
    question: "Describe a time you failed spectacularly—what did you learn, and how did you bounce back?",
    timeLimit: 360 // 6 minutes
  },
  {
    question: "If you could design a new tool or process to make your work 10x more efficient, what would it be and why?",
    timeLimit: 300 // 5 minutes
  },
  {
    question: "If you were in charge for a day, what one thing would you change about our industry or company?",
    timeLimit: 240 // 4 minutes
  }
]

export default function JobForm({ job, company, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    competencies: job?.competencies || [
      { id: '1', name: 'Technical Skills', description: 'Proficiency in required technical skills', weight: 1 },
      { id: '2', name: 'Communication', description: 'Verbal and written communication abilities', weight: 1 },
      { id: '3', name: 'Problem Solving', description: 'Ability to analyze and solve complex problems', weight: 1 },
      { id: '4', name: 'Team Collaboration', description: 'Works well with others and contributes to team success', weight: 1 },
      { id: '5', name: 'Cultural Fit', description: 'Aligns with company values and culture', weight: 1 }
    ],
    interviewQuestions: job?.interviewQuestions || [
      { id: '1', question: 'Tell me about yourself and your professional background', timeLimit: 300 },
      { id: '2', question: 'Why are you interested in this role?', timeLimit: 300 },
      { id: '3', question: 'Describe a challenging project you worked on and how you handled it', timeLimit: 300 }
    ]
  })
  
  const [activeTab, setActiveTab] = useState('competencies')
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isGeneratingCompetencies, setIsGeneratingCompetencies] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const openAIModal = () => {
    if (!formData.title.trim()) {
      alert('Please enter a job title first')
      return
    }
    setShowAIModal(true)
  }

  const generateJobDescription = async () => {
    if (!aiPrompt.trim()) {
      alert('Please provide a brief description for the AI to expand')
      return
    }

    setIsGeneratingDescription(true)
    try {
      const response = await fetch('/api/generate-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.title,
          company: company,
          userPrompt: aiPrompt
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate job description')
      }

      const data = await response.json()
      handleInputChange('description', data.description)
      setShowAIModal(false)
      setAiPrompt('')
    } catch (error) {
      console.error('Error generating job description:', error)
      alert('Failed to generate job description. Please try again.')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const generateCompetencies = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a job title first')
      return
    }

    if (formData.description.length < 100) {
      alert(`Job description needs at least 100 characters to generate meaningful competencies. Current: ${formData.description.length} characters.`)
      return
    }

    setIsGeneratingCompetencies(true)
    try {
      const response = await fetch('/api/generate-competencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.title,
          jobDescription: formData.description,
          company: company
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate competencies')
      }

      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        competencies: data.competencies
      }))
    } catch (error) {
      console.error('Error generating competencies:', error)
      alert('Failed to generate competencies. Please try again.')
    } finally {
      setIsGeneratingCompetencies(false)
    }
  }

  const generateQuestions = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a job title first')
      return
    }

    if (formData.competencies.length === 0) {
      alert('Please add or generate competencies first. Questions will be tailored to help evaluate these competencies.')
      return
    }

    setIsGeneratingQuestions(true)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.title,
          jobDescription: formData.description,
          competencies: formData.competencies,
          company: company
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        interviewQuestions: data.questions
      }))
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Failed to generate questions. Please try again.')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCompetencyChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.map(comp =>
        comp.id === id ? { ...comp, [field]: value } : comp
      )
    }))
  }

  const addCompetency = () => {
    const newCompetency = {
      id: Date.now().toString(),
      name: '',
      description: '',
      weight: 1
    }
    setFormData(prev => ({
      ...prev,
      competencies: [...prev.competencies, newCompetency]
    }))
  }

  const removeCompetency = (id) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.filter(comp => comp.id !== id)
    }))
  }

  const handleQuestionChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      interviewQuestions: prev.interviewQuestions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    }))
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: '',
      timeLimit: 300 // Default 5 minutes
    }
    setFormData(prev => ({
      ...prev,
      interviewQuestions: [...prev.interviewQuestions, newQuestion]
    }))
  }

  const removeQuestion = (id) => {
    setFormData(prev => ({
      ...prev,
      interviewQuestions: prev.interviewQuestions.filter(q => q.id !== id)
    }))
  }

  const addQuestionFromBank = (templateQuestion) => {
    const newQuestion = {
      id: Date.now().toString(),
      question: templateQuestion.question,
      timeLimit: templateQuestion.timeLimit
    }
    setFormData(prev => ({
      ...prev,
      interviewQuestions: [...prev.interviewQuestions, newQuestion]
    }))
  }

  // Drag and drop functions for reordering questions
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index)
    
    // Create a custom drag image that's not transparent
    const draggedElement = e.currentTarget
    const clone = draggedElement.cloneNode(true)
    
    // Make the clone fully opaque and position it off-screen
    clone.style.opacity = '1'
    clone.style.position = 'absolute'
    clone.style.top = '-1000px'
    clone.style.left = '-1000px'
    clone.style.pointerEvents = 'none'
    clone.style.zIndex = '9999'
    
    // Add clone to body temporarily
    document.body.appendChild(clone)
    
    // Use the clone as the drag image
    e.dataTransfer.setDragImage(clone, e.offsetX, e.offsetY)
    
    // Remove the clone after a short delay
    setTimeout(() => {
      if (document.body.contains(clone)) {
        document.body.removeChild(clone)
      }
    }, 0)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex === dropIndex) return
    
    const newQuestions = [...formData.interviewQuestions]
    const draggedQuestion = newQuestions[dragIndex]
    
    // Remove the dragged question
    newQuestions.splice(dragIndex, 1)
    // Insert it at the new position
    newQuestions.splice(dropIndex, 0, draggedQuestion)
    
    setFormData(prev => ({
      ...prev,
      interviewQuestions: newQuestions
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Call the save function
    onSave(formData)
    
    // If updating an existing job, go back to the jobs list
    if (job) {
      onCancel() // This takes us back to the jobs page
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {job ? 'Edit Job' : 'Create New Job'}
            </h2>
          </div>
          
          {/* Company Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">{company?.name || 'No Company'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {/* Current Company Header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company?.name || 'No Company'}</p>
                        <p className="text-xs text-gray-500">Current company</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        // Navigate to add company or open modal
                        window.location.href = '/'
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Add Company</span>
                    </button>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <LogOut className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Click outside to close dropdown */}
            {showDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            {/* Basic Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                  {company?.name || 'No company selected'}
                </div>
                {company?.website && (
                  <p className="text-sm text-gray-500 mt-1">{company.website}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <button
                  type="button"
                  onClick={openAIModal}
                  disabled={!formData.title.trim()}
                  className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                    !formData.title.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  title={!formData.title.trim() ? 'Enter a job title first' : 'Generate description with AI'}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </button>
              </div>
              <textarea
                rows={12}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the role and responsibilities..."
              />
              {formData.title.trim() && !formData.description.trim() && (
                <p className="text-sm text-blue-600 mt-1">
                  💡 Try the "Generate with AI" button to create a description based on your specific requirements
                </p>
              )}
            </div>

            {/* Tabbed Section for Competencies and Interview Questions */}
            <div>
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('competencies')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'competencies'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 Competencies ({formData.competencies.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('interview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'interview'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🎥 Video Interview ({formData.interviewQuestions.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'competencies' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Competencies</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={generateCompetencies}
                        disabled={!formData.title.trim() || formData.description.length < 100 || isGeneratingCompetencies}
                        className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                          !formData.title.trim() || formData.description.length < 100 || isGeneratingCompetencies
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title={
                          !formData.title.trim() 
                            ? 'Enter a job title first' 
                            : formData.description.length < 100
                            ? `Job description needs at least 100 characters (current: ${formData.description.length})`
                            : 'Generate competencies with AI'
                        }
                      >
                        <Sparkles className="h-4 w-4" />
                        {isGeneratingCompetencies ? 'Generating...' : 'Generate with AI'}
                      </button>
                      <button
                        type="button"
                        onClick={addCompetency}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Competency
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.competencies.map((competency, index) => (
                      <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-gray-500">
                            Competency {index + 1}
                          </span>
                          {formData.competencies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCompetency(competency.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={competency.name}
                              onChange={(e) => handleCompetencyChange(competency.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Competency name"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={competency.description}
                              onChange={(e) => handleCompetencyChange(competency.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="What does this competency measure?"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'interview' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Video Interview Questions</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={generateQuestions}
                        disabled={!formData.title.trim() || formData.competencies.length === 0 || isGeneratingQuestions}
                        className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                          !formData.title.trim() || formData.competencies.length === 0 || isGeneratingQuestions
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title={
                          !formData.title.trim() 
                            ? 'Enter a job title first' 
                            : formData.competencies.length === 0
                            ? 'Add or generate competencies first'
                            : 'Generate questions with AI'
                        }
                      >
                        <Sparkles className="h-4 w-4" />
                        {isGeneratingQuestions ? 'Generating...' : 'Generate with AI'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowQuestionBankModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Question Bank
                      </button>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    🎥 These questions will be sent to candidates for video responses. Each candidate gets a unique link.
                    <br />
                    💡 <strong>AI Generation:</strong> Questions are designed to elicit responses that can be scored against your competencies for accurate evaluation.
                  </p>

                  <div className="space-y-3">
                    {formData.interviewQuestions.map((question, index) => (
                      <div 
                        key={question.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-purple-300 transition-all cursor-move group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Question Number */}
                          <div className="flex-shrink-0 mt-1">
                            <span className="text-sm font-semibold text-white bg-purple-600 w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                              {index + 1}
                            </span>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1 min-w-0">
                            <textarea
                              required
                              rows={2}
                              value={question.question}
                              onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                              placeholder="What question should candidates answer?"
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.max(48, e.target.scrollHeight) + 'px';
                              }}
                            />
                          </div>

                          {/* Time Limit */}
                          <div className="flex-shrink-0 mt-1">
                            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm hover:border-purple-300 transition-colors focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={Math.floor(question.timeLimit / 60)}
                                onChange={(e) => {
                                  const minutes = parseInt(e.target.value) || 0;
                                  const seconds = question.timeLimit % 60;
                                  const totalSeconds = minutes * 60 + seconds;
                                  handleQuestionChange(question.id, 'timeLimit', Math.max(30, totalSeconds));
                                }}
                                className="w-8 border-0 bg-transparent text-sm text-center focus:outline-none font-medium text-gray-700"
                                title="Minutes"
                              />
                              <span className="text-gray-400 text-sm font-medium select-none">:</span>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                value={String(question.timeLimit % 60).padStart(2, '0')}
                                onChange={(e) => {
                                  const seconds = parseInt(e.target.value) || 0;
                                  const minutes = Math.floor(question.timeLimit / 60);
                                  const totalSeconds = minutes * 60 + seconds;
                                  handleQuestionChange(question.id, 'timeLimit', Math.max(30, totalSeconds));
                                }}
                                className="w-8 border-0 bg-transparent text-sm text-center focus:outline-none font-medium text-gray-700"
                                title="Seconds"
                              />
                              <span className="text-xs text-gray-500 ml-1 select-none">min</span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          {formData.interviewQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(question.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 mt-1"
                              title="Delete question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {/* Left side - Add buttons based on active tab */}
            <div>
              {activeTab === 'competencies' && (
                <button
                  type="button"
                  onClick={addCompetency}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Competency
                </button>
              )}
              {activeTab === 'interview' && (
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              )}
            </div>
            
            {/* Right side - Save */}
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                {job ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Job Description with AI</h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Provide a brief description of what you're looking for, and AI will create a detailed job description for: <span className="font-semibold">{formData.title}</span>
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Description *
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Looking for an experienced developer to work on React applications, need strong problem-solving skills and ability to work in a fast-paced startup environment..."
              />
              
              <p className="text-sm text-gray-500 mt-2">
                💡 Be specific about skills, experience level, company culture, or any special requirements
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateJobDescription}
                disabled={isGeneratingDescription || !aiPrompt.trim()}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  isGeneratingDescription || !aiPrompt.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Description
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      {showQuestionBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
                  <span className="text-sm text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">Template Questions</span>
                </div>
                <button
                  onClick={() => setShowQuestionBankModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Click any question below to add it to your interview. These are proven questions that work well across different roles and help reveal candidate insights.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {QUESTION_BANK.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      addQuestionFromBank(template)
                      setShowQuestionBankModal(false)
                    }}
                    className="text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 leading-relaxed group-hover:text-indigo-900 font-medium">
                          {template.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                        <span className="bg-white px-2 py-1 rounded border">
                          {Math.floor(template.timeLimit / 60)}m {template.timeLimit % 60}s
                        </span>
                        <Plus className="h-4 w-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowQuestionBankModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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