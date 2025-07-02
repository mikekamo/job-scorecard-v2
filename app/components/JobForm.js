'use client'

import { useState } from 'react'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'

export default function JobForm({ job, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    department: job?.department || '',
    description: job?.description || '',
    competencies: job?.competencies || [
      { id: '1', name: 'Technical Skills', description: 'Proficiency in required technical skills', weight: 1 },
      { id: '2', name: 'Communication', description: 'Verbal and written communication abilities', weight: 1 },
      { id: '3', name: 'Problem Solving', description: 'Ability to analyze and solve complex problems', weight: 1 },
      { id: '4', name: 'Team Collaboration', description: 'Works well with others and contributes to team success', weight: 1 },
      { id: '5', name: 'Cultural Fit', description: 'Aligns with company values and culture', weight: 1 }
    ]
  })


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCompetencyChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.map(comp =>
        comp.id === id ? { ...comp, [field]: value } : comp
      )
    }))
  }

  const addCompetency = () => {
    const newCompetency = {
      id: Date.now().toString(),
      name: '',
      description: '',
      weight: 1
    }
    setFormData(prev => ({
      ...prev,
      competencies: [...prev.competencies, newCompetency]
    }))
  }

  const removeCompetency = (id) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.filter(comp => comp.id !== id)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Call the save function
    onSave(formData)
    
    // If updating an existing job, go back to the jobs list
    if (job) {
      onCancel() // This takes us back to the jobs page
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            {/* Basic Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the role and responsibilities..."
              />
            </div>

            {/* Competencies Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Competencies</h3>
                <button
                  type="button"
                  onClick={addCompetency}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Competency
                </button>
              </div>

              <div className="space-y-4">
                {formData.competencies.map((competency, index) => (
                  <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Competency {index + 1}
                      </span>
                      {formData.competencies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompetency(competency.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={competency.name}
                          onChange={(e) => handleCompetencyChange(competency.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Competency name"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={competency.description}
                          onChange={(e) => handleCompetencyChange(competency.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="What does this competency measure?"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 