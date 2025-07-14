'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home, Briefcase, Users, FileText, Settings } from 'lucide-react'

const routeConfig = {
  '/': {
    name: 'Dashboard',
    icon: Home
  },
  '/jobs': {
    name: 'Jobs',
    icon: Briefcase
  },
  '/candidates': {
    name: 'Candidates',
    icon: Users
  },
  '/templates': {
    name: 'Templates',
    icon: FileText
  },
  '/settings': {
    name: 'Settings',
    icon: Settings
  },
  '/interview': {
    name: 'Interview',
    icon: Briefcase,
    parent: '/'
  },
  '/candidate': {
    name: 'Candidate',
    icon: Users,
    parent: '/'
  }
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Always start with home
    breadcrumbs.push({
      name: 'Dashboard',
      href: '/',
      icon: Home,
      isActive: pathname === '/'
    })
    
    // If we're not on home page, add breadcrumbs based on path
    if (pathname !== '/') {
      let currentPath = ''
      
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`
        
        // Get route config for this path
        const routeKey = Object.keys(routeConfig).find(key => 
          currentPath.startsWith(key) && key !== '/'
        )
        
        if (routeKey) {
          const config = routeConfig[routeKey]
          const isLast = index === pathSegments.length - 1
          
          // Handle special cases
          if (segment === 'interview') {
            breadcrumbs.push({
              name: 'Interview',
              href: isLast ? null : currentPath,
              icon: Briefcase,
              isActive: isLast
            })
          } else if (segment === 'candidate') {
            breadcrumbs.push({
              name: 'Candidate',
              href: isLast ? null : currentPath,
              icon: Users,
              isActive: isLast
            })
          } else if (segment === 'job') {
            breadcrumbs.push({
              name: 'Job Details',
              href: isLast ? null : currentPath,
              icon: Briefcase,
              isActive: isLast
            })
          } else if (segment === 'templates') {
            breadcrumbs.push({
              name: 'Templates',
              href: isLast ? null : currentPath,
              icon: FileText,
              isActive: isLast
            })
          } else if (config) {
            breadcrumbs.push({
              name: config.name,
              href: isLast ? null : currentPath,
              icon: config.icon,
              isActive: isLast
            })
          }
        } else {
          // Handle dynamic segments like [id]
          const capitalizedSegment = segment.charAt(0).toUpperCase() + segment.slice(1)
          breadcrumbs.push({
            name: capitalizedSegment,
            href: null,
            icon: null,
            isActive: index === pathSegments.length - 1
          })
        }
      })
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  // Don't show breadcrumbs for home page only
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 px-6 py-3 bg-white border-b border-gray-200">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          )}
          
          <div className="flex items-center gap-1">
            {crumb.icon && (
              <crumb.icon className={`h-4 w-4 ${crumb.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            )}
            
            {crumb.href ? (
              <Link 
                href={crumb.href}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {crumb.name}
              </Link>
            ) : (
              <span className={`${crumb.isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {crumb.name}
              </span>
            )}
          </div>
        </div>
      ))}
    </nav>
  )
} 