'use client'

import { useState } from 'react'
import { Edit, Trash2, Users, Calendar, FileText, Copy, Video, Check, ArrowRight } from 'lucide-react'

export default function JobsList({ jobs, onEditJob, onDeleteJob, onViewScorecard, onDuplicateJob }) {
  const [showLinkNotification, setShowLinkNotification] = useState(null)
  
  const handleGenerateJobInterviewLink = (job) => {
    // Only generate link if job has interview questions
    if (!job.interviewQuestions || job.interviewQuestions.length === 0) {
      alert('This job needs interview questions before generating an interview link.\n\nPlease edit the job and add questions in the Video Interview tab.')
      return
    }
    
    const jobInterviewLink = `${window.location.origin}/interview/job/${job.id}`
    
    // Copy to clipboard and show clean notification
    navigator.clipboard.writeText(jobInterviewLink).then(() => {
      setShowLinkNotification(job.id)
      setTimeout(() => setShowLinkNotification(null), 2000)
    }).catch(() => {
      // Fallback if clipboard doesn't work
      prompt(`🎥 Generic interview link for ${job.title}:\n\nCopy this link and send it to candidates:`, jobInterviewLink)
    })
  }
  if (jobs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">📋</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No jobs created yet</h3>
        <p className="text-lg text-gray-600">Create your first job to start evaluating candidates.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out transform">
          <div className="p-6">
            {/* Job Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{job.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{job.department}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.jobType}
                </span>
                <button
                  onClick={() => onViewScorecard(job)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 transform hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  title="View Candidates"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Job Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-400 mb-1">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{job.candidates?.length || 0}</div>
                <div className="text-xs text-gray-500">Candidates</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-400 mb-1">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{job.competencies?.length || 0}</div>
                <div className="text-xs text-gray-500">Skills</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{job.interviewQuestions?.length || 0}</div>
                <div className="text-xs text-gray-500">Questions</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => onEditJob(job)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-gray-200"
                title="Edit Job"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDuplicateJob(job)}
                className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-blue-200"
                title="Duplicate Job"
              >
                <Copy className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => handleGenerateJobInterviewLink(job)}
                  className="p-3 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-purple-200"
                  title="Generate Interview Link"
                >
                  <Video className="h-5 w-5" />
                </button>
                {showLinkNotification === job.id && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-lg animate-bounce flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Link copied!
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Delete this job? This action cannot be undone.')) {
                    onDeleteJob(job.id)
                  }
                }}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-red-200"
                title="Delete Job"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 