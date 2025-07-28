'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Privacy() {
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
              MatchApp
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
          <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-blue-600 font-medium">
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

      {/* Privacy Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. Learn how we protect and handle your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Privacy Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🛡️</span>
                </div>
                Our Commitment to Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At MatchApp, we understand that your privacy is fundamental to your trust in our platform. This Privacy Policy 
                explains how we collect, use, protect, and handle your personal information when you use our campus connection service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📊</span>
                </div>
                Information We Collect
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>University email address (for verification)</li>
                    <li>Name and basic profile information</li>
                    <li>University affiliation and academic year</li>
                    <li>Major and academic interests</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Bio and personal interests</li>
                    <li>Study preferences and academic goals</li>
                    <li>Profile photos (optional)</li>
                    <li>Activity preferences and hobbies</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Platform interactions and preferences</li>
                    <li>Connection history and matches</li>
                    <li>Login times and activity patterns</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🎯</span>
                </div>
                How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information exclusively to provide and improve our campus connection services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Match you with compatible study partners and friends on your campus</li>
                <li>Verify your student status and university affiliation</li>
                <li>Provide personalized recommendations based on your interests</li>
                <li>Improve our matching algorithms and user experience</li>
                <li>Send important updates about your account and matches</li>
                <li>Ensure platform safety and prevent misuse</li>
                <li>Provide customer support when requested</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🤝</span>
                </div>
                Information Sharing and Disclosure
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We maintain strict control over your personal information:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">What We Share</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Only your public profile information with potential matches on your campus</li>
                    <li>Anonymous, aggregated data for research and platform improvement</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">What We Never Share</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Your email address or contact information</li>
                    <li>Personal information with third parties for marketing</li>
                    <li>Data with users from other universities</li>
                    <li>Private messages or sensitive profile details</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔐</span>
                </div>
                Data Security and Protection
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Encrypted data transmission and secure storage</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Limited access to personal data by authorized personnel only</li>
                <li>Secure authentication and session management</li>
                <li>Regular backups with encrypted storage</li>
                <li>Compliance with educational privacy standards</li>
              </ul>
            </section>

            {/* Campus-Specific Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🏫</span>
                </div>
                Campus-Specific Privacy Features
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a campus-focused platform, we provide additional privacy protections:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your profile is only visible to verified students from your university</li>
                <li>University email verification ensures authentic student community</li>
                <li>No cross-campus data sharing or visibility</li>
                <li>Ability to control who can see specific profile information</li>
                <li>Anonymous browsing options for exploring potential connections</li>
                <li>Immediate profile hiding if you graduate or leave your university</li>
              </ul>
            </section>

            {/* Your Rights and Controls */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚙️</span>
                </div>
                Your Rights and Controls
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have full control over your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Access and download all your personal data</li>
                <li>Update or correct your profile information at any time</li>
                <li>Control visibility settings for different parts of your profile</li>
                <li>Delete your account and all associated data permanently</li>
                <li>Opt out of optional communications and notifications</li>
                <li>Request information about how your data is being used</li>
                <li>Report privacy concerns or data misuse</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🕒</span>
                </div>
                Data Retention and Deletion
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your information only as long as necessary:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Active account data is retained while your account is active</li>
                <li>Deleted accounts are permanently removed within 30 days</li>
                <li>Some data may be retained for legal compliance or safety purposes</li>
                <li>Anonymous usage statistics may be retained for platform improvement</li>
                <li>You can request immediate data deletion at any time</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👶</span>
                </div>
                Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                MatchApp is designed for college students aged 18 and older. We do not knowingly collect personal 
                information from anyone under 18. If we become aware that we have collected personal information 
                from someone under 18, we will promptly delete such information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔄</span>
                </div>
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
                requirements. When we make significant changes, we will notify you via email or through the platform. 
                Your continued use of MatchApp after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📧</span>
                </div>
                Contact Us About Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, want to exercise your privacy rights, or have 
                concerns about how we handle your personal information, please contact our privacy team through our 
                support channels. We're committed to addressing your privacy concerns promptly and transparently.
              </p>
            </section>

          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Your Privacy, Our Priority</h2>
            <p className="text-blue-100 mb-6">
              We're committed to maintaining your trust through transparent privacy practices and secure data handling.
            </p>
            {session ? (
              <Link
                href="/profile"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
              >
                Manage Privacy Settings
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
              >
                Join Securely
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
              MatchApp
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
            © 2024 MatchApp. Made with 🎓 for campus connections.
          </p>
        </div>
      </footer>
    </div>
  );
}