'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Support() {
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Support form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
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
          <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
            Privacy
          </Link>
          <Link href="/support" className="text-blue-600 font-medium">
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

      {/* Support Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Support Center
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help you make the most of your MatchApp experience. Find answers or get in touch.
          </p>
        </div>

        {/* Quick Help Categories */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            How Can We Help?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Getting Started</h3>
              <p className="text-gray-600 mb-6">Learn how to create your profile, find matches, and connect with fellow students.</p>
              <button 
                onClick={() => setSelectedCategory('getting-started')}
                className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Get Help
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">🔧</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Technical Issues</h3>
              <p className="text-gray-600 mb-6">Having trouble with the app? Find solutions to common technical problems.</p>
              <button 
                onClick={() => setSelectedCategory('technical')}
                className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                Troubleshoot
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Safety & Privacy</h3>
              <p className="text-gray-600 mb-6">Questions about your privacy, safety features, or reporting concerns.</p>
              <button 
                onClick={() => setSelectedCategory('safety')}
                className="px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg">❓</span>
              </div>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I verify my student status?</h3>
                <p className="text-gray-600">You'll need to sign up with your university email address. We'll send a verification link to confirm your student status.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I connect with students from other universities?</h3>
                <p className="text-gray-600">No, MatchApp is campus-focused. You can only see and connect with verified students from your own university.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Is MatchApp free to use?</h3>
                <p className="text-gray-600">Yes! MatchApp is completely free for all verified college students. Our mission is to help you build campus connections.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I report inappropriate behavior?</h3>
                <p className="text-gray-600">Use the report button on any profile or message. We take safety seriously and investigate all reports promptly.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I delete my account?</h3>
                <p className="text-gray-600">Yes, you can delete your account anytime from your profile settings. All your data will be permanently removed.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What happens after I graduate?</h3>
                <p className="text-gray-600">Your profile will be automatically hidden from discovery. You can still access your existing connections but won't appear in searches.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg">📧</span>
              </div>
              Contact Us
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@university.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Please describe your issue or question in detail..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                Send Message
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <span className="w-5 h-5 text-blue-500 mr-3">📧</span>
                  <span>support@matchapp.com</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="w-5 h-5 text-blue-500 mr-3">⏱️</span>
                  <span>Response time: Within 24 hours</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="w-5 h-5 text-blue-500 mr-3">🌐</span>
                  <span>Available 7 days a week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quick Tips for Success
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">📸</div>
              <h3 className="font-semibold text-gray-800 mb-2">Complete Your Profile</h3>
              <p className="text-sm text-gray-600">Add a photo and fill out all sections to increase your match potential.</p>
            </div>
            
            <div className="bg-indigo-50 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-2">Be Specific</h3>
              <p className="text-sm text-gray-600">List specific interests and study goals to find better matches.</p>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-800 mb-2">Start Conversations</h3>
              <p className="text-sm text-gray-600">Don't be shy! Message your matches about shared interests.</p>
            </div>
            
            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-gray-800 mb-2">Meet Safely</h3>
              <p className="text-sm text-gray-600">Always meet in public campus locations for your first meetups.</p>
            </div>
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