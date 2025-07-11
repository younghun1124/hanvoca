'use client'

import { useState } from 'react'
import vocabularyData from '../data/vocabulary.json'

type AnswerLevel = 'best' | 'good' | 'acceptable' | 'needs_guidance'

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [answerLevel, setAnswerLevel] = useState<AnswerLevel | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [showLearningModal, setShowLearningModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userAnswerNote, setUserAnswerNote] = useState('')

  // Get current question from vocabulary data
  const currentQuestion = vocabularyData[currentQuestionIndex]
  const totalQuestions = vocabularyData.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  // Check which level the user's answer falls into
  const checkAnswerLevel = (userAnswer: string): AnswerLevel => {
    const trimmedAnswer = userAnswer.trim()
    
    if (currentQuestion.acceptable_answers.best.includes(trimmedAnswer)) {
      return 'best'
    }
    if (currentQuestion.acceptable_answers.good.includes(trimmedAnswer)) {
      return 'good'
    }
    if (currentQuestion.acceptable_answers.acceptable.includes(trimmedAnswer)) {
      return 'acceptable'
    }
    
    return 'needs_guidance'
  }

  const generateFeedback = (level: AnswerLevel, userAnswer: string): string => {
    const note = currentQuestion.learning_notes[userAnswer as keyof typeof currentQuestion.learning_notes]
    
    switch (level) {
      case 'best':
        return `🎯 완벽해요! '${userAnswer}'는 이 문맥에서 가장 자연스러운 표현입니다.`
      case 'good':
        return `👍 좋은 표현이에요! '${userAnswer}'는 자연스럽게 사용할 수 있는 단어입니다.`
      case 'acceptable':
        return `✅ 맞는 표현이에요! '${userAnswer}'도 사용할 수 있는 단어입니다.`
      case 'needs_guidance':
        return `🤔 '${userAnswer}'... 흥미로운 시도네요! 혹시 '${currentQuestion.highlight_word}'의 의미를 다른 방식으로 표현해볼까요?`
    }
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

      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        return data.feedback
      }
    } catch (error) {
      console.error('API Error:', error)
    }
    
    // Always use our local smart feedback system
    const level = checkAnswerLevel(guess)
    return generateFeedback(level, guess)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userInput.trim()) {
      return
    }

    setIsSubmitting(true)
    
    // Check answer level first
    const level = checkAnswerLevel(userInput.trim())
    setAnswerLevel(level)
    
    // Get user's answer note for learning modal
    const note = currentQuestion.learning_notes[userInput.trim() as keyof typeof currentQuestion.learning_notes]
    setUserAnswerNote(note || '')
    
    // Prepare sentence with the CORRECT ANSWER in brackets for API
    const sentenceWithCorrectAnswer = currentQuestion.korean_sentence.replace('_____', `[${currentQuestion.answer}]`)
    
    try {
      const feedbackMessage = await checkAnswer(sentenceWithCorrectAnswer, userInput.trim())
      setFeedback(feedbackMessage)
      setShowFeedback(true)
    } catch (error) {
      console.error('Error checking answer:', error)
      const fallbackFeedback = generateFeedback(level, userInput.trim())
      setFeedback(fallbackFeedback)
      setShowFeedback(true)
    }
    
    setIsSubmitting(false)
  }

  const showLearningExploration = () => {
    setShowLearningModal(true)
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      resetChallenge()
    }
  }

  const resetChallenge = () => {
    setUserInput('')
    setAnswerLevel(null)
    setFeedback('')
    setShowFeedback(false)
    setShowLearningModal(false)
    setUserAnswerNote('')
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

  const isCorrectAnswer = answerLevel && answerLevel !== 'needs_guidance'

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
          <p className="text-gray-600 text-sm">Explore Korean vocabulary together</p>
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
              isCorrectAnswer 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <p className={`font-medium ${
                isCorrectAnswer ? 'text-green-700' : 'text-orange-700'
              }`}>
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
                  {currentQuestion.acceptable_answers.best.map((word, index) => (
                    <div key={index} className="bg-green-50 p-2 rounded mb-2">
                      <span className="font-medium text-green-700">{word}</span>
                      <p className="text-xs text-green-600 mt-1">
                        {currentQuestion.learning_notes[word as keyof typeof currentQuestion.learning_notes]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Good answers */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 mb-2">👍 Good Expressions</h4>
                  {currentQuestion.acceptable_answers.good.map((word, index) => (
                    <div key={index} className="bg-blue-50 p-2 rounded mb-2">
                      <span className="font-medium text-blue-700">{word}</span>
                      <p className="text-xs text-blue-600 mt-1">
                        {currentQuestion.learning_notes[word as keyof typeof currentQuestion.learning_notes]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Acceptable answers */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-600 mb-2">✅ Also Acceptable</h4>
                  {currentQuestion.acceptable_answers.acceptable.map((word, index) => (
                    <div key={index} className="bg-purple-50 p-2 rounded mb-2">
                      <span className="font-medium text-purple-700">{word}</span>
                      <p className="text-xs text-purple-600 mt-1">
                        {currentQuestion.learning_notes[word as keyof typeof currentQuestion.learning_notes]}
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
            <p>What Korean word best expresses '<span className="font-semibold text-blue-600">{currentQuestion.highlight_word}</span>' in this context?</p>
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
