'use client'

import { useState } from 'react'

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Today's vocabulary challenge
  const challenge = {
    english: 'I studied hastily because there wasn\'t much time left for the exam.',
    korean: '시험 시간이 얼마 남지 않아서 _____ 공부했다.',
    targetWord: '부리나케',
    meaning: 'hastily, hurriedly',
    englishWord: 'hastily'
  }

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
      if (guess.trim() === challenge.targetWord) {
        return "✅ Correct! Great job! '부리나케' means 'hastily, hurriedly'"
      } else {
        // Provide helpful feedback for common alternatives
        const commonAlternatives: { [key: string]: string } = {
          '서둘러': "Good try! '서둘러' means 'in a hurry' which is close. Try finding a word that emphasizes doing something more quickly or hastily.",
          '빨리': "'빨리' means 'quickly' which is related, but we need a word that specifically means 'hastily' or 'hurriedly'.",
          '급히': "'급히' means 'urgently' which is very close! But there's another word that's even more specific for 'hastily'.",
          '천천히': "That means 'slowly' which is the opposite of what we need! Try thinking of a word that means 'hastily'."
        }
        
        const feedbackMessage = commonAlternatives[guess.trim()] || 
          `❌ Not quite right. The correct answer is '${challenge.targetWord}' which means '${challenge.meaning}'. Try again!`
        
        return feedbackMessage
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userInput.trim()) {
      return
    }

    setIsSubmitting(true)
    
    // Prepare sentence with the user's guess
    const sentenceWithGuess = `시험 시간이 얼마 남지 않아서 [${userInput.trim()}] 공부했다.`
    
    try {
      const feedbackMessage = await checkAnswer(sentenceWithGuess, userInput.trim())
      
      // Check if it's a correct answer (simple heuristic)
      const isAnswerCorrect = feedbackMessage.includes('✅') || 
                             feedbackMessage.toLowerCase().includes('correct') ||
                             userInput.trim() === challenge.targetWord
      
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
            Level 1/20
          </div>
        </div>

        {/* Main Challenge Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* English sentence (reference) */}
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                {challenge.english}
              </p>
            </div>
          </div>

          {/* Korean sentence with blank */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              시험 시간이 얼마 남지 않아서{' '}
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
              {' '}공부했다.
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
              
              <button
                onClick={resetChallenge}
                className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Vocabulary hint card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Vocabulary</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">{challenge.targetWord}</span>
            <span className="text-gray-600 italic">{challenge.meaning}</span>
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
