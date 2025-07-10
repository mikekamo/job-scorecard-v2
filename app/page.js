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
  const [showDropdown, setShowDropdown] = useState(false)
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
  }, [])

  // Save companies to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('scorecard-companies', JSON.stringify(companies))
    }
  }, [companies, isLoading])

  // Save current company to localStorage
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('current-company-id', currentCompany.id)
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

  const switchToCompany = (company) => {
    setCurrentCompany(company)
    setShowDropdown(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    router.push('/login')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <HireSprintLogo />
                <div>
                  <p className="text-gray-600 mt-1">cut time, choose right</p>
                </div>
              </div>
            </div>
            {companies.length > 0 && currentCompany && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{currentCompany.name}</span>
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
                            <p className="font-medium text-gray-900">{currentCompany.name}</p>
                            <p className="text-xs text-gray-500">Current company</p>
                          </div>
                        </div>
                      </div>

                      {/* Other Companies */}
                      {companies.filter(c => c.id !== currentCompany.id).length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Switch to</p>
                          </div>
                          {companies.filter(c => c.id !== currentCompany.id).map((company) => (
                            <button
                              key={company.id}
                              onClick={() => switchToCompany(company)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                            >
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <Building2 className="h-3 w-3 text-gray-600" />
                              </div>
                              <span className="text-gray-900">{company.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div>
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowCreateForm(true)
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
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Create Company Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Company</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to hiresprint!</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first company to create AI-powered hiring scorecards</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                      <h3 className="font-semibold text-gray-900">{company.name}</h3>
                      {company.website && (
                        <p className="text-sm text-gray-500">{company.website}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editCompany(company)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit company"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCompany(company.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {company.description && (
                  <p className="text-gray-600 text-sm mb-4">{company.description}</p>
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
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
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
    </div>
  )
} 