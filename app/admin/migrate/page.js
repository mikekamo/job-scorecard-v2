'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function MigrationPage() {
  const [migrationStatus, setMigrationStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Check migration status on load
  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      const response = await fetch('/api/migrate-to-blob')
      const data = await response.json()
      setMigrationStatus(data)
    } catch (error) {
      console.error('Error checking migration status:', error)
      setError('Failed to check migration status')
    }
  }

  const runMigration = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/migrate-to-blob', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        console.log('Migration successful:', data)
      } else {
        throw new Error(data.error || 'Migration failed')
      }
    } catch (error) {
      console.error('Migration error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const testServerStorage = async () => {
    try {
      const response = await fetch('/api/data')
      const data = await response.json()
      
      if (response.ok) {
        alert(`✅ Server storage working! Found ${data.length} jobs.`)
      } else {
        alert(`❌ Server storage failed: ${data.error}`)
      }
    } catch (error) {
      alert(`❌ Server storage error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Migration to Vercel Blob
          </h1>
          <p className="text-gray-600 mb-8">
            Migrate your job scorecard data from file storage to Vercel Blob for production deployment.
          </p>

          {/* Status Check */}
          {migrationStatus && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Migration Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {migrationStatus.hasLocalData ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>
                    Local data file: {migrationStatus.hasLocalData ? 
                      `Found (${migrationStatus.localJobCount} jobs)` : 
                      'Not found'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {migrationStatus.hasBlobToken ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>
                    Vercel Blob configured: {migrationStatus.hasBlobToken ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {migrationStatus.ready ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>
                    Ready to migrate: {migrationStatus.ready ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Migration Actions */}
          <div className="space-y-4">
            <button
              onClick={runMigration}
              disabled={isLoading || !migrationStatus?.ready}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading || !migrationStatus?.ready
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Migrate Data to Vercel Blob
                </>
              )}
            </button>

            <button
              onClick={testServerStorage}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Test Server Storage
            </button>
          </div>

          {/* Results */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Migration Failed</span>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Migration Successful!</span>
              </div>
              <p className="text-green-700 mt-2">{result.message}</p>
              <div className="mt-3 space-y-1 text-sm text-green-600">
                <div>Jobs migrated: {result.jobCount}</div>
                <div>Blob URL: <a href={result.blobUrl} target="_blank" rel="noopener noreferrer" className="underline">{result.blobUrl}</a></div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Instructions:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Make sure you have your <code className="bg-gray-200 px-1 rounded">BLOB_READ_WRITE_TOKEN</code> environment variable set in Vercel</li>
              <li>2. Run the migration to transfer your data to Vercel Blob storage</li>
              <li>3. Test the server storage to make sure it's working</li>
              <li>4. Deploy to Vercel - your app will now use blob storage in production</li>
              <li>5. Your interview links will work properly on the live site</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 