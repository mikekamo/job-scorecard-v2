'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentCompany, setCurrentCompany] = useState(null)
  
  // AUTHENTICATION TEMPORARILY DISABLED - Always show header and sidebar
  // BUT exclude navigation for candidate interview pages
  const isCandidate = pathname.startsWith('/interview/job/')
  const showHeader = !isCandidate
  const showSidebar = !isCandidate
  // const showHeader = pathname !== '/login'
  // const showSidebar = pathname !== '/login'

  // Load current company
  useEffect(() => {
    const loadCurrentCompany = () => {
      const savedCompanies = localStorage.getItem('scorecard-companies')
      const savedCurrentCompany = localStorage.getItem('current-company-id')
      
      if (savedCompanies) {
        const companiesData = JSON.parse(savedCompanies)
        
        if (savedCurrentCompany) {
          const currentComp = companiesData.find(c => c.id === savedCurrentCompany)
          if (currentComp) {
            setCurrentCompany(currentComp)
          } else if (companiesData.length > 0) {
            setCurrentCompany(companiesData[0])
          }
        } else if (companiesData.length > 0) {
          setCurrentCompany(companiesData[0])
        }
      }
    }

    loadCurrentCompany()

    // Listen for company changes
    const handleCompanyChange = () => {
      loadCurrentCompany()
    }

    window.addEventListener('companiesUpdated', handleCompanyChange)
    window.addEventListener('storage', handleCompanyChange)

    return () => {
      window.removeEventListener('companiesUpdated', handleCompanyChange)
      window.removeEventListener('storage', handleCompanyChange)
    }
  }, [])

  const handleAddCompany = () => {
    // This will be handled by the Header component
    // The Header component will redirect to the main page and trigger the add company form
    window.location.href = '/?add-company=true'
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
              currentCompany={currentCompany}
            />
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden">
            {/* Mobile sidebar backdrop */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleMobileMenu}
              />
            )}
            
            {/* Mobile sidebar */}
            <div className={`
              fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <Sidebar
                isCollapsed={false}
                onToggle={toggleMobileMenu}
                currentCompany={currentCompany}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        transition-all duration-300 ease-in-out
        ${showSidebar ? (isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''}
      `}>
        {/* Header */}
        {showHeader && (
          <Header 
            onAddCompany={handleAddCompany}
            onToggleMobileMenu={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        )}

        {/* Breadcrumbs */}
        {!isCandidate && <Breadcrumbs />}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 