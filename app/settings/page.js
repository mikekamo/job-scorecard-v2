'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
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
  Plus,
  Mail,
  Smartphone,
  Monitor,
  Calendar,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  FileText,
  Lock,
  Users,
  HardDrive,
  Archive,
  Upload,
  RefreshCw,
  Key,
  Activity,
  Cookie,
  Fingerprint,
  Timer
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateUser } = useAuth()
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

  // Notifications state
  const [notificationsForm, setNotificationsForm] = useState({
    // Email Notifications
    emailEnabled: true,
    jobApplications: true,
    interviewScheduled: true,
    interviewReminders: true,
    candidateUpdates: true,
    teamUpdates: true,
    systemUpdates: true,
    marketingEmails: false,
    
    // Push Notifications
    pushEnabled: true,
    pushJobApplications: true,
    pushInterviewReminders: true,
    pushTeamUpdates: true,
    pushSystemAlerts: true,
    
    // In-App Notifications
    inAppEnabled: true,
    inAppJobApplications: true,
    inAppInterviewReminders: true,
    inAppTeamUpdates: true,
    inAppSystemAlerts: true,
    
    // Digest Settings
    dailyDigest: false,
    weeklyDigest: true,
    monthlyDigest: false,
    digestDay: 'monday',
    digestTime: '09:00',
    
    // Alert Settings
    criticalAlerts: true,
    performanceAlerts: true,
    securityAlerts: true,
    maintenanceAlerts: true,
    
    // Quiet Hours
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendQuietHours: true
  })

  // Data & Privacy state
  const [dataPrivacyForm, setDataPrivacyForm] = useState({
    // Data Export
    exportFormat: 'json',
    includePersonalData: true,
    includeJobData: true,
    includeCandidateData: true,
    includeInterviewData: true,
    
    // Privacy Controls
    profileVisibility: 'private',
    activityTracking: true,
    analyticsOptIn: true,
    marketingOptIn: false,
    thirdPartySharing: false,
    
    // Data Retention
    retentionPeriod: '2-years',
    autoDelete: false,
    candidateDataRetention: '1-year',
    
    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    passwordExpiry: 'never',
    
    // GDPR/Privacy Rights
    dataProcessingConsent: true,
    cookieConsent: true,
    rightToBeForgotten: false,
    dataPortability: true
  })

  // Data export state
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

        // Load user settings from authenticated user
        if (user) {
          setAccountForm(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || ''
          }))
        }
        
        // Load additional settings from localStorage
        const savedSettings = localStorage.getItem('user-settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setAccountForm(prev => ({ ...prev, ...settings }))
        }

        // Load notifications settings
        const savedNotifications = localStorage.getItem('notifications-settings')
        if (savedNotifications) {
          const notificationSettings = JSON.parse(savedNotifications)
          setNotificationsForm(prev => ({
            ...prev,
            ...notificationSettings
          }))
        }

        // Load data & privacy settings
        const savedDataPrivacy = localStorage.getItem('data-privacy-settings')
        if (savedDataPrivacy) {
          const dataPrivacySettings = JSON.parse(savedDataPrivacy)
          setDataPrivacyForm(prev => ({
            ...prev,
            ...dataPrivacySettings
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

      // Update user information in AuthProvider
      if (user) {
        updateUser({
          firstName: accountForm.firstName,
          lastName: accountForm.lastName,
          email: accountForm.email
        })
      }

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

  const handleNotificationsFormChange = (field, value) => {
    setNotificationsForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDataPrivacyFormChange = (field, value) => {
    setDataPrivacyForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      // Save notifications settings to localStorage
      localStorage.setItem('notifications-settings', JSON.stringify(notificationsForm))
      
      setSaveMessage('✅ Notifications settings saved successfully!')
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error saving notifications settings:', error)
      setSaveMessage('❌ Failed to save notifications settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDataPrivacy = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      // Save data & privacy settings to localStorage
      localStorage.setItem('data-privacy-settings', JSON.stringify(dataPrivacyForm))
      
      setSaveMessage('✅ Data & Privacy settings saved successfully!')
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error saving data & privacy settings:', error)
      setSaveMessage('❌ Failed to save data & privacy settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFullDataExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      // Simulate export progress
      const intervals = [20, 40, 60, 80, 100]
      for (const progress of intervals) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setExportProgress(progress)
      }
      
      // Collect all data
      const exportData = {
        timestamp: new Date().toISOString(),
        user: {
          firstName: accountForm.firstName,
          lastName: accountForm.lastName,
          email: accountForm.email,
          timezone: accountForm.timezone,
          language: accountForm.language,
          dateFormat: accountForm.dateFormat
        },
        company: currentCompany,
        jobs: JSON.parse(localStorage.getItem('scorecard-companies') || '[]'),
        teamMembers: JSON.parse(localStorage.getItem('team-members') || '[]'),
        notifications: JSON.parse(localStorage.getItem('notifications-settings') || '{}'),
        dataPrivacy: JSON.parse(localStorage.getItem('data-privacy-settings') || '{}')
      }
      
      // Filter data based on user selections
      const filteredData = {}
      if (dataPrivacyForm.includePersonalData) filteredData.user = exportData.user
      if (dataPrivacyForm.includeJobData) filteredData.jobs = exportData.jobs
      if (dataPrivacyForm.includeCandidateData) filteredData.teamMembers = exportData.teamMembers
      if (dataPrivacyForm.includeInterviewData) filteredData.notifications = exportData.notifications
      
      // Add metadata
      filteredData.metadata = {
        exportDate: exportData.timestamp,
        format: dataPrivacyForm.exportFormat,
        version: '1.0.0'
      }
      
      // Create and download file
      const filename = `hiresprint-data-export-${new Date().toISOString().split('T')[0]}.${dataPrivacyForm.exportFormat}`
      const dataStr = dataPrivacyForm.exportFormat === 'json' 
        ? JSON.stringify(filteredData, null, 2)
        : convertToCSV(filteredData)
      
      const dataBlob = new Blob([dataStr], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      
      setSaveMessage('✅ Data export completed successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
      
    } catch (error) {
      console.error('Error exporting data:', error)
      setSaveMessage('❌ Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const convertToCSV = (data) => {
    // Simple CSV conversion for demo purposes
    const rows = []
    rows.push(['Type', 'Data'])
    
    if (data.user) {
      rows.push(['User', JSON.stringify(data.user)])
    }
    if (data.jobs) {
      rows.push(['Jobs', JSON.stringify(data.jobs)])
    }
    if (data.teamMembers) {
      rows.push(['Team Members', JSON.stringify(data.teamMembers)])
    }
    
    return rows.map(row => row.join(',')).join('\n')
  }

  const handleDeleteAllData = async () => {
    try {
      // Clear all localStorage data
      const keysToDelete = [
        'scorecard-companies',
        'current-company-id',
        'user-settings',
        'team-members',
        'notifications-settings',
        'data-privacy-settings'
      ]
      
      keysToDelete.forEach(key => localStorage.removeItem(key))
      
      setSaveMessage('✅ All data has been permanently deleted!')
      setShowDeleteConfirm(false)
      
      // Reset forms to default
      setAccountForm({
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
      
      setTimeout(() => setSaveMessage(''), 3000)
      
    } catch (error) {
      console.error('Error deleting data:', error)
      setSaveMessage('❌ Failed to delete data. Please try again.')
    }
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
          {activeSection === 'notifications' && (
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
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    {/* Master Email Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Enable or disable all email notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.emailEnabled}
                          onChange={(e) => handleNotificationsFormChange('emailEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Individual Email Settings */}
                    {notificationsForm.emailEnabled && (
                      <div className="grid grid-cols-1 gap-4 ml-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Job Applications</p>
                            <p className="text-sm text-gray-500">When new applications are received</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.jobApplications}
                              onChange={(e) => handleNotificationsFormChange('jobApplications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Interview Scheduled</p>
                            <p className="text-sm text-gray-500">When interviews are scheduled or rescheduled</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.interviewScheduled}
                              onChange={(e) => handleNotificationsFormChange('interviewScheduled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Interview Reminders</p>
                            <p className="text-sm text-gray-500">Reminders before upcoming interviews</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.interviewReminders}
                              onChange={(e) => handleNotificationsFormChange('interviewReminders', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Candidate Updates</p>
                            <p className="text-sm text-gray-500">When candidates complete assessments or interviews</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.candidateUpdates}
                              onChange={(e) => handleNotificationsFormChange('candidateUpdates', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Team Updates</p>
                            <p className="text-sm text-gray-500">When team members are added or removed</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.teamUpdates}
                              onChange={(e) => handleNotificationsFormChange('teamUpdates', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">System Updates</p>
                            <p className="text-sm text-gray-500">Important system updates and announcements</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.systemUpdates}
                              onChange={(e) => handleNotificationsFormChange('systemUpdates', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Marketing Emails</p>
                            <p className="text-sm text-gray-500">Product updates and promotional content</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.marketingEmails}
                              onChange={(e) => handleNotificationsFormChange('marketingEmails', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    {/* Master Push Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Enable or disable all push notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.pushEnabled}
                          onChange={(e) => handleNotificationsFormChange('pushEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Individual Push Settings */}
                    {notificationsForm.pushEnabled && (
                      <div className="grid grid-cols-1 gap-4 ml-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Job Applications</p>
                            <p className="text-sm text-gray-500">Instant notifications for new applications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.pushJobApplications}
                              onChange={(e) => handleNotificationsFormChange('pushJobApplications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Interview Reminders</p>
                            <p className="text-sm text-gray-500">Reminders 30 minutes before interviews</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.pushInterviewReminders}
                              onChange={(e) => handleNotificationsFormChange('pushInterviewReminders', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Team Updates</p>
                            <p className="text-sm text-gray-500">Important team notifications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.pushTeamUpdates}
                              onChange={(e) => handleNotificationsFormChange('pushTeamUpdates', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">System Alerts</p>
                            <p className="text-sm text-gray-500">Critical system notifications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.pushSystemAlerts}
                              onChange={(e) => handleNotificationsFormChange('pushSystemAlerts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* In-App Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-purple-600" />
                    In-App Notifications
                  </h3>
                  <div className="space-y-4">
                    {/* Master In-App Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">In-App Notifications</p>
                        <p className="text-sm text-gray-500">Show notifications within the application</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.inAppEnabled}
                          onChange={(e) => handleNotificationsFormChange('inAppEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Individual In-App Settings */}
                    {notificationsForm.inAppEnabled && (
                      <div className="grid grid-cols-1 gap-4 ml-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Job Applications</p>
                            <p className="text-sm text-gray-500">Show banner notifications for new applications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.inAppJobApplications}
                              onChange={(e) => handleNotificationsFormChange('inAppJobApplications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Interview Reminders</p>
                            <p className="text-sm text-gray-500">Show reminders in the application</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.inAppInterviewReminders}
                              onChange={(e) => handleNotificationsFormChange('inAppInterviewReminders', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Team Updates</p>
                            <p className="text-sm text-gray-500">Show team notifications in the app</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.inAppTeamUpdates}
                              onChange={(e) => handleNotificationsFormChange('inAppTeamUpdates', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">System Alerts</p>
                            <p className="text-sm text-gray-500">Show system notifications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.inAppSystemAlerts}
                              onChange={(e) => handleNotificationsFormChange('inAppSystemAlerts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Digest Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Email Digests
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Daily Digest</p>
                          <p className="text-sm text-gray-500">Daily summary email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsForm.dailyDigest}
                            onChange={(e) => handleNotificationsFormChange('dailyDigest', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Weekly Digest</p>
                          <p className="text-sm text-gray-500">Weekly summary email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsForm.weeklyDigest}
                            onChange={(e) => handleNotificationsFormChange('weeklyDigest', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Monthly Digest</p>
                          <p className="text-sm text-gray-500">Monthly summary email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationsForm.monthlyDigest}
                            onChange={(e) => handleNotificationsFormChange('monthlyDigest', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Digest Timing */}
                    {(notificationsForm.dailyDigest || notificationsForm.weeklyDigest || notificationsForm.monthlyDigest) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Digest Day (for weekly/monthly)
                          </label>
                          <select
                            value={notificationsForm.digestDay}
                            onChange={(e) => handleNotificationsFormChange('digestDay', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Digest Time
                          </label>
                          <select
                            value={notificationsForm.digestTime}
                            onChange={(e) => handleNotificationsFormChange('digestTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="06:00">6:00 AM</option>
                            <option value="07:00">7:00 AM</option>
                            <option value="08:00">8:00 AM</option>
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                            <option value="17:00">5:00 PM</option>
                            <option value="18:00">6:00 PM</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alert Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Alert Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900">Critical Alerts</p>
                          <p className="text-sm text-gray-500">System failures and urgent issues</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.criticalAlerts}
                          onChange={(e) => handleNotificationsFormChange('criticalAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-gray-900">Performance Alerts</p>
                          <p className="text-sm text-gray-500">Performance issues and warnings</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.performanceAlerts}
                          onChange={(e) => handleNotificationsFormChange('performanceAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">Security Alerts</p>
                          <p className="text-sm text-gray-500">Security-related notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.securityAlerts}
                          onChange={(e) => handleNotificationsFormChange('securityAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Maintenance Alerts</p>
                          <p className="text-sm text-gray-500">Scheduled maintenance notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.maintenanceAlerts}
                          onChange={(e) => handleNotificationsFormChange('maintenanceAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-600" />
                    Quiet Hours
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Enable Quiet Hours</p>
                        <p className="text-sm text-gray-500">Disable non-critical notifications during specified hours</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsForm.quietHoursEnabled}
                          onChange={(e) => handleNotificationsFormChange('quietHoursEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {notificationsForm.quietHoursEnabled && (
                      <div className="ml-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quiet Hours Start
                            </label>
                            <input
                              type="time"
                              value={notificationsForm.quietHoursStart}
                              onChange={(e) => handleNotificationsFormChange('quietHoursStart', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quiet Hours End
                            </label>
                            <input
                              type="time"
                              value={notificationsForm.quietHoursEnd}
                              onChange={(e) => handleNotificationsFormChange('quietHoursEnd', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Weekend Quiet Hours</p>
                            <p className="text-sm text-gray-500">Apply quiet hours to weekends as well</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsForm.weekendQuietHours}
                              onChange={(e) => handleNotificationsFormChange('weekendQuietHours', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'integrations' && renderPlaceholderSection(
            'Integrations & API',
            'Connect with external tools and manage API access.'
          )}
          {activeSection === 'billing' && renderPlaceholderSection(
            'Billing & Subscription',
            'Manage your subscription plan and payment methods.'
          )}
          {activeSection === 'data' && (
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
                {/* Data Export */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    Data Export
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Export Your Data</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Download all your data in a structured format. This includes your personal information, 
                        job data, candidate information, and settings.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Export Format
                            </label>
                            <select
                              value={dataPrivacyForm.exportFormat}
                              onChange={(e) => handleDataPrivacyFormChange('exportFormat', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="json">JSON Format</option>
                              <option value="csv">CSV Format</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Data to Include
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Personal Data</p>
                                <p className="text-sm text-gray-500">Your profile and account information</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dataPrivacyForm.includePersonalData}
                                  onChange={(e) => handleDataPrivacyFormChange('includePersonalData', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Job Data</p>
                                <p className="text-sm text-gray-500">Job postings and requirements</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dataPrivacyForm.includeJobData}
                                  onChange={(e) => handleDataPrivacyFormChange('includeJobData', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Candidate Data</p>
                                <p className="text-sm text-gray-500">Candidate profiles and assessments</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dataPrivacyForm.includeCandidateData}
                                  onChange={(e) => handleDataPrivacyFormChange('includeCandidateData', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Interview Data</p>
                                <p className="text-sm text-gray-500">Interview recordings and feedback</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dataPrivacyForm.includeInterviewData}
                                  onChange={(e) => handleDataPrivacyFormChange('includeInterviewData', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Data will be exported in {dataPrivacyForm.exportFormat.toUpperCase()} format
                            </span>
                          </div>
                          <button
                            onClick={handleFullDataExport}
                            disabled={isExporting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                          >
                            {isExporting ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Exporting... {exportProgress}%
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                Export Data
                              </>
                            )}
                          </button>
                        </div>
                        
                        {isExporting && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${exportProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Controls */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    Privacy Controls
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Profile Visibility</p>
                          <p className="text-sm text-gray-500">Control who can see your profile</p>
                        </div>
                        <select
                          value={dataPrivacyForm.profileVisibility}
                          onChange={(e) => handleDataPrivacyFormChange('profileVisibility', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="private">Private</option>
                          <option value="team">Team Only</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Activity Tracking</p>
                          <p className="text-sm text-gray-500">Track your activity for analytics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.activityTracking}
                            onChange={(e) => handleDataPrivacyFormChange('activityTracking', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Analytics Opt-in</p>
                          <p className="text-sm text-gray-500">Help improve our service with usage data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.analyticsOptIn}
                            onChange={(e) => handleDataPrivacyFormChange('analyticsOptIn', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Third-party Sharing</p>
                          <p className="text-sm text-gray-500">Share data with integrated services</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.thirdPartySharing}
                            onChange={(e) => handleDataPrivacyFormChange('thirdPartySharing', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Archive className="h-5 w-5 text-orange-600" />
                    Data Retention
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          General Data Retention
                        </label>
                        <select
                          value={dataPrivacyForm.retentionPeriod}
                          onChange={(e) => handleDataPrivacyFormChange('retentionPeriod', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="6-months">6 Months</option>
                          <option value="1-year">1 Year</option>
                          <option value="2-years">2 Years</option>
                          <option value="5-years">5 Years</option>
                          <option value="indefinite">Indefinite</option>
                        </select>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Candidate Data Retention
                        </label>
                        <select
                          value={dataPrivacyForm.candidateDataRetention}
                          onChange={(e) => handleDataPrivacyFormChange('candidateDataRetention', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="6-months">6 Months</option>
                          <option value="1-year">1 Year</option>
                          <option value="2-years">2 Years</option>
                          <option value="3-years">3 Years</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Auto-delete Old Data</p>
                        <p className="text-sm text-gray-500">Automatically delete data after retention period</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dataPrivacyForm.autoDelete}
                          onChange={(e) => handleDataPrivacyFormChange('autoDelete', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Key className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Add extra security to your account</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.twoFactorAuth}
                            onChange={(e) => handleDataPrivacyFormChange('twoFactorAuth', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">Login Alerts</p>
                            <p className="text-sm text-gray-500">Get notified of suspicious logins</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.loginAlerts}
                            onChange={(e) => handleDataPrivacyFormChange('loginAlerts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry
                      </label>
                      <select
                        value={dataPrivacyForm.passwordExpiry}
                        onChange={(e) => handleDataPrivacyFormChange('passwordExpiry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="never">Never</option>
                        <option value="3-months">3 Months</option>
                        <option value="6-months">6 Months</option>
                        <option value="1-year">1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* GDPR & Privacy Rights */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-purple-600" />
                    GDPR & Privacy Rights
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">Data Processing Consent</p>
                            <p className="text-sm text-gray-500">Consent to process your data</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.dataProcessingConsent}
                            onChange={(e) => handleDataPrivacyFormChange('dataProcessingConsent', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Cookie className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-gray-900">Cookie Consent</p>
                            <p className="text-sm text-gray-500">Allow cookies for better experience</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.cookieConsent}
                            onChange={(e) => handleDataPrivacyFormChange('cookieConsent', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">Data Portability</p>
                            <p className="text-sm text-gray-500">Right to export your data</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dataPrivacyForm.dataPortability}
                            onChange={(e) => handleDataPrivacyFormChange('dataPortability', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Danger Zone
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Delete All Data</p>
                        <p className="text-sm text-red-700">
                          Permanently delete all your data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete All Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveDataPrivacy}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-medium text-red-900">Delete All Data</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to permanently delete all your data? This includes:
                </p>
                <ul className="text-sm text-gray-600 mb-6 space-y-1">
                  <li>• Personal profile information</li>
                  <li>• All job postings and requirements</li>
                  <li>• Candidate profiles and assessments</li>
                  <li>• Interview recordings and feedback</li>
                  <li>• Team member data</li>
                  <li>• Settings and preferences</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This action is irreversible and cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAllData}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>
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