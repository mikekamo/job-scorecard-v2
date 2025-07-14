'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Users, Briefcase, Building2, ArrowRight, ChevronDown, Settings, LogOut } from 'lucide-react'

// HireSprint Logo Component
const HireSprintLogo = () => (
  <div className="relative flex items-center">
    {/* Target/Bullseye Icon */}
    <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-sm mr-3">
      {/* Outer circle */}
      <circle 
        cx="20" 
        cy="20" 
        r="18" 
        fill="none" 
        stroke="#1f2937" 
        strokeWidth="2"
      />
      
      {/* Middle circle */}
      <circle 
        cx="20" 
        cy="20" 
        r="12" 
        fill="none" 
        stroke="#1f2937" 
        strokeWidth="2"
      />
      
      {/* Inner circle */}
      <circle 
        cx="20" 
        cy="20" 
        r="6" 
        fill="none" 
        stroke="#1f2937" 
        strokeWidth="2"
      />
      
      {/* Center dot */}
      <circle 
        cx="20" 
        cy="20" 
        r="2" 
        fill="#1f2937"
      />
      
      {/* Crosshairs */}
      <line x1="20" y1="2" x2="20" y2="8" stroke="#1f2937" strokeWidth="2" />
      <line x1="20" y1="32" x2="20" y2="38" stroke="#1f2937" strokeWidth="2" />
      <line x1="2" y1="20" x2="8" y2="20" stroke="#1f2937" strokeWidth="2" />
      <line x1="32" y1="20" x2="38" y2="20" stroke="#1f2937" strokeWidth="2" />
    </svg>
    
    {/* HireSprint Text */}
    <div className="text-2xl font-bold text-gray-900 tracking-tight">
      hiresprint
    </div>
    
    {/* Subtle animation */}
    <style jsx>{`
      svg {
        transition: transform 0.2s ease;
      }
      .relative:hover svg {
        transform: scale(1.05);
      }
    `}</style>
  </div>
)

export default function Home() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [currentCompany, setCurrentCompany] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load companies from localStorage
  useEffect(() => {
    try {
      const savedCompanies = localStorage.getItem('scorecard-companies')
      const savedCurrentCompany = localStorage.getItem('current-company-id')
      
      if (savedCompanies) {
        const parsedCompanies = JSON.parse(savedCompanies)
        setCompanies(parsedCompanies)
        
        // Set current company
        if (savedCurrentCompany) {
          const currentComp = parsedCompanies.find(c => c.id === savedCurrentCompany)
          if (currentComp) {
            setCurrentCompany(currentComp)
          } else if (parsedCompanies.length > 0) {
            setCurrentCompany(parsedCompanies[0])
          }
        } else if (parsedCompanies.length > 0) {
          setCurrentCompany(parsedCompanies[0])
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setIsLoading(false)
    }
    
    // Check for add-company URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('add-company') === 'true') {
      setShowCreateForm(true)
      // Remove the parameter from URL
      window.history.replaceState({}, '', '/')
    }
  }, [])

  // Save companies to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('scorecard-companies', JSON.stringify(companies))
      // Dispatch custom event to update header
      window.dispatchEvent(new CustomEvent('companiesUpdated'))
    }
  }, [companies, isLoading])

  // Save current company to localStorage
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('current-company-id', currentCompany.id)
      // Dispatch custom event to update header
      window.dispatchEvent(new CustomEvent('companiesUpdated'))
    }
  }, [currentCompany])

  // Update current company when companies list changes
  useEffect(() => {
    if (currentCompany && companies.length > 0) {
      const updatedCurrentCompany = companies.find(c => c.id === currentCompany.id)
      if (updatedCurrentCompany) {
        setCurrentCompany(updatedCurrentCompany)
      }
    }
  }, [companies])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newCompany = {
      id: Date.now().toString(),
      name: formData.name,
      website: formData.website,
      description: formData.description,
      dateCreated: new Date().toISOString(),
      jobCount: 0
    }

    setCompanies([...companies, newCompany])
    setCurrentCompany(newCompany) // Set new company as current
    setFormData({ name: '', website: '', description: '' })
    setShowCreateForm(false)
  }

  const deleteCompany = (companyId) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated jobs.')) {
      const updatedCompanies = companies.filter(company => company.id !== companyId)
      setCompanies(updatedCompanies)
      
      // If current company is deleted, switch to another one or clear
      if (currentCompany && currentCompany.id === companyId) {
        if (updatedCompanies.length > 0) {
          setCurrentCompany(updatedCompanies[0])
        } else {
          setCurrentCompany(null)
          localStorage.removeItem('current-company-id')
        }
      }
      
      // Also clean up jobs for this company
      try {
        const savedJobs = localStorage.getItem('jobScorecards')
        if (savedJobs) {
          const jobs = JSON.parse(savedJobs)
          const filteredJobs = jobs.filter(job => job.companyId !== companyId)
          localStorage.setItem('jobScorecards', JSON.stringify(filteredJobs))
        }
      } catch (error) {
        console.error('Error cleaning up jobs:', error)
      }
    }
  }

  const editCompany = (company) => {
    setFormData({
      name: company.name,
      website: company.website || '',
      description: company.description || ''
    })
    setShowCreateForm(true)
    // Note: In a real app, you'd handle edit vs create differently
  }

  const goToCompanyJobs = (companyId) => {
    router.push(`/company/${companyId}`)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Create Company Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Company</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://acme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the company..."
                  />
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    Add Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Welcome to hiresprint!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">Get started by adding your first company to create AI-powered hiring scorecards</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Plus className="h-5 w-5" />
              Add Company
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                      {company.website && (
                        <p className="text-sm text-blue-600 hover:text-blue-800 transition-colors">{company.website}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editCompany(company)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-gray-200"
                      title="Edit company"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCompany(company.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-red-200"
                      title="Delete company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {company.description && (
                  <p className="text-gray-600 text-base mb-6 leading-relaxed">{company.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {company.jobCount || 0} jobs
                    </span>
                  </div>
                  <button
                    onClick={() => goToCompanyJobs(company.id)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 transform"
                  >
                    Manage Jobs
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  )
} 