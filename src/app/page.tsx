import { UrlShortenerForm } from '@/components/url-shortener-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Bitlytics
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Shorten URLs with powerful analytics insights
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <UrlShortenerForm />
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">Lightning-fast redirects with 99.9% uptime guarantee</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">Track clicks, geographic data, and user engagement</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Custom Links</h3>
              <p className="text-gray-600">Create branded short links with custom aliases</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
