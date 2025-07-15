'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ['/login']
  
  // Check if current route is a candidate interview route
  const isCandidateRoute = pathname.startsWith('/interview/job/') || (pathname.startsWith('/interview/') && pathname !== '/interview')

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = localStorage.getItem('current-user')
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && !hasRedirected) {
      const isPublicRoute = publicRoutes.includes(pathname) || isCandidateRoute
      
      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access a protected route
        setHasRedirected(true)
        router.push('/login')
      } else if (user && pathname === '/login') {
        // User is authenticated but on the login page
        setHasRedirected(true)
        router.push('/')
      }
    }
  }, [user, isLoading, pathname, router, hasRedirected])

  // Reset redirect flag when pathname changes
  useEffect(() => {
    setHasRedirected(false)
  }, [pathname])

  const login = (userData) => {
    localStorage.setItem('current-user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('current-user')
    setUser(null)
    setHasRedirected(false)
    router.push('/login')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    localStorage.setItem('current-user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  // Loading screen
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

  // Don't render children if user is not authenticated and on a protected route
  const isPublicRoute = publicRoutes.includes(pathname) || isCandidateRoute
  if (!user && !isPublicRoute) {
    return null // This will prevent flash of content before redirect
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
} 