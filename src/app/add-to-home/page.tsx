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
                  🎉 앱 모드로 실행 중입니다!
                </p>
                <p className="text-green-600 text-sm">
                  이제 홈 화면에서 바로 Hanvoca를 실행할 수 있어요
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">앱 모드의 장점</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 🚀 브라우저 없이 빠른 실행</li>
                  <li>• 📱 네이티브 앱 경험</li>
                  <li>• 🔔 푸시 알림 지원</li>
                  <li>• 📶 오프라인 사용 가능</li>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">홈 화면에 추가하기</h1>
          <p className="text-gray-600">매일 한국어 학습을 위해 앱처럼 빠르게 접근하세요</p>
        </div>

        {/* Main Benefits Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-1">앱처럼 사용하세요!</h2>
              <p className="text-blue-100 text-sm">홈 화면에 추가하면 더 편리해요</p>
            </div>

            <div className="space-y-3">
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center space-x-3">
                  <span className="text-2xl">🚀</span>
                  <span>앱처럼 빠른 실행</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-2xl">📶</span>
                  <span>오프라인에서도 사용 가능</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-2xl">🔔</span>
                  <span>푸시 알림으로 학습 리마인드</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-2xl">📱</span>
                  <span>네이티브 앱 경험</span>
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
              📱 홈 화면에 추가하기
            </button>
          )}

          {!showInstallPrompt && !isIOS && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm mb-2">
                홈 화면에 추가 기능을 사용하려면
              </p>
              <p className="text-gray-700 font-medium">
                모바일 브라우저에서 접속해주세요
              </p>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            📖 사용법 안내
          </h3>
          
          {isIOS ? (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-sm text-gray-700">Safari 하단의 <strong>공유 버튼</strong> (📤) 를 탭하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm text-gray-700"><strong>"홈 화면에 추가"</strong> 옵션을 선택하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm text-gray-700">우상단의 <strong>"추가"</strong> 를 탭하세요</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Safari 브라우저에서만 가능합니다
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-sm text-gray-700">위의 <strong>"홈 화면에 추가하기"</strong> 버튼을 탭하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm text-gray-700">설치 확인 팝업에서 <strong>"설치"</strong> 를 선택하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm text-gray-700">홈 화면에서 <strong>Hanvoca 아이콘</strong> 을 찾아 실행하세요</p>
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
                📱 iOS에서 홈 화면에 추가하기
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-sm text-gray-700">Safari 하단의 <strong>공유 버튼</strong> (📤) 을 탭하세요</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-sm text-gray-700"><strong>"홈 화면에 추가"</strong> 옵션을 선택하세요</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-sm text-gray-700">우상단의 <strong>"추가"</strong> 를 탭하세요</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Safari 브라우저에서만 가능합니다. 다른 브라우저를 사용 중이시라면 Safari로 이동해주세요.
                </p>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                확인했어요!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 