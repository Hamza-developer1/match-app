'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Terms() {
  const { data: session, status } = useSession();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Navigation */}
      <header className="w-full p-6 flex justify-between items-center backdrop-blur-sm bg-white/80 border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎓</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Campus Connect
            </h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/terms" className="text-blue-600 font-medium">
            Terms
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
            Privacy
          </Link>
          <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
            Support
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {(session.user?.name || session.user?.email)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {session.user?.name || session.user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-200 hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Terms Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using Campus Connect.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
            
            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📋</span>
                </div>
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Campus Connect, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🎓</span>
                </div>
                2. Eligibility
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Campus Connect is designed exclusively for college and university students. To use our service, you must:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Be at least 18 years old</li>
                <li>Be currently enrolled as a student at an accredited college or university</li>
                <li>Provide accurate and truthful information about your academic status</li>
                <li>Have a valid university email address for verification</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚖️</span>
                </div>
                3. User Conduct
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use Campus Connect in a respectful and appropriate manner. You will not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Post offensive, inappropriate, or harmful content</li>
                <li>Harass, bully, or intimidate other users</li>
                <li>Share false or misleading information</li>
                <li>Use the platform for commercial purposes without permission</li>
                <li>Attempt to access other users' accounts or personal information</li>
                <li>Share contact information or personal details in public profiles</li>
                <li>Use the platform for inappropriate purposes (academic and professional networking only)</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔒</span>
                </div>
                4. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We take your privacy seriously. Our data practices include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>University email verification for account creation</li>
                <li>Secure storage of personal information</li>
                <li>No sharing of personal data with third parties without consent</li>
                <li>Campus-only visibility for your profile</li>
                <li>Right to delete your account and data at any time</li>
              </ul>
            </section>

            {/* Content Ownership */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📝</span>
                </div>
                5. Content Ownership
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of all content you post on Campus Connect. However, by posting content, you grant us a 
                license to use, display, and distribute your content within the platform for the purpose of providing 
                our services. You are responsible for ensuring you have the right to post any content you share.
              </p>
            </section>

            {/* Account Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🚫</span>
                </div>
                6. Account Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate accounts that violate these terms. Reasons for termination include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violation of user conduct guidelines</li>
                <li>Providing false information about academic status</li>
                <li>Harassment or inappropriate behavior toward other users</li>
                <li>Use of the platform for unauthorized commercial purposes</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚠️</span>
                </div>
                7. Disclaimer
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Campus Connect is provided "as is" without warranties of any kind. We do not guarantee that you will find 
                suitable study partners or that all users are who they claim to be. Users interact at their own risk, 
                and we encourage meeting in public, campus locations for safety.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔄</span>
                </div>
                8. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these terms from time to time. When we do, we will post the updated terms on this page 
                and update the "Last updated" date. Your continued use of Campus Connect after any changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📧</span>
                </div>
                9. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our support channels 
                or visit our About page for more information about Campus Connect.
              </p>
            </section>

          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6">
              By using Campus Connect, you agree to these terms and can start connecting with your campus community.
            </p>
            {session ? (
              <Link
                href="/discover"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
              >
                Start Discovering
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50/80 backdrop-blur-sm py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎓</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Campus Connect
            </span>
          </div>
          <p className="text-gray-600 mb-6">Building campus friendships through shared interests.</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            © 2024 Campus Connect. Made with 🎓 for campus connections.
          </p>
        </div>
      </footer>
    </div>
  );
}