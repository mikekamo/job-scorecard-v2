'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Edit, 
  Trash2,
  Copy,
  Eye,
  Star,
  Clock,
  Users,
  Briefcase,
  Target,
  MessageSquare,
  Save,
  X
} from 'lucide-react'

export default function TemplatesPage() {
  const router = useRouter()
  const [currentCompany, setCurrentCompany] = useState(null)
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'job',
    data: {}
  })

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'job', name: 'Job Templates', icon: Briefcase },
    { id: 'competency', name: 'Competency Frameworks', icon: Target },
    { id: 'questions', name: 'Interview Questions', icon: MessageSquare }
  ]

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
        }

        // Load templates
        const savedTemplates = localStorage.getItem('scorecard-templates')
        if (savedTemplates) {
          setTemplates(JSON.parse(savedTemplates))
        } else {
          // Create default templates
          const defaultTemplates = createDefaultTemplates()
          setTemplates(defaultTemplates)
          localStorage.setItem('scorecard-templates', JSON.stringify(defaultTemplates))
        }
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Create default templates
  const createDefaultTemplates = () => {
    return [
      {
        id: 'job-software-engineer',
        name: 'Software Engineer',
        description: 'Complete job template for software engineering positions',
        category: 'job',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          title: 'Software Engineer',
          description: 'We are looking for a skilled Software Engineer to join our development team. You will be responsible for designing, developing, and maintaining software applications.',
          competencies: [
            { id: '1', name: 'Technical Skills', description: 'Proficiency in programming languages, frameworks, and development tools', weight: 1 },
            { id: '2', name: 'Problem Solving', description: 'Ability to analyze complex problems and develop efficient solutions', weight: 1 },
            { id: '3', name: 'Code Quality', description: 'Writing clean, maintainable, and well-documented code', weight: 1 },
            { id: '4', name: 'Team Collaboration', description: 'Working effectively with cross-functional teams', weight: 1 },
            { id: '5', name: 'Continuous Learning', description: 'Staying updated with new technologies and best practices', weight: 1 }
          ],
          interviewQuestions: [
            { id: 'q1', question: 'Tell me about your experience with our tech stack and the projects you\'ve worked on.', timeLimit: 300, competencyId: '1' },
            { id: 'q2', question: 'Describe a challenging technical problem you solved and your approach to solving it.', timeLimit: 240, competencyId: '2' },
            { id: 'q3', question: 'How do you ensure code quality and maintainability in your projects?', timeLimit: 180, competencyId: '3' },
            { id: 'q4', question: 'Tell me about a time when you had to work closely with designers or product managers.', timeLimit: 180, competencyId: '4' },
            { id: 'q5', question: 'How do you stay current with new technologies and industry trends?', timeLimit: 180, competencyId: '5' }
          ]
        }
      },
      {
        id: 'competency-leadership',
        name: 'Leadership Competencies',
        description: 'Comprehensive leadership competency framework for management roles',
        category: 'competency',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          competencies: [
            { id: '1', name: 'Strategic Thinking', description: 'Ability to think long-term and align decisions with organizational goals', weight: 1 },
            { id: '2', name: 'Team Leadership', description: 'Leading and motivating teams to achieve exceptional results', weight: 1 },
            { id: '3', name: 'Communication', description: 'Clear and effective communication with all stakeholders', weight: 1 },
            { id: '4', name: 'Decision Making', description: 'Making informed decisions under pressure and uncertainty', weight: 1 },
            { id: '5', name: 'Change Management', description: 'Leading organizational change and adaptation', weight: 1 }
          ]
        }
      },
      {
        id: 'questions-behavioral',
        name: 'Behavioral Interview Questions',
        description: 'Set of behavioral questions for assessing soft skills and cultural fit',
        category: 'questions',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          questions: [
            { id: 'q1', question: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?', timeLimit: 240, competencyId: 'teamwork' },
            { id: 'q2', question: 'Describe a situation where you had to meet a tight deadline. How did you manage your time?', timeLimit: 180, competencyId: 'time-management' },
            { id: 'q3', question: 'Give me an example of when you had to adapt to a significant change at work.', timeLimit: 180, competencyId: 'adaptability' },
            { id: 'q4', question: 'Tell me about a time when you took initiative to improve a process or solve a problem.', timeLimit: 240, competencyId: 'initiative' },
            { id: 'q5', question: 'Describe a situation where you had to give constructive feedback to a colleague.', timeLimit: 180, competencyId: 'communication' }
          ]
        }
      },
      // Individual competency templates
      {
        id: 'competency-communication',
        name: 'Communication Skills',
        description: 'Evaluates verbal and written communication abilities',
        category: 'competency',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          competencies: [
            { id: '1', name: 'Communication Skills', description: 'Ability to communicate clearly and effectively in both verbal and written formats', weight: 1 }
          ]
        }
      },
      {
        id: 'competency-problem-solving',
        name: 'Problem Solving',
        description: 'Assesses analytical thinking and solution development',
        category: 'competency',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          competencies: [
            { id: '1', name: 'Problem Solving', description: 'Ability to identify problems, analyze situations, and develop effective solutions', weight: 1 }
          ]
        }
      },
      {
        id: 'competency-teamwork',
        name: 'Teamwork & Collaboration',
        description: 'Evaluates ability to work effectively with others',
        category: 'competency',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          competencies: [
            { id: '1', name: 'Teamwork & Collaboration', description: 'Works effectively with others to achieve common goals and contributes to team success', weight: 1 }
          ]
        }
      },
      // Individual question templates
      {
        id: 'question-technical-experience',
        name: 'Technical Experience Question',
        description: 'Explores candidate\'s technical background and expertise',
        category: 'questions',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          questions: [
            { id: 'q1', question: 'Walk me through your technical experience and the technologies you\'ve worked with most recently.', timeLimit: 300, competencyId: 'technical-skills' }
          ]
        }
      },
      {
        id: 'question-leadership-example',
        name: 'Leadership Example Question',
        description: 'Assesses leadership experience and approach',
        category: 'questions',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          questions: [
            { id: 'q1', question: 'Tell me about a time when you had to lead a team through a challenging project. What was your approach?', timeLimit: 240, competencyId: 'leadership' }
          ]
        }
      },
      {
        id: 'question-conflict-resolution',
        name: 'Conflict Resolution Question',
        description: 'Evaluates ability to handle workplace conflicts',
        category: 'questions',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        data: {
          questions: [
            { id: 'q1', question: 'Describe a time when you had to resolve a conflict with a colleague or team member. How did you handle it?', timeLimit: 180, competencyId: 'communication' }
          ]
        }
      }
    ]
  }

  // Save templates to localStorage
  const saveTemplates = (newTemplates) => {
    localStorage.setItem('scorecard-templates', JSON.stringify(newTemplates))
    setTemplates(newTemplates)
  }

  // Filter and sort templates
  const getFilteredTemplates = () => {
    let filtered = templates

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Sort templates
    filtered.sort((a, b) => {
      let valueA, valueB

      switch(sortBy) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'category':
          valueA = a.category.toLowerCase()
          valueB = b.category.toLowerCase()
          break
        case 'usage':
          valueA = a.usageCount || 0
          valueB = b.usageCount || 0
          break
        case 'date':
          valueA = new Date(a.createdAt || 0)
          valueB = new Date(b.createdAt || 0)
          break
        default:
          return 0
      }

      if (sortBy === 'name' || sortBy === 'category') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      } else {
        return sortOrder === 'asc' 
          ? valueA - valueB
          : valueB - valueA
      }
    })

    return filtered
  }

  // Create template from existing job
  const createTemplateFromJob = async () => {
    try {
      const savedJobs = localStorage.getItem('jobScorecards')
      if (!savedJobs) return

      const jobs = JSON.parse(savedJobs)
      const companyJobs = jobs.filter(job => job.companyId === currentCompany?.id)
      
      if (companyJobs.length === 0) {
        alert('No jobs found to create templates from. Create a job first.')
        return
      }

      // For now, just show the create modal
      setShowCreateModal(true)
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  // Use template to create new job
  const useTemplate = (template) => {
    if (!currentCompany) {
      alert('Please select a company first')
      return
    }

    // Update usage count
    const updatedTemplates = templates.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: (t.usageCount || 0) + 1 }
        : t
    )
    saveTemplates(updatedTemplates)

    if (template.category === 'job') {
      // For full job templates, navigate to job creation with template data
      const templateData = encodeURIComponent(JSON.stringify(template.data))
      router.push(`/company/${currentCompany.id}?add-job=true&template=${templateData}`)
    } else {
      // For individual competencies and questions, save to a temporary storage
      // that the JobForm can access when creating jobs
      const existingTemplateData = JSON.parse(localStorage.getItem('selected-templates') || '{"competencies": [], "questions": []}')
      
      if (template.category === 'competency' && template.data.competencies) {
        // Add competency to selected templates
        const newCompetency = {
          ...template.data.competencies[0],
          id: Date.now().toString(),
          fromTemplate: template.name
        }
        existingTemplateData.competencies.push(newCompetency)
        localStorage.setItem('selected-templates', JSON.stringify(existingTemplateData))
        
        alert(`✅ Competency "${template.name}" added to your selection.\n\nYou can now use it when creating jobs. Go to "New Job" to see your selected templates.`)
      } else if (template.category === 'questions' && template.data.questions) {
        // Add question to selected templates
        const newQuestion = {
          ...template.data.questions[0],
          id: Date.now().toString(),
          fromTemplate: template.name
        }
        existingTemplateData.questions.push(newQuestion)
        localStorage.setItem('selected-templates', JSON.stringify(existingTemplateData))
        
        alert(`✅ Question "${template.name}" added to your selection.\n\nYou can now use it when creating jobs. Go to "New Job" to see your selected templates.`)
      }
    }
  }

  // Delete template
  const deleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId)
      saveTemplates(updatedTemplates)
    }
  }

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  // Get template icon
  const getTemplateIcon = (template) => {
    const categoryInfo = getCategoryInfo(template.category)
    return categoryInfo.icon
  }

  // Handle creating new template
  const handleCreateTemplate = (e) => {
    e.preventDefault()
    if (!newTemplate.name || !newTemplate.category) {
      alert('Template name and type are required.')
      return
    }

    const newTemplateData = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      data: {}
    }

    if (newTemplate.category === 'competency') {
      newTemplateData.data.competencies = [{
        id: Date.now().toString(),
        name: newTemplate.competencyName || newTemplate.name,
        description: newTemplate.competencyDescription || newTemplate.description,
        weight: 1
      }]
    } else if (newTemplate.category === 'questions') {
      newTemplateData.data.questions = [{
        id: Date.now().toString(),
        question: newTemplate.question,
        timeLimit: newTemplate.timeLimit || 180,
        competencyId: 'general'
      }]
    }

    const updatedTemplates = [...templates, newTemplateData]
    saveTemplates(updatedTemplates)
    setShowCreateModal(false)
    setNewTemplate({ name: '', description: '', category: 'job', data: {} })
  }

  // Helper function to truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const filteredTemplates = getFilteredTemplates()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
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
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
                <p className="text-lg text-gray-600">
                  Reusable job templates, competency frameworks, and interview questions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </button>
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
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
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
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="category-asc">Category A-Z</option>
                <option value="category-desc">Category Z-A</option>
                <option value="usage-desc">Most Used</option>
                <option value="usage-asc">Least Used</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first template to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => {
              const Icon = getTemplateIcon(template)
              const categoryInfo = getCategoryInfo(template.category)
              
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition-all duration-200 h-[320px] flex flex-col"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-500">{categoryInfo.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4 flex-1">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {truncateText(template.description)}
                      </p>
                      {template.description && template.description.length > 120 && (
                        <p className="text-xs text-purple-600 mt-1 italic">
                          Click preview to read full description
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {template.usageCount || 0} uses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => useTemplate(template)}
                        className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowPreviewModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Template</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="e.g., Senior Developer, Leadership Skills"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <select
                    required
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="job">Job Template</option>
                    <option value="competency">Competency</option>
                    <option value="questions">Interview Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Brief description of this template..."
                  />
                </div>

                {/* Dynamic fields based on template type */}
                {newTemplate.category === 'competency' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competency Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTemplate.competencyName || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, competencyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="e.g., Problem Solving, Communication"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                      Competency Description *
                    </label>
                    <textarea
                      required
                      value={newTemplate.competencyDescription || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, competencyDescription: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="What this competency evaluates..."
                    />
                  </div>
                )}

                {newTemplate.category === 'questions' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Question *
                      </label>
                      <textarea
                        required
                        value={newTemplate.question || ''}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, question: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="The interview question to ask..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (seconds)
                      </label>
                      <input
                        type="number"
                        value={newTemplate.timeLimit || 180}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                        min="30"
                        max="600"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                  </>
                )}

                {newTemplate.category === 'job' && (
                  <div className="text-center py-4">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Job template creation from existing jobs will be available soon.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newTemplate.category === 'job'}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTemplate.name} - Preview
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {getCategoryInfo(selectedTemplate.category).name}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>
                
                {/* Template Data Preview */}
                <div className="space-y-4">
                  {selectedTemplate.data.title && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Job Title</h4>
                      <p className="text-gray-600">{selectedTemplate.data.title}</p>
                    </div>
                  )}
                  
                  {selectedTemplate.data.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{selectedTemplate.data.description}</p>
                    </div>
                  )}
                  
                  {selectedTemplate.data.competencies && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Competencies</h4>
                      <div className="space-y-2">
                        {selectedTemplate.data.competencies.map((comp, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <h5 className="font-medium text-gray-900">{comp.name}</h5>
                            <p className="text-sm text-gray-600">{comp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedTemplate.data.questions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Questions</h4>
                      <div className="space-y-2">
                        {selectedTemplate.data.questions.map((q, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-900">{q.question}</p>
                            {q.timeLimit && (
                              <p className="text-sm text-gray-500 mt-1">
                                Time limit: {q.timeLimit} seconds
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedTemplate.data.interviewQuestions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Interview Questions</h4>
                      <div className="space-y-2">
                        {selectedTemplate.data.interviewQuestions.map((q, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-900">{q.question}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Time limit: {q.timeLimit} seconds
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 