"use client";

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Automatically redirect to homepage after 3 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl">🎓</span>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. You'll be redirected to the homepage automatically, or you can click below.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
          >
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-lg font-semibold"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          Redirecting in 3 seconds...
        </div>
      </div>
    </div>
  )
}