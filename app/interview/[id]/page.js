'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

export default function InterviewPage() {
  const params = useParams()
  const [job, setJob] = useState(null)
  const [candidate, setCandidate] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [stream, setStream] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState(new Set())
  const [isRedoMode, setIsRedoMode] = useState(false)
  const [justUpdatedQuestion, setJustUpdatedQuestion] = useState(null)
  const [previousQuestionIndex, setPreviousQuestionIndex] = useState(null)
  const [skippedQuestions, setSkippedQuestions] = useState(new Set())
  
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!params?.id) return
    
    // Parse interview ID and load job/candidate data
    const interviewId = params.id
    const parts = interviewId.split('-')
    const jobId = parts[0]
    const candidateId = parts[1]
    
    console.log('🔍 Interview Debug - ID:', interviewId, 'JobID:', jobId, 'CandidateID:', candidateId)
    
    // Load from localStorage
    const savedJobs = localStorage.getItem('jobScorecards')
    if (savedJobs) {
      const jobs = JSON.parse(savedJobs)
      const foundJob = jobs.find(j => j.id === jobId)
      console.log('🔍 Found job:', foundJob ? foundJob.title : 'NOT FOUND')
      if (foundJob) {
        setJob(foundJob)
        const foundCandidate = foundJob.candidates?.find(c => c.id === candidateId)
        console.log('🔍 Found candidate:', foundCandidate ? foundCandidate.name : 'NOT FOUND')
        if (foundCandidate) {
          console.log('✅ Candidate set successfully:', foundCandidate.name)
          setCandidate(foundCandidate)
          
          // Check if candidate has existing video responses
          if (foundCandidate.videoResponses && foundCandidate.videoResponses.length > 0) {
            console.log('Found existing video responses for candidate:', foundCandidate.name)
            const completedQuestionIndices = new Set(foundCandidate.videoResponses.map(r => r.questionIndex))
            setCompletedQuestions(completedQuestionIndices)
            
            setTimeout(() => {
              const proceed = window.confirm(
                `Welcome back ${foundCandidate.name}!\n\n` +
                `You have previously completed ${foundCandidate.videoResponses.length} interview questions.\n\n` +
                `Click OK to REDO your interview (this will replace all previous responses)\n` +
                `Click Cancel to close this tab.`
              )
              if (!proceed) {
                window.close()
              }
            }, 1000)
          }
        }
      }
    }
  }, [params?.id])

  useEffect(() => {
    // Initialize camera
    if (job && candidate) {
      startCamera()
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [job, candidate])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { max: 1280 },   // Limit to 1280px width (720p/1080p)
          height: { max: 720 },   // Limit to 720px height  
          frameRate: { max: 30 }  // Limit to 30fps (instead of 60fps)
        }, 
        audio: {
          sampleRate: 44100,      // Standard audio quality
          channelCount: 2,        // Stereo
          echoCancellation: true, // Better audio quality
          noiseSuppression: true  // Better audio quality
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera and microphone. Please check your permissions.')
    }
  }

  const startRecording = () => {
    if (!stream) return

    const currentQuestion = job.interviewQuestions[currentQuestionIndex]
    setTimeLeft(currentQuestion.timeLimit)
    
    // Configure MediaRecorder with compression settings for smaller files
    const options = {
      videoBitsPerSecond: 1000000, // 1 Mbps (instead of default ~8-10 Mbps)
      audioBitsPerSecond: 128000,  // 128 kbps audio
    }
    
    // Prefer MP4 for better OpenAI Whisper compatibility
    const supportedTypes = [
      'video/mp4; codecs="avc1.42E01E,mp4a.40.2"', // H.264 + AAC (best for OpenAI)
      'video/mp4; codecs="h264"',
      'video/mp4',
      'video/webm; codecs="h264"', // WebM as fallback only
      'video/webm; codecs="vp9"', 
      'video/webm; codecs="vp8"',
      'video/webm'
    ]
    
    let selectedType = 'video/mp4' // Default to MP4
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedType = type
        break
      }
    }
    
    if (selectedType !== 'video/webm') {
      options.mimeType = selectedType
    }
    
    console.log('Recording with compression settings:', options)
    const recorder = new MediaRecorder(stream, options)
    const chunks = []

    recorder.ondataavailable = (event) => {
      chunks.push(event.data)
    }

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: selectedType })
      
      // Upload video to cloud storage
      const cloudUrl = await uploadVideoToCloud(blob, currentQuestionIndex)
      
      // Replace existing recording or add new one
      setRecordings(prev => {
        const newRecording = {
          questionIndex: currentQuestionIndex,
          question: currentQuestion.question,
          video: blob, // Keep local blob for immediate playback
          url: URL.createObjectURL(blob), // Local URL for immediate playback
          cloudUrl: cloudUrl, // Cloud URL for permanent storage
          timestamp: new Date().toISOString()
        }
        
        // Check if we already have a recording for this question
        const existingIndex = prev.findIndex(r => r.questionIndex === currentQuestionIndex)
        if (existingIndex !== -1) {
          // Replace existing recording
          const updated = [...prev]
          updated[existingIndex] = newRecording
          return updated
        } else {
          // Add new recording
          return [...prev, newRecording]
        }
      })
      
      // Mark question as completed and handle navigation
      setCompletedQuestions(prev => {
        const updated = new Set([...prev, currentQuestionIndex])
        
        if (isRedoMode) {
          // If we're in redo mode, show confirmation and navigate back to previous question
          setJustUpdatedQuestion(currentQuestionIndex)
          setIsRedoMode(false)
          
          // Clear the update notification after 3 seconds
          setTimeout(() => setJustUpdatedQuestion(null), 3000)
          
          // Navigate back to where they were before the redo
          if (previousQuestionIndex !== null) {
            setTimeout(() => {
              setCurrentQuestionIndex(previousQuestionIndex)
              setPreviousQuestionIndex(null)
            }, 1000) // Small delay to show the confirmation
          }
        } else {
          // Normal recording flow - navigate to next unanswered question
          const nextUnansweredIndex = job.interviewQuestions.findIndex((_, index) => 
            index > currentQuestionIndex && !updated.has(index)
          )
          
          if (nextUnansweredIndex !== -1) {
            // Move to next unanswered question
            setTimeout(() => setCurrentQuestionIndex(nextUnansweredIndex), 0)
          } else {
            // If no more unanswered questions after current, find the first unanswered question
            const firstUnansweredIndex = job.interviewQuestions.findIndex((_, index) => 
              !updated.has(index)
            )
            
            if (firstUnansweredIndex !== -1) {
              setTimeout(() => setCurrentQuestionIndex(firstUnansweredIndex), 0)
            }
            // If all questions are completed, stay on current question
          }
        }
        
        return updated
      })
    }

    recorder.start()
    setMediaRecorder(recorder)
    setIsRecording(true)

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          stopRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    // Prevent multiple calls to stopRecording
    if (!isRecording) return
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const navigateToQuestion = (questionIndex, isRedo = false) => {
    if (isRecording) {
      // Don't allow navigation while recording
      return
    }
    
    if (isRedo) {
      // Remember where we came from before doing the redo
      setPreviousQuestionIndex(currentQuestionIndex)
      setIsRedoMode(true)
      setJustUpdatedQuestion(null) // Clear any previous update notifications
    } else {
      setIsRedoMode(false)
      setPreviousQuestionIndex(null)
    }
    
    setCurrentQuestionIndex(questionIndex)
  }

  const finishInterview = async () => {
    console.log('🔍 FINISH INTERVIEW CALLED!')
    try {
      setIsComplete(true) // Show completion screen immediately
      await submitInterview() // This will handle the AI processing
      console.log('✅ INTERVIEW COMPLETED!')
    } catch (error) {
      console.error('❌ ERROR:', error.message)
      alert('There was an error saving your interview. Please try again.')
      setIsComplete(false) // Reset if there was an error
    }
  }

  // Skip a question (for optional questions)
  const skipQuestion = (questionIndex) => {
    if (!isRecording) {
      setSkippedQuestions(prev => new Set([...prev, questionIndex]))
      
      // Move to next question or complete interview
      if (questionIndex < job.interviewQuestions.length - 1) {
        setCurrentQuestionIndex(questionIndex + 1)
      } else {
        // This was the last question, check if we can finish
        const nextAllCompleted = completedQuestions.size + skippedQuestions.size + 1 === job.interviewQuestions.length
        if (nextAllCompleted) {
          // Auto-finish if all questions are now completed or skipped
          finishInterview()
        }
      }
    }
  }

  // Check if all questions are completed (answered or skipped)
  const allQuestionsCompleted = job?.interviewQuestions?.length === (completedQuestions.size + skippedQuestions.size)

  // Upload video to cloud storage
  const uploadVideoToCloud = async (videoBlob, questionIndex) => {
    try {
      const formData = new FormData()
      formData.append('video', videoBlob)
      formData.append('jobId', job.id)
      formData.append('candidateId', candidate.id)
      formData.append('questionIndex', questionIndex)

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Video upload failed:', error)
      return null
    }
  }

  // Automatic transcription and AI analysis function
  const runAutoAnalysis = async (job, candidate, videoResponses, jobs, jobIndex, candidateIndex) => {
    try {
      setIsProcessingAI(true)
      console.log('🎙️ Starting automatic transcription and AI analysis for:', candidate.name)
      
      // Check if job has competencies for AI analysis
      if (!job.competencies || job.competencies.length === 0) {
        console.log('⚠️ No competencies defined for this job, skipping AI analysis')
        return
      }
      
      // Prepare video responses for analysis
      const videoResponsesForAPI = videoResponses.map(recording => ({
        questionIndex: recording.questionIndex,
        question: recording.question,
        cloudUrl: recording.cloudUrl,
        timestamp: recording.timestamp || new Date().toISOString()
      }))
      
      console.log(`🎥 Processing ${videoResponsesForAPI.length} video responses for AI analysis`)
      
      // Call the analyze-transcript API (which will automatically transcribe videos)
      const analysisResponse = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competencies: job.competencies.map(comp => comp.name),
          videoResponses: videoResponsesForAPI,
          transcript: '' // Empty since we're providing video responses
        })
      })
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json()
        console.error('❌ AI analysis failed:', errorData.error)
        return
      }
      
      const analysisResult = await analysisResponse.json()
      console.log('✅ AI analysis completed successfully')
      
      // Convert competency names back to IDs for storage
      const aiScores = {}
      const explanations = {}
      
      job.competencies.forEach(comp => {
        if (analysisResult.scores && analysisResult.scores[comp.name]) {
          aiScores[comp.id] = analysisResult.scores[comp.name]
        }
        if (analysisResult.explanations && analysisResult.explanations[comp.name]) {
          explanations[comp.id] = analysisResult.explanations[comp.name]
        }
      })
      
      // Extract transcript from analysis if available (the API generates one during transcription)
      let transcript = ''
      if (analysisResult.transcript) {
        transcript = analysisResult.transcript
      } else {
        // Fallback: Generate a simple transcript from video responses
        transcript = videoResponsesForAPI.map((response, index) => 
          `Question ${index + 1}: ${response.question}\n[Video response recorded - transcript processed by AI]\n`
        ).join('\n')
      }
      
      // Update the candidate with AI results and transcript
      jobs[jobIndex].candidates[candidateIndex] = {
        ...jobs[jobIndex].candidates[candidateIndex],
        aiScores,
        explanations,
        transcript, // Store transcript for hiring team to review (legacy field)
        autoAnalyzedAt: new Date().toISOString()
      }
      
      // Also store transcript in the current interview object for the new interview format
      if (jobs[jobIndex].candidates[candidateIndex].interviews) {
        jobs[jobIndex].candidates[candidateIndex].interviews = jobs[jobIndex].candidates[candidateIndex].interviews.map(interview => {
          if (interview.type === 'video' && interview.videoResponses) {
            return {
              ...interview,
              transcript: transcript, // Store in interview object
              content: transcript // Also update content for display
            }
          }
          return interview
        })
      }
      
      console.log('🔍 AI Scores generated:', Object.keys(aiScores).length, 'competencies')
      
      // Save updated data to localStorage
      localStorage.setItem('jobScorecards', JSON.stringify(jobs))
      console.log('💾 Candidate updated with AI scores and explanations')
      
      // Sync to server
      try {
        const syncResponse = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobs)
        })
        if (syncResponse.ok) {
          console.log('✅ AI analysis results synced to server')
        } else {
          console.warn('⚠️ Failed to sync AI analysis to server')
        }
      } catch (syncError) {
        console.warn('⚠️ AI analysis sync failed:', syncError)
      }
      
    } catch (error) {
      console.error('❌ Auto analysis failed:', error)
      // Don't throw error - let the interview completion succeed even if AI analysis fails
    } finally {
      setIsProcessingAI(false)
    }
  }

  const submitInterview = async () => {
    console.log('🔍 SUBMIT INTERVIEW CALLED!', { candidate: candidate?.name, recordings: recordings.length })
    try {
      
      // Create video data, preferring file URLs over base64 conversion
      const videoResponses = recordings.map(recording => {
        // Always store the file URL if available (from local file storage or Vercel Blob)
        const response = {
          questionIndex: recording.questionIndex,
          question: recording.question,
          cloudUrl: recording.cloudUrl || null,
          timestamp: recording.timestamp || new Date().toISOString()
        }
        
        // Only add MIME type if we don't have a cloudUrl (for data URLs)
        if (!recording.cloudUrl && recording.video?.type) {
          response.mimeType = recording.video.type
        }
        
        console.log('Storing video response for question', recording.questionIndex, 
                   recording.cloudUrl ? 'with file URL' : 'without URL')
        
        return response
      })

      console.log('Submitting video data:', videoResponses)

      // Save to localStorage by updating the candidate
      const savedJobs = localStorage.getItem('jobScorecards')
      console.log('🔍 savedJobs found:', !!savedJobs)
      
      if (savedJobs) {
        const jobs = JSON.parse(savedJobs)
        console.log('🔍 Total jobs:', jobs.length)
        
        const jobIndex = jobs.findIndex(j => j.id === job.id)
        console.log('🔍 Job found at index:', jobIndex)
        
        if (jobIndex !== -1) {
          const candidatesCount = jobs[jobIndex].candidates?.length || 0
          console.log('🔍 Candidates in job:', candidatesCount)
          
          const candidateIndex = jobs[jobIndex].candidates?.findIndex(c => c.id === candidate.id)
          console.log('🔍 Candidate found at index:', candidateIndex)
          console.log('🔍 Looking for candidate ID:', candidate.id)
          console.log('🔍 Candidates in localStorage:', jobs[jobIndex].candidates?.map(c => ({ id: c.id, name: c.name })))
          
          if (candidateIndex !== -1) {
            // COMPLETELY REPLACE previous video responses (delete old, save new)
            jobs[jobIndex].candidates[candidateIndex].videoResponses = videoResponses
            jobs[jobIndex].candidates[candidateIndex].interviewCompletedAt = new Date().toISOString()
            jobs[jobIndex].candidates[candidateIndex].lastInterviewDate = new Date().toISOString()
            
            // Mark candidate as new so they appear on the candidates page with "NEW" indicator
            jobs[jobIndex].candidates[candidateIndex].isNew = true
            jobs[jobIndex].candidates[candidateIndex].newInterviewAt = new Date().toISOString()
            
            // Clear any previous interview session data
            if (jobs[jobIndex].candidates[candidateIndex].previousInterviewSessions) {
              delete jobs[jobIndex].candidates[candidateIndex].previousInterviewSessions
            }
            
            // Save back to localStorage (safe now - no blob objects)
            try {
              console.log('🔍 Saving to localStorage...', { 
                videoResponsesCount: videoResponses.length,
                candidateName: candidate?.name,
                candidateId: candidate?.id,
                totalJobsCount: jobs.length,
                totalCandidatesInJob: jobs[jobIndex].candidates?.length
              })
              localStorage.setItem('jobScorecards', JSON.stringify(jobs))
              console.log('✅ Interview completed successfully for candidate:', candidate?.name, '- Previous responses replaced')
              console.log('🔍 Candidate data saved:', {
                name: jobs[jobIndex].candidates[candidateIndex].name,
                id: jobs[jobIndex].candidates[candidateIndex].id,
                isNew: jobs[jobIndex].candidates[candidateIndex].isNew,
                videoResponsesCount: jobs[jobIndex].candidates[candidateIndex].videoResponses?.length
              })
              
              // Sync to server to ensure data persistence
              try {
                console.log('🔄 Syncing to server...')
                const response = await fetch('/api/data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(jobs)
                })
                if (response.ok) {
                  console.log('✅ Data synced to server successfully')
                } else {
                  console.warn('⚠️ Server sync failed, but localStorage saved successfully')
                }
              } catch (syncError) {
                console.warn('⚠️ Server sync failed, but localStorage saved successfully:', syncError)
              }
              
              // Automatically transcribe videos and run AI analysis
              console.log('🤖 Starting automatic transcription and AI analysis...')
              await runAutoAnalysis(jobs[jobIndex], jobs[jobIndex].candidates[candidateIndex], videoResponses, jobs, jobIndex, candidateIndex)
            } catch (storageError) {
              console.error('❌ Failed to save to localStorage:', storageError)
              throw new Error('Failed to save interview data to storage')
            }
          } else {
            // Try to reload data from localStorage and try again
            console.log('🔍 Candidate not found, reloading localStorage data...')
            const freshJobs = localStorage.getItem('jobScorecards')
            if (freshJobs) {
              const freshJobsData = JSON.parse(freshJobs)
              console.log('🔍 Fresh data - total jobs:', freshJobsData.length)
              const freshJob = freshJobsData.find(j => j.id === job.id)
              if (freshJob) {
                console.log('🔍 Fresh job found, candidates count:', freshJob.candidates?.length || 0)
                console.log('🔍 Fresh job candidates:', freshJob.candidates?.map(c => ({ id: c.id, name: c.name })))
                const freshCandidate = freshJob.candidates?.find(c => c.id === candidate.id)
                if (freshCandidate) {
                  console.log('🔍 Found candidate in fresh data, retrying...')
                  // Update the jobs array with fresh data and retry
                  jobs[jobIndex] = freshJob
                  const retryIndex = jobs[jobIndex].candidates.findIndex(c => c.id === candidate.id)
                  if (retryIndex !== -1) {
                    jobs[jobIndex].candidates[retryIndex].videoResponses = videoResponses
                    jobs[jobIndex].candidates[retryIndex].interviewCompletedAt = new Date().toISOString()
                    jobs[jobIndex].candidates[retryIndex].lastInterviewDate = new Date().toISOString()
                    jobs[jobIndex].candidates[retryIndex].isNew = true
                    jobs[jobIndex].candidates[retryIndex].newInterviewAt = new Date().toISOString()
                    
                    if (jobs[jobIndex].candidates[retryIndex].previousInterviewSessions) {
                      delete jobs[jobIndex].candidates[retryIndex].previousInterviewSessions
                    }
                    
                    localStorage.setItem('jobScorecards', JSON.stringify(jobs))
                    console.log('✅ Interview saved successfully after retry')
                    
                    // Sync to server
                    try {
                      console.log('🔄 Syncing retry to server...')
                      const response = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(jobs)
                      })
                      if (response.ok) {
                        console.log('✅ Retry data synced to server successfully')
                      } else {
                        console.warn('⚠️ Retry server sync failed')
                      }
                    } catch (syncError) {
                      console.warn('⚠️ Retry server sync failed:', syncError)
                    }
                    
                    // Automatically transcribe videos and run AI analysis
                    console.log('🤖 Starting automatic transcription and AI analysis (retry)...')
                    await runAutoAnalysis(jobs[jobIndex], jobs[jobIndex].candidates[retryIndex], videoResponses, jobs, jobIndex, retryIndex)
                  } else {
                    throw new Error('Candidate not found even after reload')
                  }
                } else {
                  // If candidate is still not found, create it directly during submission
                  console.log('🔍 Candidate not found in fresh data, creating candidate directly...')
                  const newCandidate = {
                    id: candidate.id,
                    name: candidate.name,
                    email: candidate.email || '',
                    notes: candidate.notes || 'Added via generic interview link',
                    transcript: '',
                    scores: {},
                    dateAdded: new Date().toISOString(),
                    videoResponses: videoResponses,
                    interviewCompletedAt: new Date().toISOString(),
                    lastInterviewDate: new Date().toISOString(),
                    isNew: true,
                    newInterviewAt: new Date().toISOString()
                  }
                  
                  // Add the candidate to the job and save
                  freshJob.candidates = freshJob.candidates || []
                  freshJob.candidates.push(newCandidate)
                  jobs[jobIndex] = freshJob
                  localStorage.setItem('jobScorecards', JSON.stringify(jobs))
                  console.log('✅ Interview saved successfully after creating candidate directly')
                  
                  // Automatically transcribe videos and run AI analysis
                  console.log('🤖 Starting automatic transcription and AI analysis (new candidate)...')
                  const newCandidateIndex = freshJob.candidates.length - 1
                  await runAutoAnalysis(jobs[jobIndex], newCandidate, videoResponses, jobs, jobIndex, newCandidateIndex)
                  
                  // Sync to server
                  try {
                    console.log('🔄 Syncing new candidate to server...')
                    const response = await fetch('/api/data', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(jobs)
                    })
                    if (response.ok) {
                      console.log('✅ New candidate data synced to server successfully')
                    } else {
                      console.warn('⚠️ New candidate server sync failed')
                    }
                  } catch (syncError) {
                    console.warn('⚠️ New candidate server sync failed:', syncError)
                  }
                }
              } else {
                throw new Error('Job not found in fresh data')
              }
            } else {
              throw new Error('No fresh data found')
            }
          }
        } else {
          throw new Error('Job not found')
        }
      } else {
        throw new Error('No saved jobs found')
      }
    } catch (error) {
      console.error('❌ Error submitting interview:', error)
      console.error('❌ Error details:', error.message, error.stack)
      throw error // Re-throw so finishInterview can handle it
    }
  }

  if (!job || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Interview...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-8xl mb-8">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Interview Complete!</h1>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Thank you <span className="font-semibold text-blue-700">{candidate.name}</span>! You've successfully completed your video interview for the <strong className="text-blue-700">{job.title}</strong> position.
          </p>
          
          {isProcessingAI ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-lg font-semibold text-blue-900">AI Analysis in Progress</h3>
              </div>
              <p className="text-blue-700 text-sm">
                🎙️ Transcribing your video responses and running AI competency analysis...
              </p>
              <p className="text-blue-600 text-xs mt-2">
                This process typically takes 1-2 minutes. You can safely close this tab.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-200 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900">AI Analysis Complete</h3>
              </div>
              <p className="text-green-700 text-sm">
                ✨ Your responses have been automatically transcribed and analyzed for competency scoring.
              </p>
            </div>
          )}
          
          <p className="text-gray-600">
            Please allow some time for us to review your interview and we will be in touch!
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = job.interviewQuestions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Interview</h1>
          <p className="text-lg text-gray-600">
            {job.title} • {candidate.name}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {job.interviewQuestions.length}
            </span>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / job.interviewQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Redo Mode Alert */}
        {isRedoMode && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-orange-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-orange-800">Redoing Question {currentQuestionIndex + 1}</h3>
                <p className="text-sm text-orange-700">Your previous response will be replaced when you record a new answer.</p>
              </div>
            </div>
          </div>
        )}

        

        {/* Update Confirmation */}
        {justUpdatedQuestion !== null && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-800">Response Updated!</h3>
                <p className="text-sm text-green-700">
                  Your new response for Question {justUpdatedQuestion + 1} has been saved.
                  {previousQuestionIndex !== null && (
                    <span> Taking you back to where you were...</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Video Left, Controls Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    REC {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              
              {/* Compression Info */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Video optimized for transcription (720p MP4, H.264/AAC)</span>
              </div>
            </div>

            {/* Current Question */}
            <div className={`rounded-lg shadow-lg p-6 mt-6 ${
              isRedoMode 
                ? 'bg-orange-50 border-2 border-orange-200' 
                : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isRedoMode ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {isRedoMode ? `🔄 Redoing Question ${currentQuestionIndex + 1}` : `Question ${currentQuestionIndex + 1}`}
                {currentQuestion.isOptional && (
                  <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Optional
                  </span>
                )}
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                {currentQuestion.question}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Time limit: {Math.floor(currentQuestion.timeLimit / 60)}:{(currentQuestion.timeLimit % 60).toString().padStart(2, '0')}
                </span>
                {currentQuestion.isOptional && (
                  <span className="text-sm text-blue-600 font-medium">
                    💡 You can skip this question
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Controls & Status */}
          <div className="space-y-6">
            {/* Recording Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recording Question {currentQuestionIndex + 1}
              </h3>
              {!isRecording ? (
                <div className="space-y-3">
                  <button
                    onClick={startRecording}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    {completedQuestions.has(currentQuestionIndex) ? 'Redo Answer' : 'Start Recording'}
                  </button>
                  
                  {/* Skip button for optional questions */}
                  {currentQuestion.isOptional && (
                    <button
                      onClick={() => skipQuestion(currentQuestionIndex)}
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <span>⏭️</span>
                      Skip This Question
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-medium"
                >
                  Stop Recording
                </button>
              )}
            </div>

            {/* Finish Interview Button */}
            {allQuestionsCompleted && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Interview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You've answered all questions! Review your responses above or finish your interview.
                </p>
                <button
                  onClick={finishInterview}
                  disabled={isRecording}
                  className={`w-full px-6 py-4 rounded-lg font-medium ${
                    isRecording
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  🎉 Finish Interview
                </button>
              </div>
            )}

            {/* Question Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-3">
                {job.interviewQuestions.map((question, index) => {
                  const isCompleted = recordings.some(r => r.questionIndex === index)
                  const isSkipped = skippedQuestions.has(index)
                  const isCurrent = index === currentQuestionIndex
                  
                  // Find the furthest completed or skipped question
                  const furthestCompleted = Math.max(-1, ...Array.from(completedQuestions), ...Array.from(skippedQuestions))
                  
                  // Only show questions up to furthest completed + 1
                  if (index > furthestCompleted + 1) {
                    return null
                  }
                  
                  // A question is available if it's the next one after the furthest completed
                  const isNextAvailable = !isCompleted && !isSkipped && !isCurrent && index === furthestCompleted + 1
                  
                                      return (
                      <div 
                        key={index} 
                        onClick={() => {
                          if (!isRecording && (isCompleted || isNextAvailable)) {
                            navigateToQuestion(index, false)
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isCurrent
                            ? 'bg-blue-50 border-blue-400 shadow-md' 
                            : isCompleted
                              ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                              : isSkipped
                                ? 'bg-yellow-50 border-yellow-200 opacity-75'
                                : isNextAvailable
                                  ? 'bg-gray-50 border-gray-200 hover:bg-blue-50 cursor-pointer opacity-75'
                                  : 'bg-gray-50 border-gray-200 opacity-50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${
                          isCurrent 
                            ? 'text-blue-800' 
                            : isCompleted
                              ? 'text-gray-700'
                              : isSkipped
                                ? 'text-yellow-700'
                                : isNextAvailable
                                  ? 'text-blue-700'
                                  : 'text-gray-500'
                        }`}>
                          Question {index + 1}
                        </span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          isCurrent
                            ? 'text-blue-700 bg-blue-100'
                            : isCompleted 
                              ? 'text-gray-600 bg-gray-100'
                              : isSkipped
                                ? 'text-yellow-700 bg-yellow-100'
                                : isNextAvailable
                                  ? 'text-blue-600 bg-blue-50'
                                  : 'text-gray-400 bg-gray-100'
                        }`}>
                          {isCurrent 
                            ? '📹 Current'
                            : isCompleted 
                              ? '✅ Completed' 
                              : isSkipped
                                ? '⏭️ Skipped'
                                : isNextAvailable
                                  ? '▶️ Available'
                                  : '⏳ Pending'
                          }
                        </span>
                      </div>
                      <p className={`text-xs mb-2 line-clamp-2 ${
                        isCompleted || isCurrent 
                          ? 'text-gray-600' 
                          : isSkipped
                            ? 'text-yellow-600'
                            : isNextAvailable
                              ? 'text-blue-600'
                              : 'text-gray-500'
                      }`}>
                        {question.question.length > 60 
                          ? question.question.substring(0, 60) + '...' 
                          : question.question
                        }
                      </p>
                      {isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent triggering the div's onClick
                            navigateToQuestion(index, true)
                          }}
                          disabled={isRecording}
                          className={`w-full text-xs px-3 py-2 rounded font-medium transition-colors ${
                            isRecording 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isCurrent
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                          title="Redo this response"
                        >
                          🔄 Redo Response
                        </button>
                      )}
                      {isNextAvailable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent triggering the div's onClick
                            navigateToQuestion(index, false)
                          }}
                          disabled={isRecording}
                          className={`w-full text-xs px-3 py-2 rounded font-medium transition-colors ${
                            isRecording 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                          }`}
                          title="Continue to this question"
                        >
                          ▶️ Continue Here
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 