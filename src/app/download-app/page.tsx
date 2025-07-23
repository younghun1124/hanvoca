export default function DownloadApp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Download Hanvoca App</h1>
        <p className="text-gray-700 mb-6">Get the best Korean vocabulary experience on your device!</p>
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="font-semibold text-blue-700 mb-2">For Android</h2>
            <p className="text-sm text-gray-700 mb-2">Tap the button below and then choose <b>"Add to Home Screen"</b> in your browser menu.</p>
            <a
              href="/"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition-colors"
            >
              Open Hanvoca in Browser
            </a>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h2 className="font-semibold text-green-700 mb-2">For iOS (iPhone/iPad)</h2>
            <ol className="text-sm text-gray-700 mb-2 list-decimal list-inside text-left mx-auto max-w-xs">
              <li>Open this page in <b>Safari</b>.</li>
              <li>Tap the <b>Share</b> button (📤) at the bottom.</li>
              <li>Scroll and tap <b>"Add to Home Screen"</b>.</li>
              <li>Tap <b>"Add"</b> in the top right corner.</li>
            </ol>
            <a
              href="/"
              className="inline-block bg-green-500 text-white px-6 py-2 rounded font-medium hover:bg-green-600 transition-colors"
            >
              Open Hanvoca in Safari
            </a>
          </div>
        </div>
        <div className="mt-8 text-gray-500 text-xs">Questions? Contact us at <a href="mailto:support@hanvoca.com" className="underline">support@hanvoca.com</a></div>
      </div>
    </div>
  )
} 