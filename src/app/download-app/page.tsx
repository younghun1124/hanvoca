'use client';

import { useState, useEffect } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

export default function DownloadApp() {
  // 1) useState에 제네릭으로 이벤트 타입을 지정해 null 초기화 시 'never' 문제가 사라집니다.
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 2) 핸들러 파라미터에 Event 타입을 명시해 '암시적 any' 오류를 제거합니다.
    const handler = (e: Event) => {
      e.preventDefault(); // beforeinstallprompt 기본 동작 막기
      // 3) 실제 PWA 설치 이벤트로 캐스팅
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // 'never' 에러 사라짐
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Download Hanvoca App</h1>
        <p className="text-gray-700 mb-6">Get the best Korean vocabulary experience on your device!</p>
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="font-semibold text-blue-700 mb-2">For Android</h2>
            <p className="text-sm text-gray-700 mb-2">
              Tap the button below and then choose <b>"Add to Home Screen"</b> in your browser menu.
            </p>
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className={`inline-block px-6 py-2 rounded font-medium transition-colors ${
                deferredPrompt
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              Add to Home Screen
            </button>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h2 className="font-semibold text-green-700 mb-2">For iOS (iPhone/iPad)</h2>
            <ol className="text-sm text-gray-700 mb-2 list-decimal list-inside text-left mx-auto max-w-xs">
              <li>Open this page in <b>Safari</b>.</li>
              <li>Tap the <b>Share</b> button (📤) at the bottom.</li>
              <li>Scroll and tap <b>"Add to Home Screen"</b>.</li>
              <li>Tap <b>"Add"</b> in the top right corner.</li>
            </ol>
            <button
              disabled
              className="inline-block bg-green-400 text-white px-6 py-2 rounded font-medium cursor-not-allowed opacity-50"
            >
              Add to Home Screen
            </button>
          </div>
        </div>
        <div className="mt-8 text-gray-500 text-xs">
          Questions? Contact us at{' '}
          <a href="mailto:support@hanvoca.com" className="underline">
            support@hanvoca.com
          </a>
        </div>
      </div>
    </div>
  );
}