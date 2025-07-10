'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  
  // Don't show header on login page
  const showHeader = pathname !== '/login'

  const handleAddCompany = () => {
    // This will be handled by the Header component
    // The Header component will redirect to the main page and trigger the add company form
    window.location.href = '/?add-company=true'
  }

  return (
    <>
      {showHeader && <Header onAddCompany={handleAddCompany} />}
      <main className={showHeader ? 'min-h-screen bg-gray-50' : ''}>
        {children}
      </main>
    </>
  )
} 