'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Trash2, 
  Save,
  Camera,
  Eye,
  EyeOff,
  Globe,
  Clock,
  Download,
  AlertTriangle,
  Building2,
  CreditCard,
  Database,
  Zap,
  Plus
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentCompany, setCurrentCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Get active section from URL parameters, default to 'account'
  const activeSection = searchParams.get('section') || 'account'

  // Form state for Account & Profile
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true
  })

  // Form state for Company Settings
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    description: '',
    website: '',
    logo: null,
    primaryColor: '#2563eb',
    secondaryColor: '#1f2937',
    departments: []
  })

  // Team members state
  const [teamMembers, setTeamMembers] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'recruiter',
    department: ''
  })

  // Departments state
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    manager: ''
  })

  const settingsSections = [
    {
      id: 'account',
      name: 'Account & Profile',
      icon: User,
      description: 'Personal information and preferences'
    },
    {
      id: 'company',
      name: 'Company Settings',
      icon: Building2,
      description: 'Company profile and team management'
    },
    {
      id: 'notifications',
      name: 'Notifications & Alerts',
      icon: Bell,
      description: 'Email and notification preferences'
    },
    {
      id: 'integrations',
      name: 'Integrations & API',
      icon: Zap,
      description: 'Connect with external tools'
    },
    {
      id: 'billing',
      name: 'Billing & Subscription',
      icon: CreditCard,
      description: 'Plan and payment management'
    },
    {
      id: 'data',
      name: 'Data & Privacy',
      icon: Database,
      description: 'Export, backup, and privacy settings'
    }
  ]

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' }
  ]

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' }
  ]

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Marketing',
    'Non-profit',
    'Government',
    'Other'
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ]

  const userRoles = [
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'recruiter', label: 'Recruiter', description: 'Manage jobs and candidates' },
    { value: 'interviewer', label: 'Interviewer', description: 'Conduct interviews and provide feedback' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' }
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

          // Load company settings
          if (currentComp) {
            setCompanyForm(prev => ({
              ...prev,
              companyName: currentComp.name || '',
              industry: currentComp.industry || '',
              companySize: currentComp.size || '',
              description: currentComp.description || '',
              website: currentComp.website || '',
              primaryColor: currentComp.primaryColor || '#2563eb',
              secondaryColor: currentComp.secondaryColor || '#1f2937',
              departments: currentComp.departments || []
            }))
          }
        }

        // Load user settings (for now, use mock data)
        const savedSettings = localStorage.getItem('user-settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setAccountForm(prev => ({ ...prev, ...settings }))
        } else {
          // Set default values
          setAccountForm(prev => ({
            ...prev,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          }))
        }

        // Load team members (mock data)
        const savedTeamMembers = localStorage.getItem('team-members')
        if (savedTeamMembers) {
          setTeamMembers(JSON.parse(savedTeamMembers))
        } else {
          // Set default team members
          const defaultTeamMembers = [
            {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              role: 'admin',
              department: 'Engineering',
              status: 'active',
              joinedAt: '2024-01-15'
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              role: 'recruiter',
              department: 'HR',
              status: 'active',
              joinedAt: '2024-02-01'
            }
          ]
          setTeamMembers(defaultTeamMembers)
          localStorage.setItem('team-members', JSON.stringify(defaultTeamMembers))
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAccountFormChange = (field, value) => {
    setAccountForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAccount = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      // Validate required fields
      if (!accountForm.firstName || !accountForm.lastName || !accountForm.email) {
        throw new Error('Please fill in all required fields')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(accountForm.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate password change if provided
      if (accountForm.newPassword) {
        if (!accountForm.currentPassword) {
          throw new Error('Current password is required to change password')
        }
        if (accountForm.newPassword !== accountForm.confirmPassword) {
          throw new Error('New passwords do not match')
        }
        if (accountForm.newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters long')
        }
      }

      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('user-settings', JSON.stringify(accountForm))

      // Clear password fields after successful save
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage(error.message)
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompanyFormChange = (field, value) => {
    setCompanyForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveCompany = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      // Validate required fields
      if (!companyForm.companyName) {
        throw new Error('Company name is required')
      }

      // Update company data
      const savedCompanies = JSON.parse(localStorage.getItem('scorecard-companies') || '[]')
      const updatedCompanies = savedCompanies.map(company => {
        if (company.id === currentCompany.id) {
          return {
            ...company,
            name: companyForm.companyName,
            industry: companyForm.industry,
            size: companyForm.companySize,
            description: companyForm.description,
            website: companyForm.website,
            primaryColor: companyForm.primaryColor,
            secondaryColor: companyForm.secondaryColor,
            departments: companyForm.departments
          }
        }
        return company
      })

      localStorage.setItem('scorecard-companies', JSON.stringify(updatedCompanies))

      // Update current company state
      const updatedCurrentCompany = updatedCompanies.find(c => c.id === currentCompany.id)
      setCurrentCompany(updatedCurrentCompany)

      // Trigger companies update event
      window.dispatchEvent(new Event('companiesUpdated'))

      setSaveMessage('Company settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage(error.message)
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInviteTeamMember = () => {
    if (!inviteForm.email || !inviteForm.role) {
      setSaveMessage('Please fill in all required fields')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    const newMember = {
      id: Date.now().toString(),
      name: inviteForm.email.split('@')[0],
      email: inviteForm.email,
      role: inviteForm.role,
      department: inviteForm.department || 'Unassigned',
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0]
    }

    const updatedTeamMembers = [...teamMembers, newMember]
    setTeamMembers(updatedTeamMembers)
    localStorage.setItem('team-members', JSON.stringify(updatedTeamMembers))

    setShowInviteModal(false)
    setInviteForm({ email: '', role: 'recruiter', department: '' })
    setSaveMessage('Team member invited successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleRemoveTeamMember = (memberId) => {
    const updatedTeamMembers = teamMembers.filter(member => member.id !== memberId)
    setTeamMembers(updatedTeamMembers)
    localStorage.setItem('team-members', JSON.stringify(updatedTeamMembers))
  }

  const handleAddDepartment = () => {
    if (!departmentForm.name) {
      setSaveMessage('Department name is required')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    const newDepartment = {
      id: Date.now().toString(),
      name: departmentForm.name,
      description: departmentForm.description,
      manager: departmentForm.manager,
      createdAt: new Date().toISOString().split('T')[0]
    }

    const updatedDepartments = [...companyForm.departments, newDepartment]
    setCompanyForm(prev => ({ ...prev, departments: updatedDepartments }))

    setShowDepartmentModal(false)
    setDepartmentForm({ name: '', description: '', manager: '' })
    setSaveMessage('Department added successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleRemoveDepartment = (departmentId) => {
    const updatedDepartments = companyForm.departments.filter(dept => dept.id !== departmentId)
    setCompanyForm(prev => ({ ...prev, departments: updatedDepartments }))
  }

  const getRoleLabel = (role) => {
    const roleInfo = userRoles.find(r => r.value === role)
    return roleInfo ? roleInfo.label : role
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      recruiter: 'bg-blue-100 text-blue-800',
      interviewer: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleExportData = () => {
    try {
      // In a real app, this would call an API
      const exportData = {
        profile: {
          firstName: accountForm.firstName,
          lastName: accountForm.lastName,
          email: accountForm.email,
          timezone: accountForm.timezone,
          language: accountForm.language,
          dateFormat: accountForm.dateFormat
        },
        preferences: {
          emailNotifications: accountForm.emailNotifications,
          pushNotifications: accountForm.pushNotifications,
          weeklyDigest: accountForm.weeklyDigest
        },
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API
      localStorage.removeItem('user-settings')
      localStorage.removeItem('scorecard-companies')
      localStorage.removeItem('current-company-id')
      router.push('/login')
    }
  }

  const renderPlaceholderSection = (sectionTitle, sectionDescription) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{sectionTitle}</h3>
        <p className="text-gray-600 mb-6">{sectionDescription}</p>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium">Coming Soon</p>
          <p>This section is under development and will be available in a future update.</p>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  const activeSettingsSection = settingsSections.find(s => s.id === activeSection)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              {activeSettingsSection && (
                <activeSettingsSection.icon className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeSettingsSection?.name || 'Settings'}
              </h1>
              <p className="text-lg text-gray-600">
                {activeSettingsSection?.description || 'Manage your account and application preferences'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {activeSection === 'account' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Save Message */}
              {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  saveMessage.includes('success') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}

              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={accountForm.firstName}
                        onChange={(e) => handleAccountFormChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={accountForm.lastName}
                        onChange={(e) => handleAccountFormChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => handleAccountFormChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="inline h-4 w-4 mr-1" />
                        Timezone
                      </label>
                      <select
                        value={accountForm.timezone}
                        onChange={(e) => handleAccountFormChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {timezones.map(tz => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={accountForm.language}
                        onChange={(e) => handleAccountFormChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {languages.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Date Format
                      </label>
                      <select
                        value={accountForm.dateFormat}
                        onChange={(e) => handleAccountFormChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {dateFormats.map(format => (
                          <option key={format.value} value={format.value}>{format.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <Shield className="inline h-5 w-5 mr-2" />
                    Password & Security
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={accountForm.currentPassword}
                          onChange={(e) => handleAccountFormChange('currentPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={accountForm.newPassword}
                          onChange={(e) => handleAccountFormChange('newPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={accountForm.confirmPassword}
                          onChange={(e) => handleAccountFormChange('confirmPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <Bell className="inline h-5 w-5 mr-2" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => handleAccountFormChange('emailNotifications', !accountForm.emailNotifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          accountForm.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          accountForm.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                        <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                      </div>
                      <button
                        onClick={() => handleAccountFormChange('pushNotifications', !accountForm.pushNotifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          accountForm.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          accountForm.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Weekly Digest</label>
                        <p className="text-sm text-gray-500">Receive weekly summary of your activity</p>
                      </div>
                      <button
                        onClick={() => handleAccountFormChange('weeklyDigest', !accountForm.weeklyDigest)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          accountForm.weeklyDigest ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          accountForm.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Management */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Export Data</label>
                        <p className="text-sm text-gray-500">Download a copy of your account data</p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <label className="text-sm font-medium text-red-700">Delete Account</label>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Company Settings */}
          {activeSection === 'company' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Save Message */}
              {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  saveMessage.includes('success') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}

              <div className="space-y-8">
                {/* Company Profile */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyForm.companyName}
                        onChange={(e) => handleCompanyFormChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={companyForm.industry}
                        onChange={(e) => handleCompanyFormChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Size
                      </label>
                      <select
                        value={companyForm.companySize}
                        onChange={(e) => handleCompanyFormChange('companySize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select company size</option>
                        {companySizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={companyForm.website}
                        onChange={(e) => handleCompanyFormChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://company.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Description
                      </label>
                      <textarea
                        rows={4}
                        value={companyForm.description}
                        onChange={(e) => handleCompanyFormChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your company..."
                      />
                    </div>
                  </div>
                </div>

                {/* Branding */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={companyForm.primaryColor}
                          onChange={(e) => handleCompanyFormChange('primaryColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                        />
                        <input
                          type="text"
                          value={companyForm.primaryColor}
                          onChange={(e) => handleCompanyFormChange('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={companyForm.secondaryColor}
                          onChange={(e) => handleCompanyFormChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                        />
                        <input
                          type="text"
                          value={companyForm.secondaryColor}
                          onChange={(e) => handleCompanyFormChange('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="#1f2937"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departments */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Departments</h3>
                    <button
                      onClick={() => setShowDepartmentModal(true)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Department
                    </button>
                  </div>
                  {companyForm.departments.length > 0 ? (
                    <div className="space-y-2">
                      {companyForm.departments.map(dept => (
                        <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{dept.name}</div>
                            {dept.description && (
                              <div className="text-sm text-gray-500">{dept.description}</div>
                            )}
                            {dept.manager && (
                              <div className="text-sm text-gray-500">Manager: {dept.manager}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveDepartment(dept.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No departments added yet</p>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Invite Member
                    </button>
                  </div>
                  <div className="space-y-3">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-blue-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            <div className="text-sm text-gray-500">
                              {member.department} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                          {member.status !== 'active' && (
                            <button
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveCompany}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications & Alerts */}
          {activeSection === 'notifications' && renderPlaceholderSection(
            'Notifications & Alerts',
            'Manage your notification preferences and alert settings.'
          )}
          {activeSection === 'integrations' && renderPlaceholderSection(
            'Integrations & API',
            'Connect with external tools and manage API access.'
          )}
          {activeSection === 'billing' && renderPlaceholderSection(
            'Billing & Subscription',
            'Manage your subscription plan and payment methods.'
          )}
          {activeSection === 'data' && renderPlaceholderSection(
            'Data & Privacy',
            'Control your data export, backup, and privacy settings.'
          )}
        </div>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Department</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Engineering, Sales, Marketing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the department..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  value={departmentForm.manager}
                  onChange={(e) => setDepartmentForm(prev => ({ ...prev, manager: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Department manager name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {userRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={inviteForm.department}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select department</option>
                  {companyForm.departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteTeamMember}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 