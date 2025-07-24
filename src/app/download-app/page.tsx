'use client'

import { useState, useEffect } from 'react'

export default function AddToHomePage() {
  // PWA-related states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false)

  useEffect(() => {
    // Detect iOS devices
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Detect standalone (already installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsInStandaloneMode(standalone)

    // Handle Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () =>
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  // Android install handler
  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  // Go back to landing
  const goBack = () => {
    window.location.href = '/'
  }

  /* ---------- Already installed (stand-alone) ---------- */
  if (isInStandaloneMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfect!</h1>
            <p className="text-gray-600">
              You’re already using <strong>Hanvoca</strong> as an app!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium mb-2">
                  🎉 Running in app mode!
                </p>
                <p className="text-green-600 text-sm">
                  Launch Hanvoca directly from your home screen.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  App-Mode Benefits
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 🚀 Fast launch without the browser</li>
                  <li>• 📱 Native-app feel</li>
                  <li>• 🔔 Push notifications</li>
                  <li>• 📶 Works offline</li>
                </ul>
              </div>

              <button
                onClick={goBack}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Start Learning! 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Not installed ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Add to Home Screen
          </h1>
          <p className="text-gray-600">
            Access your Korean-learning app instantly every day
          </p>
        </div>

        {/* Main Benefits Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-1">Use it like an app!</h2>
              <p className="text-blue-100 text-sm">
                Adding to Home Screen is more convenient
              </p>
            </div>

            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center space-x-3">
                <span className="text-2xl">🚀</span>
                <span>Lightning-fast launch</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-2xl">📶</span>
                <span>Offline support</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-2xl">🔔</span>
                <span>Push reminders</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span>Native-app experience</span>
              </li>
            </ul>
          </div>

          {/* Install CTA (Android) & iOS guide */}
          {!isIOS && showInstallPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all text-lg"
            >
              📱 Add to Home Screen
            </button>
          )}

          {isIOS && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-gray-800 text-sm space-y-2">
              <p className="font-medium">
                📱 How to add <strong>Hanvoca</strong> to your Home Screen
                (iPhone / iPad)
              </p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Open this page in <strong>Safari</strong>.</li>
                <li>
                  Tap the <strong>Share</strong> icon (□↗) at the bottom bar.
                </li>
                <li>Select <strong>“Add to Home Screen.”</strong></li>
                <li>Tap <strong>“Add”</strong> in the top-right corner.</li>
              </ol>
              <p className="text-xs text-gray-600">
                ※ Push notifications are not supported in iOS web-apps yet.
              </p>
            </div>
          )}

          {/* Fallback for unsupported environments */}
          {!isIOS && !showInstallPrompt && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">
                Already installed or accessed via an unsupported browser
              </p>
            </div>
          )}
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