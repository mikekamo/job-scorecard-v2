'use client'

import { Edit, Trash2, Users, Calendar, FileText, Copy } from 'lucide-react'

export default function JobsList({ jobs, onEditJob, onDeleteJob, onViewScorecard, onDuplicateJob }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs created yet</h3>
        <p className="mt-2 text-gray-500">Create your first job to start evaluating candidates.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competencies</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{job.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.department}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.candidates?.length || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.competencies?.length || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(job.dateCreated).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewScorecard(job)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onEditJob(job)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit Job"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateJob(job)}
                      className="text-blue-400 hover:text-blue-600"
                      title="Duplicate Job"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this job?')) {
                          onDeleteJob(job.id)
                        }
                      }}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 