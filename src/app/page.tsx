'use client'

import { useState } from 'react'
import vocabularyData from '../data/vocabulary.json'

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current question from vocabulary data
  const currentQuestion = vocabularyData[currentQuestionIndex]
  const totalQuestions = vocabularyData.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const checkAnswer = async (sentence: string, guess: string) => {
    try {
      console.log('Sending API request:', { sentence, guess })
      
      const response = await fetch('https://whlfxkvrmdzgscnlklmn.supabase.co/functions/v1/hanvoca', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGZ4a3ZybWR6Z3NjbmxrbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQwNjUsImV4cCI6MjA2MTU3MDA2NX0.R6aI0I3XLpfr7WEGuyYdwvULgt9HYszYNIx2R6P6tLI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sentence: sentence,
          guess: guess
        })
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      return data.feedback
    } catch (error) {
      console.error('API Error:', error)
      
      // Enhanced fallback logic for local testing
      if (guess.trim() === currentQuestion.answer) {
        return "✅ Correct! Great job!"
      } else {
        return `❌ Not quite right. The correct answer is '${currentQuestion.answer}'. Try again!`
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userInput.trim()) {
      return
    }

    setIsSubmitting(true)
    
    // Prepare sentence with the CORRECT ANSWER in brackets for API
    const sentenceWithCorrectAnswer = currentQuestion.korean_sentence.replace('_____', `[${currentQuestion.answer}]`)
    
    try {
      const feedbackMessage = await checkAnswer(sentenceWithCorrectAnswer, userInput.trim())
      
      // Check if it's a correct answer (simple heuristic)
      const isAnswerCorrect = feedbackMessage.includes('✅') || 
                             feedbackMessage.toLowerCase().includes('correct') ||
                             userInput.trim() === currentQuestion.answer
      
      setIsCorrect(isAnswerCorrect)
      setFeedback(feedbackMessage)
      setShowFeedback(true)
    } catch (error) {
      console.error('Error checking answer:', error)
      setFeedback('Sorry, there was an error checking your answer. Please try again.')
      setIsCorrect(false)
      setShowFeedback(true)
    }
    
    setIsSubmitting(false)
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      resetChallenge()
    }
  }

  const resetChallenge = () => {
    setUserInput('')
    setIsCorrect(null)
    setFeedback('')
    setShowFeedback(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
    if (showFeedback) {
      setShowFeedback(false)
      setIsCorrect(null)
      setFeedback('')
    }
  }

  // Split Korean sentence into parts for rendering
  const koreanParts = currentQuestion.korean_sentence.split('_____')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hanvoca</h1>
          <p className="text-gray-600 text-sm">Fill in the Korean vocabulary</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Question {currentQuestionIndex + 1}/{totalQuestions}
          </div>
        </div>

        {/* Main Challenge Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* English sentence (reference) with highlighted target word */}
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-lg text-gray-800 leading-relaxed font-medium mb-3">
                {highlightTargetWord(currentQuestion.english_translation, currentQuestion.highlight_word)}
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
                  className="w-20 px-2 py-1 border-b-2 border-blue-400 bg-blue-50 text-center font-medium focus:outline-none focus:border-blue-600 focus:bg-blue-100"
                  placeholder="?"
                  disabled={isSubmitting}
                />
              </span>
              {koreanParts[1]}
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !userInput.trim()}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isSubmitting ? 'Checking...' : 'Check Answer'}
          </button>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg border-2 ${
              isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`font-medium ${
                isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {feedback}
              </p>
              
              <div className="mt-3 space-y-2">
                {isCorrect ? (
                  <div className="space-y-2">
                    {isLastQuestion ? (
                      <button
                        onClick={() => window.location.href = '/complete'}
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
                  <button
                    onClick={resetChallenge}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary hint card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Hint</h3>
          <div className="text-gray-700 text-sm">
            <p>Look at the English sentence above for context clues!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs">
          <p>Complete the sentence with the correct Korean vocabulary</p>
        </div>
      </div>
    </div>
  )
}
