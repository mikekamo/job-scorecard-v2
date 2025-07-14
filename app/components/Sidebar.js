'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Building2,
  User,
  Shield,
  Bell,
  CreditCard,
  Database,
  Zap
} from 'lucide-react'

const navigationItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and quick actions',
    matchPaths: ['/']
  },
  {
    id: 'jobs',
    name: 'Jobs',
    href: '/',
    icon: Briefcase,
    description: 'Manage job positions',
    matchPaths: ['/', '/interview']
  },
  {
    id: 'candidates',
    name: 'Candidates',
    href: '/candidates',
    icon: Users,
    description: 'View candidate profiles',
    matchPaths: ['/candidate', '/candidates']
  },
  // Templates temporarily hidden for simplicity
  /*
  {
    id: 'templates',
    name: 'Templates',
    href: '/templates',
    icon: FileText,
    description: 'Job and competency templates',
    matchPaths: ['/templates']
  },
  */
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App configuration',
    matchPaths: ['/settings'],
    hasDropdown: true,
    dropdownItems: [
      {
        id: 'account',
        name: 'Account & Profile',
        description: 'Personal information and preferences',
        icon: User,
        href: '/settings?section=account'
      },
      {
        id: 'company',
        name: 'Company Settings',
        description: 'Company profile and team management',
        icon: Building2,
        href: '/settings?section=company'
      },
      {
        id: 'notifications',
        name: 'Notifications & Alerts',
        description: 'Email and notification preferences',
        icon: Bell,
        href: '/settings?section=notifications'
      },
      {
        id: 'integrations',
        name: 'Integrations & API',
        description: 'Connect with external tools',
        icon: Zap,
        href: '/settings?section=integrations'
      },
      {
        id: 'billing',
        name: 'Billing & Subscription',
        description: 'Plan and payment management',
        icon: CreditCard,
        href: '/settings?section=billing'
      },
      {
        id: 'data',
        name: 'Data & Privacy',
        description: 'Export, backup, and privacy settings',
        icon: Database,
        href: '/settings?section=data'
      }
    ]
  }
]

export default function Sidebar({ isCollapsed, onToggle, currentCompany }) {
  const pathname = usePathname()
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [expandedDropdown, setExpandedDropdown] = useState(null)

  const isActiveRoute = (item) => {
    // Handle special cases
    if (item.id === 'dashboard' && pathname === '/') {
      return true
    }
    
    if (item.id === 'jobs') {
      // Jobs is active for home page and interview pages
      return pathname === '/' || pathname.startsWith('/interview')
    }
    
    if (item.id === 'candidates') {
      // Candidates is active for candidate pages
      return pathname.startsWith('/candidate')
    }
    
    // For settings, check if we're on the settings page
    if (item.id === 'settings') {
      return pathname.startsWith('/settings')
    }
    
    // For other routes, check if pathname starts with any match path
    return item.matchPaths.some(path => {
      if (path === '/') return pathname === '/'
      return pathname.startsWith(path)
    })
  }

  const handleNavigation = (item) => {
    if (item.hasDropdown) {
      // Toggle dropdown instead of navigating
      setExpandedDropdown(expandedDropdown === item.id ? null : item.id)
    } else if (item.id === 'jobs' || item.id === 'dashboard') {
      router.push('/')
    } else if (item.id === 'candidates') {
      router.push('/candidates')
    } else if (item.id === 'settings') {
      router.push('/settings')
    } else {
      router.push(item.href)
    }
  }

  const handleDropdownItemClick = (item) => {
    router.push(item.href)
    setExpandedDropdown(null) // Close dropdown after selection
  }

  const handleAddJob = () => {
    if (currentCompany) {
      // Redirect to company page with add-job parameter
      router.push(`/company/${currentCompany.id}?add-job=true`)
    } else {
      // No company selected, redirect to main page to create a company first
      router.push('/?add-company=true')
    }
  }

  // Close dropdown when clicking outside or when route changes
  useEffect(() => {
    setExpandedDropdown(null)
  }, [pathname])

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-30
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {currentCompany?.name || 'No Company'}
              </p>
              <p className="text-xs text-gray-500">Workspace</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleAddJob}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
            transition-all duration-200 hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-200
            ${isCollapsed ? 'justify-center' : 'justify-start'}
            touch-manipulation
          `}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="font-medium">New Job</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item)
          const isDropdownExpanded = expandedDropdown === item.id
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleNavigation(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 text-left
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  touch-manipulation
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1">{item.name}</span>
                    {item.hasDropdown && (
                      <div className="ml-auto">
                        {isDropdownExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Dropdown Items */}
              {!isCollapsed && item.hasDropdown && isDropdownExpanded && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.dropdownItems.map((dropdownItem) => {
                    const DropdownIcon = dropdownItem.icon
                    return (
                      <button
                        key={dropdownItem.id}
                        onClick={() => handleDropdownItemClick(dropdownItem)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm
                          text-gray-600 hover:bg-gray-50 hover:text-gray-900 
                          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <DropdownIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium">{dropdownItem.name}</div>
                          <div className="text-xs text-gray-500">{dropdownItem.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Tooltip for collapsed sidebar */}
              {isCollapsed && hoveredItem === item.id && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                  <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`
          flex items-center gap-3 text-xs text-gray-500
          ${isCollapsed ? 'justify-center' : 'justify-start'}
        `}>
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">H</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-medium text-gray-700">HireSprint</p>
              <p className="text-gray-500">v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 