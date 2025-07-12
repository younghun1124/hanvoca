'use client'

import { useState, useEffect } from 'react'

export default function AddToHomePage() {
  // PWA related states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)
    
    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    setIsInStandaloneMode(standalone)
    
    // Listen for beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android install
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    } else if (isIOS && !isInStandaloneMode) {
      // iOS install instructions with better UX
      setShowIOSInstructions(true)
    }
  }

  const goBack = () => {
    window.location.href = '/'
  }

  if (isInStandaloneMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfect!</h1>
            <p className="text-gray-600">You're already using Hanvoca as an app!</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium mb-2">
                  🎉 Running in app mode!
                </p>
                <p className="text-green-600 text-sm">
                  You can now launch Hanvoca directly from your home screen
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">App Mode Benefits</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 🚀 Fast launch without browser</li>
                  <li>• 📱 Native app experience</li>
                  <li>• 🔔 Push notification support</li>
                  <li>• 📶 Offline usage available</li>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add to Home Screen</h1>
          <p className="text-gray-600">Access your Korean learning app instantly every day</p>
        </div>

        {/* Main Benefits Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-1">Use it like an app!</h2>
              <p className="text-blue-100 text-sm">Adding to home screen makes it more convenient</p>
            </div>

            <div className="space-y-3">
              <ul className="text-sm text-gray-700 space-y-2">
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
            </div>
          </div>

          {/* Install Button */}
          {(showInstallPrompt || isIOS) && (
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all text-lg"
            >
              📱 Add to Home Screen
            </button>
          )}

          {!showInstallPrompt && !isIOS && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm mb-2">
                To use the add to home screen feature
              </p>
              <p className="text-gray-700 font-medium">
                Please access from a mobile browser
              </p>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            📖 How to Install
          </h3>
          
          {isIOS ? (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-sm text-gray-700">Tap the <strong>Share button</strong> (📤) at the bottom of Safari</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm text-gray-700">Select <strong>"Add to Home Screen"</strong> option</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm text-gray-700">Tap <strong>"Add"</strong> in the top right corner</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Only available in Safari browser
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-sm text-gray-700">Tap the <strong>"Add to Home Screen"</strong> button above</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm text-gray-700">Select <strong>"Install"</strong> in the confirmation popup</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm text-gray-700">Find and launch the <strong>Hanvoca icon</strong> on your home screen</p>
              </div>
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

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📱 Add to Home Screen on iOS
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-sm text-gray-700">Tap the <strong>Share button</strong> (📤) at the bottom of Safari</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-sm text-gray-700">Select <strong>"Add to Home Screen"</strong> option</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-sm text-gray-700">Tap <strong>"Add"</strong> in the top right corner</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Only available in Safari browser. If you're using a different browser, please switch to Safari.
                </p>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 