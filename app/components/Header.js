'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronDown, Settings, Plus, Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from './AuthProvider'

// HireSprint Logo Component (simplified for top bar)
const HireSprintLogo = () => (
  <div className="relative flex items-center">
    {/* Target/Bullseye Icon */}
    <svg width="32" height="32" viewBox="0 0 40 40" className="drop-shadow-sm mr-2">
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
    <div className="text-xl font-bold text-gray-900 tracking-tight">
      hiresprint
    </div>
  </div>
)

export default function Header({ onAddCompany, onToggleMobileMenu, isMobileMenuOpen }) {
  const [companies, setCompanies] = useState([])
  const [currentCompany, setCurrentCompany] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

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
    router.push(`/company/${company.id}`)
  }

  const handleLogout = () => {
    setShowDropdown(false)
    logout()
  }

  const handleSettings = () => {
    setShowDropdown(false)
    router.push('/settings')
  }

  const handleAddCompany = () => {
    setShowDropdown(false)
    if (onAddCompany) {
      onAddCompany()
    }
  }

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left side - Mobile menu button and logo */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Logo - Hidden on mobile when sidebar is open */}
        <div className={`md:block ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
          <HireSprintLogo />
        </div>
      </div>

      {/* Right side - Company dropdown */}
      <div className="flex items-center gap-4">
        {/* Company Dropdown */}
        {companies.length > 0 && currentCompany && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  {currentCompany.name}
                </span>
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
                        <p className="font-semibold text-gray-900">{currentCompany.name}</p>
                        <p className="text-xs text-gray-600 font-medium">Current company</p>
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
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 hover:bg-blue-50 transition-all duration-200 text-left focus:outline-none focus:bg-blue-50"
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
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 hover:text-green-700 transition-all duration-200 text-left focus:outline-none focus:bg-green-50"
                    >
                      <Plus className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                      <span className="text-gray-900">Add Company</span>
                    </button>

                    <button
                      onClick={handleSettings}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-all duration-200 text-left focus:outline-none focus:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Settings</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 hover:text-red-700 transition-all duration-200 text-left focus:outline-none focus:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-600" />
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
  )
} 