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
  Zap
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

          {/* Placeholder sections for other settings */}
          {activeSection === 'company' && renderPlaceholderSection(
            'Company Settings',
            'Configure your company profile, branding, and team management settings.'
          )}
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
    </div>
  )
} 