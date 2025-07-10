'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronDown, Settings, LogOut, Plus } from 'lucide-react'

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

export default function Header({ onAddCompany }) {
  const [companies, setCompanies] = useState([])
  const [currentCompany, setCurrentCompany] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  // Load companies and current company from localStorage
  useEffect(() => {
    const loadCompanies = () => {
      const savedCompanies = localStorage.getItem('scorecard-companies')
      const savedCurrentCompany = localStorage.getItem('current-company-id')
      
      if (savedCompanies) {
        const companiesData = JSON.parse(savedCompanies)
        setCompanies(companiesData)
        
        if (savedCurrentCompany) {
          const currentComp = companiesData.find(c => c.id === savedCurrentCompany)
          if (currentComp) {
            setCurrentCompany(currentComp)
          } else if (companiesData.length > 0) {
            setCurrentCompany(companiesData[0])
            localStorage.setItem('current-company-id', companiesData[0].id)
          }
        } else if (companiesData.length > 0) {
          setCurrentCompany(companiesData[0])
          localStorage.setItem('current-company-id', companiesData[0].id)
        }
      }
    }

    loadCompanies()

    // Listen for storage changes to update header when companies are modified
    const handleStorageChange = (e) => {
      if (e.key === 'scorecard-companies' || e.key === 'current-company-id') {
        loadCompanies()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from the same tab
    const handleCustomEvent = () => {
      loadCompanies()
    }

    window.addEventListener('companiesUpdated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('companiesUpdated', handleCustomEvent)
    }
  }, [])

  const switchToCompany = (company) => {
    setCurrentCompany(company)
    localStorage.setItem('current-company-id', company.id)
    setShowDropdown(false)
    router.push('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('scorecard-companies')
    localStorage.removeItem('current-company-id')
    localStorage.removeItem('auth-token')
    router.push('/login')
  }

  const handleAddCompany = () => {
    setShowDropdown(false)
    if (onAddCompany) {
      onAddCompany()
    }
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <HireSprintLogo />
            <div>
              <p className="text-gray-600 mt-1">save time, choose right</p>
            </div>
          </div>

          {/* Company Dropdown */}
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
                        onClick={handleAddCompany}
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
  )
} 