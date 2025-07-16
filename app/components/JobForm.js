'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, ArrowLeft, Save, Sparkles, Loader2, ChevronRight, Copy, X, FileText, GripVertical } from 'lucide-react'
import { useJobStorage } from '../hooks/useJobStorage'
import Sortable from 'sortablejs'

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
  const { jobs } = useJobStorage()
  
  // Initialize currentStep based on job type
  const [currentStep, setCurrentStep] = useState(() => {
    if (job?.isDraft) {
      // For drafts, continue from where they left off
      return job.currentStep || 1
    } else if (job) {
      // For existing complete jobs, show all steps
      return 2
    } else {
      // For new jobs, start at step 1
      return 1
    }
  })
  
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
      { id: 'q1', question: 'Tell me about your technical experience and the technologies you work with most frequently.', timeLimit: 240, competencyId: '1' },
      { id: 'q2', question: 'Describe a time when you had to explain a complex concept to someone with less technical background.', timeLimit: 180, competencyId: '2' },
      { id: 'q3', question: 'Walk me through how you approach solving a challenging problem you\'ve never encountered before.', timeLimit: 240, competencyId: '3' },
      { id: 'q4', question: 'Tell me about a successful team project you worked on and your specific role in its success.', timeLimit: 180, competencyId: '4' },
      { id: 'q5', question: 'What type of work environment and company culture do you thrive in, and why?', timeLimit: 180, competencyId: '5' }
    ]
  })
  
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isGeneratingCompetencies, setIsGeneratingCompetencies] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isGeneratingSingleQuestion, setIsGeneratingSingleQuestion] = useState(null) // Track which competency is generating
  const [isGeneratingFullSection, setIsGeneratingFullSection] = useState(false) // Track full competencies + questions generation
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false)
  const [showQuestionUpdateModal, setShowQuestionUpdateModal] = useState(false)
  const [pendingCompetencyUpdate, setPendingCompetencyUpdate] = useState(null)
  const [draftId, setDraftId] = useState(job?.id || null) // Track draft ID for new jobs
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [activeTemplateTab, setActiveTemplateTab] = useState('competencies')
  const [templateSearchQuery, setTemplateSearchQuery] = useState('')
  const competenciesRef = useRef(null)

  // Initialize SortableJS for drag and drop
  useEffect(() => {
    if (competenciesRef.current && !isGeneratingFullSection) {
      const sortable = Sortable.create(competenciesRef.current, {
        animation: 150,
        handle: '.drag-handle',
        draggable: '.competency-card',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        scroll: true,
        scrollSensitivity: 60,
        scrollSpeed: 20,
        bubbleScroll: true,
        forceAutoScrollFallback: true,
        onStart: (evt) => {
          // Add dragging class to container
          competenciesRef.current.classList.add('is-dragging')
        },
        onEnd: (evt) => {
          // Remove dragging class from container
          competenciesRef.current.classList.remove('is-dragging')
          
          const { oldIndex, newIndex } = evt
          if (oldIndex !== newIndex) {
            setFormData(prev => {
              const newCompetencies = [...prev.competencies]
              const [movedItem] = newCompetencies.splice(oldIndex, 1)
              newCompetencies.splice(newIndex, 0, movedItem)
              
              // Reorder questions to match competency order
              const newQuestions = newCompetencies.map(comp => {
                return prev.interviewQuestions.find(q => q.competencyId === comp.id) || 
                       prev.interviewQuestions.find((q, idx) => idx === prev.competencies.findIndex(c => c.id === comp.id))
              }).filter(Boolean)
              
              // Add any questions that don't have matching competencies at the end
              const mappedQuestionIds = new Set(newQuestions.map(q => q.id))
              const unmappedQuestions = prev.interviewQuestions.filter(q => !mappedQuestionIds.has(q.id))
              
              return {
                ...prev,
                competencies: newCompetencies,
                interviewQuestions: [...newQuestions, ...unmappedQuestions]
              }
            })
          }
        }
      })

      return () => {
        sortable.destroy()
      }
    }
  }, [formData.competencies.length, isGeneratingFullSection])

  // Auto-save drafts when form data changes
  useEffect(() => {
    // Auto-save conditions:
    // 1. For existing drafts (job?.isDraft) - save any changes
    // 2. For new jobs - save when we have title and some description
    const shouldAutoSave = job?.isDraft || 
      (!job && formData.title.trim() && formData.description.trim().length >= 50)
    
    if (shouldAutoSave) {
      const timeoutId = setTimeout(() => {
        saveDraft().catch(error => console.error('Auto-save failed:', error))
      }, 1000) // Auto-save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId)
    }
  }, [formData, currentStep, job?.isDraft])

  // Save draft when user navigates away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formData.title.trim() && formData.description.trim().length >= 50) {
        saveDraft().catch(error => console.error('Save on unload failed:', error))
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && formData.title.trim() && formData.description.trim().length >= 50) {
        saveDraft().catch(error => console.error('Save on visibility change failed:', error))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [formData.title, formData.description])

  // Save draft immediately when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && !job && formData.title.trim() && formData.description.trim().length >= 50) {
      saveDraft().catch(error => console.error('Save on step 2 failed:', error))
    }
  }, [currentStep])

  const isEditingJob = job && !job.isDraft

  // Get all unique competencies from all jobs (excluding current job if editing)
  const getAllCompetencies = () => {
    const allCompetencies = []
    const seenCompetencies = new Set()
    
    // Add competencies from templates page
    try {
      const selectedTemplates = JSON.parse(localStorage.getItem('selected-templates') || '{"competencies": [], "questions": []}')
      selectedTemplates.competencies.forEach(comp => {
        const key = `${comp.name}-${comp.description}`
        if (!seenCompetencies.has(key)) {
          seenCompetencies.add(key)
          allCompetencies.push({
            ...comp,
            fromJob: `Template: ${comp.fromTemplate || 'Unknown'}`
          })
        }
      })
    } catch (error) {
      console.error('Error loading template competencies:', error)
    }
    
    // Add competencies from existing jobs
    jobs.forEach(jobItem => {
      // Skip current job if editing to avoid showing same competencies as templates
      if (job && jobItem.id === job.id) return
      
      if (jobItem.competencies) {
        jobItem.competencies.forEach(comp => {
          const key = `${comp.name}-${comp.description}`
          if (!seenCompetencies.has(key)) {
            seenCompetencies.add(key)
            allCompetencies.push({
              ...comp,
              fromJob: jobItem.title
            })
          }
        })
      }
    })
    
    return allCompetencies
  }

  // Get all unique questions from all jobs (excluding current job if editing)
  const getAllQuestions = () => {
    const allQuestions = []
    const seenQuestions = new Set()
    
    // Add questions from templates page
    try {
      const selectedTemplates = JSON.parse(localStorage.getItem('selected-templates') || '{"competencies": [], "questions": []}')
      selectedTemplates.questions.forEach(question => {
        const key = question.question
        if (!seenQuestions.has(key)) {
          seenQuestions.add(key)
          allQuestions.push({
            ...question,
            fromJob: `Template: ${question.fromTemplate || 'Unknown'}`
          })
        }
      })
    } catch (error) {
      console.error('Error loading template questions:', error)
    }
    
    // Add questions from existing jobs
    jobs.forEach(jobItem => {
      // Skip current job if editing to avoid showing same questions as templates
      if (job && jobItem.id === job.id) return
      
      if (jobItem.interviewQuestions) {
        jobItem.interviewQuestions.forEach(question => {
          const key = question.question
          if (!seenQuestions.has(key)) {
            seenQuestions.add(key)
            allQuestions.push({
              ...question,
              fromJob: jobItem.title
            })
          }
        })
      }
    })
    
    return allQuestions
  }

  // Filter competencies based on search query
  const getFilteredCompetencies = () => {
    const allCompetencies = getAllCompetencies()
    
    if (!templateSearchQuery.trim()) {
      return allCompetencies
    }
    
    const query = templateSearchQuery.toLowerCase()
    return allCompetencies.filter(competency =>
      competency.name.toLowerCase().includes(query) ||
      competency.description.toLowerCase().includes(query) ||
      competency.fromJob.toLowerCase().includes(query)
    )
  }

  // Filter questions based on search query
  const getFilteredQuestions = () => {
    const allQuestions = getAllQuestions()
    
    if (!templateSearchQuery.trim()) {
      return allQuestions
    }
    
    const query = templateSearchQuery.toLowerCase()
    return allQuestions.filter(question =>
      question.question.toLowerCase().includes(query) ||
      question.fromJob.toLowerCase().includes(query)
    )
  }

  // Add competency from templates
  const addCompetencyFromTemplate = (templateCompetency) => {
    const newId = Date.now().toString()
    const newCompetency = {
      id: newId,
      name: templateCompetency.name,
      description: templateCompetency.description,
      weight: templateCompetency.weight || 1
    }
    
    setFormData(prev => ({
      ...prev,
      competencies: [...prev.competencies, newCompetency]
    }))
  }

  // Add question from templates
  const addQuestionFromTemplate = (templateQuestion) => {
    const newId = Date.now().toString()
    // Try to find the best matching competency or use the first one
    const bestCompetencyId = formData.competencies.length > 0 
      ? formData.competencies[0].id 
      : '1'
    
    const newQuestion = {
      id: newId,
      question: templateQuestion.question,
      timeLimit: templateQuestion.timeLimit || 180,
      competencyId: bestCompetencyId
    }
    
    setFormData(prev => ({
      ...prev,
      interviewQuestions: [...prev.interviewQuestions, newQuestion]
    }))
  }

  // Clear selected templates
  const clearSelectedTemplates = () => {
    if (confirm('Are you sure you want to clear all selected templates?')) {
      localStorage.removeItem('selected-templates')
      alert('✅ Selected templates cleared!')
    }
  }

  // Get selected templates count
  const getSelectedTemplatesCount = () => {
    try {
      const selectedTemplates = JSON.parse(localStorage.getItem('selected-templates') || '{"competencies": [], "questions": []}')
      return {
        competencies: selectedTemplates.competencies.length,
        questions: selectedTemplates.questions.length
      }
    } catch (error) {
      return { competencies: 0, questions: 0 }
    }
  }

  // Go to templates page
  const goToTemplates = () => {
    window.location.href = '/templates'
  }


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

    setIsGeneratingFullSection(true)
    setIsGeneratingCompetencies(true)
    
    try {
      // First, generate competencies
      const competenciesResponse = await fetch('/api/generate-competencies', {
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

      if (!competenciesResponse.ok) {
        throw new Error('Failed to generate competencies')
      }

      const competenciesData = await competenciesResponse.json()
      setIsGeneratingCompetencies(false)
      setIsGeneratingQuestions(true)
      
      // Then, generate questions for the new competencies
      const questionsResponse = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.title,
          jobDescription: formData.description,
          competencies: competenciesData.competencies,
          company: company,
          onePerCompetency: true
        })
      })

      if (!questionsResponse.ok) {
        throw new Error('Failed to generate questions')
      }

      const questionsData = await questionsResponse.json()
      
      // Map questions to competencies with proper competencyId linking
      const questionsWithCompetencyIds = questionsData.questions.map((question, index) => ({
        ...question,
        competencyId: competenciesData.competencies[index]?.id || (index + 1).toString()
      }))
      
      // Update the form data with both competencies and questions at once
      setFormData(prev => ({
        ...prev,
        competencies: competenciesData.competencies,
        interviewQuestions: questionsWithCompetencyIds
      }))
      
    } catch (error) {
      console.error('Error generating competencies and questions:', error)
      alert('Failed to generate competencies and questions. Please try again.')
    } finally {
      setIsGeneratingCompetencies(false)
      setIsGeneratingQuestions(false)
      setIsGeneratingFullSection(false)
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
          company: company,
          onePerCompetency: true // Ensure exactly one question per competency
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      
      // Map questions to competencies with proper competencyId linking
      const questionsWithCompetencyIds = data.questions.map((question, index) => ({
        ...question,
        competencyId: formData.competencies[index]?.id || (index + 1).toString()
      }))
      
      setFormData(prev => ({
        ...prev,
        interviewQuestions: questionsWithCompetencyIds
      }))
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Failed to generate questions. Please try again.')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }



  const generateSingleQuestion = async (competency) => {
    if (!formData.title.trim() || !competency.name.trim() || !competency.description.trim()) {
      return // Don't generate if required fields are empty
    }

    setIsGeneratingSingleQuestion(competency.id)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.title,
          jobDescription: formData.description,
          competencies: [competency], // Send only the single competency
          company: company,
          onePerCompetency: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate question')
      }

      const data = await response.json()
      
      if (data.questions && data.questions.length > 0) {
        const newQuestion = {
          ...data.questions[0],
          competencyId: competency.id
        }
        
        // Update the question for this competency, or add it if it doesn't exist
        setFormData(prev => {
          const existingQuestionIndex = prev.interviewQuestions.findIndex(q => q.competencyId === competency.id)
          
          if (existingQuestionIndex !== -1) {
            // Update existing question
            const updatedQuestions = [...prev.interviewQuestions]
            updatedQuestions[existingQuestionIndex] = newQuestion
            return {
              ...prev,
              interviewQuestions: updatedQuestions
            }
          } else {
            // Add new question if none exists for this competency
            return {
              ...prev,
              interviewQuestions: [...prev.interviewQuestions, newQuestion]
            }
          }
        })
      }
    } catch (error) {
      console.error('Error generating single question:', error)
      // Silently fail for auto-generation to avoid disrupting user experience
    } finally {
      setIsGeneratingSingleQuestion(null)
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate step 1 before proceeding
      if (!formData.title.trim()) {
        alert('Please enter a job title first')
        return
      }
      
      if (formData.description.length < 100) {
        alert(`Job description needs at least 100 characters to generate meaningful competencies. Current: ${formData.description.length} characters.`)
        return
      }
      
      // Save as draft before proceeding to step 2
      if (!job || job.isDraft) { // Save for new jobs or existing drafts
        await saveDraft()
      }
      
      // Generate competencies and questions automatically
      setCurrentStep(2)
      await generateCompetencies()
    }
  }

  const saveDraft = async () => {
    // Generate a consistent ID for new jobs
    const currentDraftId = draftId || `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const draftData = {
      ...formData,
      id: currentDraftId,
      companyId: company?.id,
      isDraft: true,
      dateCreated: job?.dateCreated || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      currentStep: currentStep, // Save current step
      candidates: []
    }
    
    try {
      // Get existing drafts
      const existingDrafts = JSON.parse(localStorage.getItem('job-drafts') || '[]')
      
      // Check if this draft already exists
      const existingDraftIndex = existingDrafts.findIndex(draft => draft.id === currentDraftId)
      
      if (existingDraftIndex !== -1) {
        // Update existing draft
        existingDrafts[existingDraftIndex] = draftData
      } else {
        // Add new draft
        existingDrafts.push(draftData)
      }
      
      localStorage.setItem('job-drafts', JSON.stringify(existingDrafts))
      console.log('💾 Draft saved:', draftData.title)
      
      // Also sync to server storage
      try {
        const completedJobs = JSON.parse(localStorage.getItem('jobScorecards') || '[]')
        const allJobs = [...completedJobs, ...existingDrafts]
        
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(allJobs)
        })
        
        if (response.ok) {
          console.log('💾 Draft synced to server storage')
        } else {
          console.warn('⚠️ Draft saved locally but failed to sync to server')
        }
      } catch (serverError) {
        console.warn('⚠️ Draft saved locally but server sync failed:', serverError)
      }
      
      // Update the draft ID if this is a new job
      if (!draftId) {
        setDraftId(currentDraftId)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const handleBackStep = () => {
    setCurrentStep(1)
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
    
    // Create a corresponding question for the new competency
    const newQuestion = {
      id: 'q' + Date.now().toString(),
      question: '',
      timeLimit: 180,
      competencyId: newCompetency.id
    }
    
    setFormData(prev => ({
      ...prev,
      competencies: [...prev.competencies, newCompetency],
      interviewQuestions: [...prev.interviewQuestions, newQuestion]
    }))
  }

  const removeCompetency = (id) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.filter(comp => comp.id !== id),
      interviewQuestions: prev.interviewQuestions.filter(q => q.competencyId !== id)
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

  const addQuestionFromBank = (templateQuestion) => {
    const newQuestion = {
      id: Date.now().toString(),
      question: templateQuestion.question,
      timeLimit: templateQuestion.timeLimit,
      competencyId: '' // Will need to be assigned
    }
    
    setFormData(prev => ({
      ...prev,
      interviewQuestions: [...prev.interviewQuestions, newQuestion]
    }))
    
    setShowQuestionBankModal(false)
  }

  const handleKeepExistingQuestion = () => {
    setShowQuestionUpdateModal(false)
    setPendingCompetencyUpdate(null)
  }

  const handleUpdateQuestion = async () => {
    if (pendingCompetencyUpdate) {
      setShowQuestionUpdateModal(false)
      await generateSingleQuestion(pendingCompetencyUpdate)
      setPendingCompetencyUpdate(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Use the draft ID if available, otherwise generate a new one
    const finalJobId = draftId || job?.id || Date.now().toString()
    
    // Prepare the final job data
    const finalJobData = {
      ...formData,
      id: finalJobId,
      isDraft: false, // Mark as complete
      lastModified: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
    
    // If this was a draft, remove it from drafts first
    if (job?.isDraft || draftId) {
      await removeDraft(finalJobId)
    }
    
    // Call the save function
    onSave(finalJobData)
    
    // If updating an existing job, go back to the jobs list
    if (job) {
      onCancel() // This takes us back to the jobs page
    }
  }

  const removeDraft = async (idToRemove) => {
    try {
      // Remove from localStorage
      const existingDrafts = JSON.parse(localStorage.getItem('job-drafts') || '[]')
      const updatedDrafts = existingDrafts.filter(draft => draft.id !== idToRemove)
      localStorage.setItem('job-drafts', JSON.stringify(updatedDrafts))
      
      // Also remove from server storage by combining all jobs and sending to server
      try {
        const completedJobs = JSON.parse(localStorage.getItem('jobScorecards') || '[]')
        const allJobs = [...completedJobs, ...updatedDrafts]
        
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(allJobs)
        })
        
        if (response.ok) {
          console.log('🗑️ Draft removed from both local and server storage:', idToRemove)
        } else {
          console.warn('⚠️ Draft removed from localStorage but failed to update server storage')
        }
      } catch (serverError) {
        console.warn('⚠️ Draft removed from localStorage but server sync failed:', serverError)
      }
    } catch (error) {
      console.error('Error removing draft:', error)
    }
  }


  const shouldShowCompetencies = currentStep >= 2 || isEditingJob

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
            {!isEditingJob && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Step {currentStep} of 2
              </span>
            )}
          </div>
          

        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 relative">
          {/* Loading overlay when generating single question */}
          {isGeneratingSingleQuestion && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-20 rounded-lg flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 text-purple-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Generating interview question with AI...</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Please wait while we create the perfect question for your competency.</p>
              </div>
            </div>
          )}
          <div className="space-y-6">
            {/* Basic Job Information */}
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

            {/* Next Step Button */}
            {!isEditingJob && currentStep === 1 && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.title.trim() || formData.description.length < 100}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !formData.title.trim() || formData.description.length < 100
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Integrated Competencies & Interview Questions */}
            {shouldShowCompetencies && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Competencies & Interview Questions</h3>
                  {isGeneratingFullSection && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {isGeneratingCompetencies && isGeneratingQuestions ? 'Generating AI content...' :
                         isGeneratingCompetencies ? 'Generating competencies...' :
                         isGeneratingQuestions ? 'Generating interview questions...' :
                         'Generating AI content...'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={generateCompetencies}
                      disabled={!formData.title.trim() || formData.description.length < 100 || isGeneratingFullSection || isGeneratingSingleQuestion}
                      className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                        !formData.title.trim() || formData.description.length < 100 || isGeneratingFullSection || isGeneratingSingleQuestion
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title={
                        !formData.title.trim() 
                          ? 'Enter a job title first' 
                          : formData.description.length < 100
                          ? `Job description needs at least 100 characters (current: ${formData.description.length})`
                          : isGeneratingSingleQuestion
                          ? 'Please wait for current generation to complete'
                          : 'Generate competencies with AI'
                      }
                    >
                      <Sparkles className="h-4 w-4" />
                      {isGeneratingFullSection ? 'Generating...' : 'Generate with AI'}
                    </button>
                    <button
                      type="button"
                      onClick={addCompetency}
                      disabled={isGeneratingFullSection || isGeneratingSingleQuestion}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      Add Competency
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const templatesCount = getSelectedTemplatesCount()
                      const hasTemplates = templatesCount.competencies > 0 || templatesCount.questions > 0
                      
                      return (
                        <>
                          {hasTemplates && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-md">
                              <span className="font-medium">Selected:</span>
                              <span className="text-green-600">{templatesCount.competencies}C</span>
                              <span className="text-purple-600">{templatesCount.questions}Q</span>
                              <button
                                type="button"
                                onClick={clearSelectedTemplates}
                                className="text-red-500 hover:text-red-700 ml-1"
                                title="Clear selected templates"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTemplateTab('competencies')
                              setTemplateSearchQuery('')
                              setShowTemplatesModal(true)
                            }}
                            disabled={isGeneratingFullSection || isGeneratingSingleQuestion}
                            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                              isGeneratingFullSection || isGeneratingSingleQuestion
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Use competencies and questions from your previous jobs"
                          >
                            <Copy className="h-4 w-4" />
                            From Jobs
                          </button>
                          <button
                            type="button"
                            onClick={goToTemplates}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            Templates
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {isGeneratingFullSection ? (
                  /* Full section loading state */
                  <div className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <div className="space-y-2">
                        <p className="text-gray-900 font-medium">Generating competencies and interview questions</p>
                        <p className="text-gray-600 text-sm">
                          {isGeneratingCompetencies && !isGeneratingQuestions ? 'Creating competencies based on your job description...' :
                           !isGeneratingCompetencies && isGeneratingQuestions ? 'Crafting relevant interview questions for each competency...' :
                           'AI is analyzing your job requirements...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div ref={competenciesRef} className="space-y-6">
                    {formData.competencies.map((competency, index) => {
                    // Find the associated interview question for this competency
                    const associatedQuestion = formData.interviewQuestions.find(q => q.competencyId === competency.id) || 
                                             formData.interviewQuestions[index] // Fallback to index-based matching
                    
                    return (
                      <div key={competency.id} data-id={competency.id} className="competency-card border border-gray-200 rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="drag-handle cursor-move p-1 hover:bg-gray-100 rounded transition-colors" title="Drag to reorder">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>
                            <span className="text-sm font-semibold text-white bg-green-600 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                              Competency {index + 1}
                            </span>
                          </div>
                          {formData.competencies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCompetency(competency.id)}
                              disabled={isGeneratingSingleQuestion}
                              className="text-red-500 hover:text-red-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Competency Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={competency.name}
                              onChange={(e) => handleCompetencyChange(competency.id, 'name', e.target.value)}
                              disabled={isGeneratingSingleQuestion}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              onBlur={() => {
                                // Check if we should offer to update the question
                                if (competency.name.trim() && competency.description.trim() && !isGeneratingSingleQuestion) {
                                  const existingQuestion = formData.interviewQuestions.find(q => q.competencyId === competency.id)
                                  
                                  // Only show modal if there's already a question (don't interrupt new competency creation)
                                  if (existingQuestion && existingQuestion.question.trim()) {
                                    setPendingCompetencyUpdate(competency)
                                    setShowQuestionUpdateModal(true)
                                  } else if (!existingQuestion || !existingQuestion.question.trim()) {
                                    // Auto-generate if no question exists yet
                                    generateSingleQuestion(competency)
                                  }
                                }
                              }}
                              disabled={isGeneratingSingleQuestion}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="What does this competency measure?"
                            />
                          </div>
                        </div>

                        {/* Associated Interview Question */}
                        <div className="border-t border-gray-100 pt-4">
                          {isGeneratingSingleQuestion === competency.id ? (
                            // Loading state for question generation
                            <div className="flex items-center gap-3 py-8">
                              <div className="flex-shrink-0">
                                <span className="text-sm font-semibold text-white bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                                  🎥
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-purple-600">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm font-medium">Generating interview question...</span>
                                </div>
                                <div className="mt-2 bg-gray-100 rounded-md h-20 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">AI is crafting the perfect question for this competency</span>
                                </div>
                              </div>
                            </div>
                          ) : associatedQuestion ? (
                            // Normal question display
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <span className="text-sm font-semibold text-white bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                                  🎥
                                </span>
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Interview Question
                                </label>
                                <textarea
                                  required
                                  rows={3}
                                  value={associatedQuestion.question}
                                  onChange={(e) => handleQuestionChange(associatedQuestion.id, 'question', e.target.value)}
                                  disabled={isGeneratingSingleQuestion}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  placeholder="What question should candidates answer for this competency?"
                                />
                              </div>
                              <div className="flex-shrink-0 self-center">
                                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                                  <input
                                    type="text"
                                    value={associatedQuestion.timeLimit === 0 ? '' : Math.floor(associatedQuestion.timeLimit / 60)}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      // Allow typing anything, including empty
                                      if (value === '' || /^\d+$/.test(value)) {
                                        if (value === '') {
                                          // Allow empty display by setting to a temporary empty state
                                          handleQuestionChange(associatedQuestion.id, 'timeLimit', 0);
                                        } else {
                                          const minutes = parseInt(value);
                                          if (minutes > 0) {
                                            const totalSeconds = minutes * 60;
                                            handleQuestionChange(associatedQuestion.id, 'timeLimit', totalSeconds);
                                          }
                                        }
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const value = e.target.value;
                                      const minutes = parseInt(value);
                                      // Enforce limits when user finishes editing
                                      if (value === '' || isNaN(minutes) || minutes < 1) {
                                        handleQuestionChange(associatedQuestion.id, 'timeLimit', 180); // Default to 3 minutes
                                      } else if (minutes > 10) {
                                        handleQuestionChange(associatedQuestion.id, 'timeLimit', 600); // Cap at 10 minutes
                                      }
                                    }}
                                    disabled={isGeneratingSingleQuestion}
                                    placeholder="3"
                                    className="w-8 border-0 bg-transparent text-sm text-center focus:outline-none font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
                                    title="Minutes"
                                  />
                                  <span className="text-gray-500 text-sm font-medium">minutes</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Empty state when no question exists
                            <div className="flex items-center gap-3 py-4">
                              <div className="flex-shrink-0">
                                <span className="text-sm font-semibold text-white bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                                  🎥
                                </span>
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-500 text-sm">Complete the competency name and description to auto-generate an interview question</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {/* Left side - Add Competency (only show if competencies are visible) */}
            {shouldShowCompetencies && (
              <div>
                <button
                  type="button"
                  onClick={addCompetency}
                  disabled={isGeneratingSingleQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Add Competency
                </button>
              </div>
            )}
            
            {/* Right side - Navigation & Save buttons */}
            <div className="flex items-center gap-3">
              {/* Back button (show on step 2 for new jobs) */}
              {!isEditingJob && currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  disabled={isGeneratingSingleQuestion}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              
              {/* Save button (only show if we're on step 2 or editing) */}
              {shouldShowCompetencies && (
                <button
                  type="submit"
                  disabled={isGeneratingSingleQuestion}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {job ? 'Update Job' : 'Create Job'}
                </button>
              )}
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

      {/* Question Update Confirmation Modal */}
      {showQuestionUpdateModal && pendingCompetencyUpdate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleKeepExistingQuestion}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Update Interview Question?</h3>
                <p className="text-sm text-gray-600">You've updated the competency description</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {pendingCompetencyUpdate.name}
                </p>
                <p className="text-sm text-gray-600">
                  {pendingCompetencyUpdate.description}
                </p>
              </div>
              
              <p className="text-gray-700 text-sm">
                Would you like to generate a new interview question based on the updated description, or keep the existing question?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleKeepExistingQuestion}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Keep Existing Question
              </button>
              <button
                onClick={handleUpdateQuestion}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Update Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Copy className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                  <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    From Your Previous Jobs
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowTemplatesModal(false)
                    setTemplateSearchQuery('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTemplateTab === 'competencies' ? 'competencies' : 'questions'}...`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {templateSearchQuery && (
                    <button
                      onClick={() => setTemplateSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTemplateTab('competencies')}
                  className={`flex-1 px-4 py-2 font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                    activeTemplateTab === 'competencies'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                    C
                  </span>
                  Competencies ({getFilteredCompetencies().length})
                </button>
                <button
                  onClick={() => setActiveTemplateTab('questions')}
                  className={`flex-1 px-4 py-2 font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                    activeTemplateTab === 'questions'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                    Q
                  </span>
                  Questions ({getFilteredQuestions().length})
                </button>
              </div>

              {/* Content Area */}
              {activeTemplateTab === 'competencies' ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Click any competency to add it to your current job
                  </p>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredCompetencies().map((competency, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          addCompetencyFromTemplate(competency)
                          setShowTemplatesModal(false)
                          setTemplateSearchQuery('')
                        }}
                        className="w-full text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 group-hover:text-green-900 mb-1">
                              {competency.name}
                            </p>
                            <p className="text-sm text-gray-600 group-hover:text-green-700">
                              {competency.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                            <span className="bg-white px-2 py-1 rounded border">
                              {competency.fromJob}
                            </span>
                            <Plus className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </button>
                    ))}
                    {getFilteredCompetencies().length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-8">
                        {templateSearchQuery ? 'No matching competencies found' : 'No competencies found in your previous jobs'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Click any question to add it to your current job
                  </p>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredQuestions().map((question, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          addQuestionFromTemplate(question)
                          setShowTemplatesModal(false)
                          setTemplateSearchQuery('')
                        }}
                        className="w-full text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 group-hover:text-purple-900 leading-relaxed">
                              {question.question}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                            <span className="bg-white px-2 py-1 rounded border">
                              {Math.floor(question.timeLimit / 60)}m
                            </span>
                            <span className="bg-white px-2 py-1 rounded border text-xs">
                              {question.fromJob}
                            </span>
                            <Plus className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </button>
                    ))}
                    {getFilteredQuestions().length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-8">
                        {templateSearchQuery ? 'No matching questions found' : 'No questions found in your previous jobs'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTemplatesModal(false)
                    setTemplateSearchQuery('')
                  }}
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