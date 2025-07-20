'use client'

import { useState, useEffect } from 'react'
import vocabularyData from '../data/vocabulary.json'

type AnswerLevel = 'perfect' | 'good' | 'acceptable' | 'incorrect'
type HintLevel = 'semantic' | 'structural' | 'discovery'
type QuestionStatus = 'unanswered' | 'answered' | 'passed' | 'needs_retry'

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [answerLevel, setAnswerLevel] = useState<AnswerLevel | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [showLearningModal, setShowLearningModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userAnswerNote, setUserAnswerNote] = useState('')
  
  // Hint system state
  const [hintsUsed, setHintsUsed] = useState<HintLevel[]>([])
  const [showHints, setShowHints] = useState(false)

  // Simplified state management
  const [questionOrder, setQuestionOrder] = useState<number[]>([])
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({})
  const [isInitialized, setIsInitialized] = useState(false)

  // Get questions for today based on date
  const getQuestionsForToday = () => {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    
    // Use day of year to determine which 5 questions to show
    const totalQuestions = vocabularyData.length
    const questionsPerDay = 5
    
    // Create a deterministic order based on the day
    const startIndex = (dayOfYear * questionsPerDay) % totalQuestions
    const selectedQuestions = []
    
    for (let i = 0; i < questionsPerDay; i++) {
      const questionIndex = (startIndex + i) % totalQuestions
      selectedQuestions.push(questionIndex)
    }
    
    console.log('Questions for today:', {
      dayOfYear,
      startIndex,
      selectedQuestions
    })
    
    return selectedQuestions
  }

  // Initialize question order and statuses
  useEffect(() => {
    const todayQuestions = getQuestionsForToday()
    console.log('Initializing questions:', todayQuestions)
    setQuestionOrder(todayQuestions)
    setCurrentQuestionIndex(0)
    
    // Initialize all question statuses as unanswered
    const initialStatuses: Record<number, QuestionStatus> = {}
    todayQuestions.forEach(id => {
      initialStatuses[id] = 'unanswered'
    })
    setQuestionStatuses(initialStatuses)
    setIsInitialized(true)
  }, [])

  // Get current question from vocabulary data using question order
  const currentQuestionIndexInOrder = questionOrder[currentQuestionIndex]
  const currentQuestion = currentQuestionIndexInOrder !== undefined ? vocabularyData[currentQuestionIndexInOrder] : null
  const isLastQuestion = currentQuestionIndex === questionOrder.length - 1
  
  // Check if current answer is correct
  const isCorrectAnswer = answerLevel && answerLevel !== 'incorrect'
  
  // Check if we need to show complete button (this is the last question and we just answered correctly)
  const shouldShowComplete = questionOrder.length === 1 && showFeedback && isCorrectAnswer

  // Safety check: if currentQuestionIndex is out of bounds, reset to 0
  if (currentQuestionIndex >= questionOrder.length && questionOrder.length > 0) {
    console.log('Current question index out of bounds, resetting to 0')
    setCurrentQuestionIndex(0)
  }

  // Get or create user ID for tracking
  const getUserId = () => {
    if (typeof window === 'undefined') return null
    
    let userId = localStorage.getItem('hanvoca_user_id')
    if (!userId) {
      userId = crypto.randomUUID()
      localStorage.setItem('hanvoca_user_id', userId)
      console.log('Created new user ID:', userId)
    } else {
      console.log('Using existing user ID:', userId)
    }
    return userId
  }

  // checkAnswer 함수: 새로운 API 구조에 맞게 수정
  const checkAnswer = async (origin: string, sentence: string) => {
    try {
      const userId = getUserId()
      const response = await fetch('https://whlfxkvrmdzgscnlklmn.supabase.co/functions/v1/hanvoca', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGZ4a3ZybWR6Z3NjbmxrbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQwNjUsImV4cCI6MjA2MTU3MDA2NX0.R6aI0I3XLpfr7WEGuyYdwvULgt9HYszYNIx2R6P6tLI',
          'Content-Type': 'application/json',
          'X-User-ID': userId || 'anonymous'
        },
        body: JSON.stringify({
          origin,
          sentence,
          user_id: userId
        })
      })
      if (response.ok) {
        const data = await response.json()
        return data // { feedback, accuracy }
      }
    } catch (error) {
      return { feedback: 'Sorry, something went wrong.', accuracy: 'incorrect' }
    }
    return { feedback: 'Sorry, something went wrong.', accuracy: 'incorrect' }
  }

  // handleSubmit: origin/Sentence 생성 및 API 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return
    setIsSubmitting(true)

    const currentQuestionId = questionOrder[currentQuestionIndex]
    // 영어 문장: 정답 단어에 [ ] 표시
    const origin = currentQuestion?.english_translation.replace(
      currentQuestion.highlight_word,
      `[${currentQuestion.highlight_word}]`
    ) || ''
    // 한글 문장: 사용자의 입력 단어에 [ ] 표시
    const userWord = userInput.trim()
    const sentence = currentQuestion?.korean_sentence.replace(
      /____/,
      `[${userWord}]`
    ) || ''

    try {
      const { feedback: feedbackMessage, accuracy } = await checkAnswer(origin, sentence)
      console.log('answerLevel:', accuracy)
      setFeedback(feedbackMessage)
      setShowFeedback(true)
      // accuracy에 따라 상태 업데이트
      if (["perfect", "good", "acceptable"].includes(accuracy)) {
        setAnswerLevel(accuracy as AnswerLevel)
        setQuestionStatuses(prev => ({
          ...prev,
          [currentQuestionId]: 'answered'
        }))
      } else {
        setAnswerLevel("incorrect")
        setQuestionStatuses(prev => ({
          ...prev,
          [currentQuestionId]: 'needs_retry'
        }))
      }
    } catch (error) {
      setFeedback('Sorry, something went wrong.')
      setShowFeedback(true)
    }
    setIsSubmitting(false)
  }

  // Simplified pass functionality
  const handlePass = () => {
    const currentQuestionId = questionOrder[currentQuestionIndex]
    
    // Mark as passed
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestionId]: 'passed'
    }))
    
    // Move to next question
    moveToNextQuestion()
  }

  // Move to next question in cycle
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questionOrder.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Go back to first question
      setCurrentQuestionIndex(0)
    }
    resetChallenge()
  }

  const showLearningExploration = () => {
    setShowLearningModal(true)
  }

  const goToNextQuestion = () => {
    // If correct answer, remove from queue
    if (isCorrectAnswer) {
      const currentQuestionId = questionOrder[currentQuestionIndex]
      const newQuestionOrder = questionOrder.filter(id => id !== currentQuestionId)
      
      console.log('Removing question from queue:', {
        questionId: currentQuestionId,
        remainingQuestions: newQuestionOrder.length
      })
      
      setQuestionOrder(newQuestionOrder)
      
      // Adjust current index if needed
      if (currentQuestionIndex >= newQuestionOrder.length) {
        setCurrentQuestionIndex(0)
      }
      
      resetChallenge()
    } else {
      // Otherwise, move to next question
      moveToNextQuestion()
    }
  }

  const resetChallenge = () => {
    setUserInput('')
    setAnswerLevel(null)
    setFeedback('')
    setShowFeedback(false)
    setShowLearningModal(false)
    setUserAnswerNote('')
    setHintsUsed([])
    setShowHints(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
    if (showFeedback) {
      setShowFeedback(false)
      setAnswerLevel(null)
      setFeedback('')
      setShowLearningModal(false)
    }
  }

  // Split Korean sentence into parts for rendering
  const koreanParts = currentQuestion?.korean_sentence?.split('____') || ['', '']

  // Function to highlight the target word in English sentence
  const highlightTargetWord = (sentence: string, targetWord: string) => {
    const regex = new RegExp(`\\b${targetWord}\\b`, 'gi')
    return sentence.split(regex).map((part, index, array) => {
      if (index < array.length - 1) {
        return (
          <span key={index}>
            {part}
            <span className="bg-yellow-200 px-1 py-0.5 rounded font-semibold text-blue-700 border-2 border-yellow-300">
              {targetWord}
            </span>
          </span>
        )
      }
      return part
    })
  }

  // Show loading if questions are still being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Hanvoca</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

        // Show completion screen if all questions are completed
      if (questionOrder.length === 0) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="max-w-md mx-auto pt-12">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Hanvoca</h1>
                <p className="text-gray-600 mb-6">All questions completed!</p>
                <button
                  onClick={() => window.location.href = '/add-to-home'}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Add to Home Screen 🎉
                </button>
              </div>
            </div>
          </div>
        )
      }

  // 피드백 상자 색상 결정
  let feedbackBoxClass = ''
  let feedbackTextClass = ''
  switch (answerLevel) {
    case 'perfect':
    case 'good':
      feedbackBoxClass = 'bg-green-50 border-green-200'
      feedbackTextClass = 'text-green-700'
      break
    case 'acceptable':
      feedbackBoxClass = 'bg-yellow-50 border-yellow-200'
      feedbackTextClass = 'text-yellow-700'
      break
    case 'incorrect':
      feedbackBoxClass = 'bg-red-50 border-red-200'
      feedbackTextClass = 'text-red-700'
      break
    default:
      feedbackBoxClass = 'bg-gray-50 border-gray-200'
      feedbackTextClass = 'text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hanvoca</h1>
          <p className="text-gray-600 text-sm">Explore Korean vocabulary together, every day!</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Question {currentQuestionIndex + 1}/{questionOrder.length}
          </div>
        </div>
        
        {/* Question status indicator */}
        {(() => {
          const currentQuestionId = questionOrder[currentQuestionIndex]
          const status = questionStatuses[currentQuestionId]
          
          if (status === 'passed') {
            return (
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  ⏭️ Previously Passed
                </div>
              </div>
            )
          } else if (status === 'needs_retry') {
            return (
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  🤔 Previously Incorrect
                </div>
              </div>
            )
          }
          return null
        })()}
        
        {/* Pass hint message */}
        {!showFeedback && (
          <div className="text-center mb-4">
            <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs">
              💡 Tip: Passed questions can be attempted again later!
            </div>
          </div>
        )}

        {/* Main Challenge Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* English sentence (reference) with highlighted target word */}
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-lg text-gray-800 leading-relaxed font-medium mb-3">
                {highlightTargetWord(currentQuestion?.english_translation || '', currentQuestion?.highlight_word || '')}
              </p>
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-full px-3 py-1 text-sm text-gray-600 border border-yellow-300">
                  <span className="text-yellow-600">✨</span> Translate the highlighted word to Korean
                </div>
              </div>
            </div>
          </div>

          {/* Korean sentence with blank */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              {koreanParts[0]}
              <span className="relative inline-block">
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitting && userInput.trim()) {
                      handleSubmit(e)
                    }
                  }}
                  className="w-20 px-2 py-1 border-b-2 border-blue-400 bg-blue-50 text-center font-medium focus:outline-none focus:border-blue-600 focus:bg-blue-100"
                  placeholder="?"
                  disabled={isSubmitting}
                />
              </span>
              {koreanParts[1]}
            </p>
          </div>

          {/* Hint System */}
          {!isCorrectAnswer && (
            <div className="mb-6">
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full bg-orange-100 text-orange-700 py-2 rounded-lg font-medium hover:bg-orange-200 transition-colors mb-3"
              >
                💡 Need a hint? Click here!
              </button>
              
              {showHints && (
                <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
                  {/* Hint 1: Semantic */}
                  <div>
                    <button
                      onClick={() => {
                        if (!hintsUsed.includes('semantic')) setHintsUsed([...hintsUsed, 'semantic'])
                      }}
                      disabled={hintsUsed.includes('semantic')}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        hintsUsed.includes('semantic')
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-white border-orange-200 hover:bg-orange-50 text-orange-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">🔍 Hint 1: What does it mean?</span>
                      </div>
                    </button>
                    {hintsUsed.includes('semantic') && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                        {currentQuestion?.hints?.semantic?.replace(/\*\*(.*?)\*\*/g, '$1') || ''}
                      </div>
                    )}
                  </div>

                  {/* Hint 2: Structural - only show if semantic is used */}
                  {hintsUsed.includes('semantic') && (
                    <div>
                      <button
                        onClick={() => {
                          if (!hintsUsed.includes('structural')) setHintsUsed([...hintsUsed, 'structural'])
                        }}
                        disabled={hintsUsed.includes('structural')}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          hintsUsed.includes('structural')
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-orange-200 hover:bg-orange-50 text-orange-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">🧩 Hint 2: What does it look like?</span>
                        </div>
                      </button>
                      {hintsUsed.includes('structural') && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                          {currentQuestion?.hints?.structural?.replace(/\*\*(.*?)\*\*/g, '$1') || ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hint 3: Discovery - only show if structural is used */}
                  {hintsUsed.includes('structural') && (
                    <div>
                      <button
                        onClick={() => {
                          if (!hintsUsed.includes('discovery')) setHintsUsed([...hintsUsed, 'discovery'])
                        }}
                        disabled={hintsUsed.includes('discovery')}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          hintsUsed.includes('discovery')
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-orange-200 hover:bg-orange-50 text-orange-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">🎁 Hint 3: Show me an answer!</span>
                        </div>
                      </button>
                      {hintsUsed.includes('discovery') && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                          {currentQuestion?.hints?.discovery?.replace(/\*\*(.*?)\*\*/g, '$1') || ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {!showFeedback && (
            <div className="space-y-3 mb-4">
              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !userInput.trim()}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Checking...' : 'Check Answer'}
              </button>

              {/* Pass button */}
              <button
                onClick={handlePass}
                disabled={isSubmitting}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⏭️ Pass
              </button>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg border-2 ${feedbackBoxClass}`}>
              <p className={`font-medium ${feedbackTextClass}`}>
                {feedback}
              </p>
              
              {userAnswerNote && (
                <div className="mt-2 p-2 bg-white rounded text-sm text-gray-700">
                  💡 {userAnswerNote}
                </div>
              )}
              
              <div className="mt-3 space-y-2">
                {isCorrectAnswer ? (
                  <div className="space-y-2">
                    <button
                      onClick={showLearningExploration}
                      className="w-full bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
                    >
                      🚀 Explore More Expressions
                    </button>
                    {shouldShowComplete ? (
                      <button
                        onClick={() => {
                          // Remove last question from queue
                          const currentQuestionId = questionOrder[currentQuestionIndex]
                          const newQuestionOrder = questionOrder.filter(id => id !== currentQuestionId)
                          setQuestionOrder(newQuestionOrder)
                          
                          // Go to add-to-home page
                          window.location.href = '/add-to-home'
                        }}
                        className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        Complete All Challenges 🎉
                      </button>
                    ) : (
                      <button
                        onClick={goToNextQuestion}
                        className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        Next Question →
                      </button>
                    )}
                    <button
                      onClick={resetChallenge}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={showLearningExploration}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      💡 Show Me Other Options
                    </button>
                    <button
                      onClick={resetChallenge}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Try Different Word
                    </button>
                    <button
                      onClick={handlePass}
                      className="w-full bg-orange-100 text-orange-700 py-2 rounded-lg font-medium hover:bg-orange-200 transition-colors"
                    >
                      ⏭️ Pass (Try again later)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Learning Exploration Modal */}
        {showLearningModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">🌟 Vocabulary Explorer</h3>
                <button
                  onClick={() => setShowLearningModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Here are different ways to express the same meaning:
              </p>

              <div className="space-y-3">
                {/* Best answers */}
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-2">🎯 Best Expressions</h4>
                  {currentQuestion?.acceptable_answers?.best?.map((word, index) => (
                    <div key={index} className="bg-green-50 p-2 rounded mb-2">
                      <span className="font-medium text-green-700">{word}</span>
                      <p className="text-xs text-green-600 mt-1">
                        {currentQuestion?.learning_notes?.[word as keyof typeof currentQuestion.learning_notes] || ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Good answers */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 mb-2">👍 Good Expressions</h4>
                  {currentQuestion?.acceptable_answers?.good?.map((word, index) => (
                    <div key={index} className="bg-blue-50 p-2 rounded mb-2">
                      <span className="font-medium text-blue-700">{word}</span>
                      <p className="text-xs text-blue-600 mt-1">
                        {currentQuestion?.learning_notes?.[word as keyof typeof currentQuestion.learning_notes] || ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Acceptable answers */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-600 mb-2">✅ Also Acceptable</h4>
                  {currentQuestion?.acceptable_answers?.acceptable?.map((word, index) => (
                    <div key={index} className="bg-purple-50 p-2 rounded mb-2">
                      <span className="font-medium text-purple-700">{word}</span>
                      <p className="text-xs text-purple-600 mt-1">
                        {currentQuestion?.learning_notes?.[word as keyof typeof currentQuestion.learning_notes] || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowLearningModal(false)}
                className="w-full mt-4 bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Got it! 👌
              </button>
            </div>
          </div>
        )}

        {/* Vocabulary hint card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">💭 Think about it</h3>
          <div className="text-gray-700 text-sm">
            <p>What Korean word best expresses '<span className="font-semibold text-blue-600">{currentQuestion?.highlight_word || ''}</span>' in this context?</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs">
          <p>Every answer teaches you something new! 📚</p>
        </div>
      </div>
    </div>
  )
}
