'use client'

import { useState } from 'react'

export default function CompletePage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Submitting email:', email)
      
      const response = await fetch('https://whlfxkvrmdzgscnlklmn.supabase.co/functions/v1/hanvoca-email', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGZ4a3ZybWR6Z3NjbmxrbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQwNjUsImV4cCI6MjA2MTU3MDA2NX0.R6aI0I3XLpfr7WEGuyYdwvULgt9HYszYNIx2R6P6tLI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Failed to submit email: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error('Email submission failed')
      }
    } catch (error) {
      console.error('Email submission error:', error)
      alert('Sorry, there was an error submitting your email. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  const goBack = () => {
    window.location.href = '/'
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-md mx-auto pt-12">
          {/* Success State */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Success!</h1>
            <p className="text-gray-600">Check your email for the discount link</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium mb-2">
                  ✅ Email sent successfully!
                </p>
                <p className="text-green-600 text-sm">
                  We've sent your 50% discount coupon to <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">What's next?</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the discount link to access the full app</li>
                  <li>• Start learning Korean with advanced features</li>
                </ul>
              </div>

              <button
                onClick={goBack}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Try Another Challenge
              </button>
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs">
            <p>Didn't receive the email? Check your spam folder or contact support</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Congratulations!</h1>
          <p className="text-gray-600">You've completed the vocabulary challenge</p>
        </div>

        {/* Main Offer Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-1">Special Offer!</h2>
              <p className="text-purple-100 text-sm">Limited time for early learners</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl line-through text-gray-400">$19.99</span>
                <span className="text-3xl font-bold text-green-600">$9.99</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">50% OFF</span>
              </div>
              
              <p className="text-gray-700 font-medium">
                Get full access to Hanvoca Premium
              </p>
              
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ 1000+ vocabulary challenges</li>
                <li>✓ AI-powered personalized feedback</li>
                <li>✓ Progress tracking & analytics</li>
                <li>✓ Offline mode & mobile app</li>
              </ul>
            </div>
          </div>

          {/* Email Collection Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email to get the discount link:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Sending...' : 'Get 50% Discount Link'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-3">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>

        {/* Back to Challenge */}
        <div className="text-center">
          <button
            onClick={goBack}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            ← Back to Challenge
          </button>
        </div>
      </div>
    </div>
  )
} 