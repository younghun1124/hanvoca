'use client'

import { useState } from 'react'

export default function AddToHome() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    // TODO: 실제 이메일 전송 로직 (API 연동)
    console.log('Email for app download:', email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Get the Daily Hanvoca App</h1>
          <p className="text-gray-600">Enter your email to receive a download link for the Hanvoca app</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-1">Why use the Hanvoca app?</h2>
              <p className="text-blue-100 text-sm">Enjoy a faster, more convenient, and native experience</p>
            </div>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li className="flex items-center space-x-3">
                <span className="text-2xl">🚀</span>
                <span>Lightning-fast app launch</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-2xl">📶</span>
                <span>Works offline too</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-2xl">🔔</span>
                <span>Learning reminders via push notifications</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span>Native app experience</span>
              </li>
            </ul>
            {submitted ? (
              <div className="text-center">
                <div className="text-blue-700 text-lg font-semibold mb-2">Check your email!</div>
                <div className="text-gray-600 mb-4">A download link for the Hanvoca app has been sent to <b>{email}</b>.</div>
                <div className="mt-4">
                  <a href="/download-app" className="text-blue-500 underline">Or click here to download the app now</a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-black"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all text-lg"
                >
                  Send App Download Link
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 