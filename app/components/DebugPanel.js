'use client'

import React, { useState, useEffect } from 'react'
import { Eye, Download, Upload, Trash2 } from 'lucide-react'

export default function DebugPanel() {
  const [localStorageData, setLocalStorageData] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  const refreshLocalStorage = () => {
    const data = localStorage.getItem('jobScorecards')
    setLocalStorageData(data)
  }

  useEffect(() => {
    refreshLocalStorage()
  }, [])

  const exportBackup = () => {
    const data = localStorage.getItem('jobScorecards')
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-scorecards-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert('No data found in localStorage to backup')
    }
  }

  const importBackup = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target.result
          JSON.parse(data) // Validate JSON
          localStorage.setItem('jobScorecards', data)
          refreshLocalStorage()
          alert('Backup restored successfully! Please refresh the page.')
        } catch (error) {
          alert('Invalid backup file format')
        }
      }
      reader.readAsText(file)
    }
  }

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
      localStorage.removeItem('jobScorecards')
      refreshLocalStorage()
      alert('Data cleared. Please refresh the page.')
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
          title="Debug Panel"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Debug Panel</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LocalStorage Status:
          </label>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {localStorageData ? (
              <>
                <div>✅ Data found ({localStorageData.length} characters)</div>
                <div>Jobs: {JSON.parse(localStorageData).length || 0}</div>
              </>
            ) : (
              <div>❌ No data found</div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportBackup}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Backup
          </button>
          
          <label className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center gap-1 cursor-pointer">
            <Upload className="h-3 w-3" />
            Restore
            <input
              type="file"
              accept=".json"
              onChange={importBackup}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refreshLocalStorage}
            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
          >
            Refresh
          </button>
          
          <button
            onClick={clearLocalStorage}
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>
    </div>
  )
} 