"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import MatchNotification from "../components/MatchNotification";
import { useMessaging } from "../hooks/useMessaging";

export default function Home() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { conversations, fetchConversations } = useMessaging();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  
  // Calculate total unread messages
  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session, fetchConversations]);
  
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    setTotalUnreadCount(total);
  }, [conversations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Real-time Match Notifications */}
      {session && <MatchNotification onMatchesUpdate={() => {}} />}
      
      {/* Header with Comprehensive Navigation */}
      <header className="w-full p-6 backdrop-blur-sm bg-white/80 border-b border-gray-100 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Home
            </Link>
            {session && (
              <>
                <Link href="/discover" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1">
                  <span>🔍</span>
                  <span>Discover</span>
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1">
                  <span>👤</span>
                  <span>Profile</span>
                </Link>
                <div className="relative">
                  <Link href="/messages" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <span>💬</span>
                    <span>Messages</span>
                    {/* Notification badge */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </Link>
                </div>
              </>
            )}
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
              Support
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
              Privacy
            </Link>
          </nav>

          {/* Right side - Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            ) : session ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="hidden md:flex items-center">
                  <Link 
                    href="/messages"
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <span className="text-xl">🔔</span>
                    {totalUnreadCount > 0 && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{totalUnreadCount > 9 ? '9+' : totalUnreadCount}</span>
                      </div>
                    )}
                  </Link>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {(session.user?.name || session.user?.email)
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-gray-700 font-medium">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <span className="mr-3">👤</span>
                        View Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <span className="mr-3">⚙️</span>
                        Settings
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <span className="mr-3">💬</span>
                        Messages
                        {totalUnreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                          </span>
                        )}
                      </Link>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <span className="mr-3">🚪</span>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 mt-4">
              <Link
                href="/"
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              {session && (
                <>
                  <Link
                    href="/discover"
                    className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🔍 Discover
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    href="/messages"
                    className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 flex items-center justify-between"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>💬 Messages</span>
                    {totalUnreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/settings"
                    className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                </>
              )}
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ℹ️ About
              </Link>
              <Link
                href="/support"
                className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🆘 Support
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📋 Terms
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🔒 Privacy
              </Link>
              {session && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="text-red-600 hover:text-red-700 transition-colors px-2 py-1 text-left"
                  >
                    🚪 Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center">
            {/* Floating academic icons animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-20 left-1/4 text-blue-300 text-2xl animate-bounce"
                style={{ animationDelay: "0s" }}
              >
                📚
              </div>
              <div
                className="absolute top-32 right-1/3 text-indigo-300 text-xl animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                🎓
              </div>
              <div
                className="absolute top-40 left-1/3 text-blue-200 text-lg animate-bounce"
                style={{ animationDelay: "2s" }}
              >
                ✏️
              </div>
              <div
                className="absolute top-28 right-1/4 text-indigo-200 text-xl animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                📝
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Find Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Study Squad
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {status === "loading"
                ? "Connect with fellow college students who share your hobbies, study interests, and passions. Build lasting friendships on campus."
                : session
                ? `Welcome back, ${
                    session.user?.name || session.user?.email?.split("@")[0]
                  }! Find classmates who share your interests and passions.`
                : "Connect with fellow college students who share your hobbies, study interests, and passions. Build lasting friendships on campus."}
            </p>

            {status === "loading" ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="px-8 py-4 bg-gray-200 text-gray-400 rounded-2xl text-lg font-semibold animate-pulse">
                  Loading...
                </div>
              </div>
            ) : session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/discover"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold inline-block"
                >
                  <span className="flex items-center space-x-2">
                    <span>Find Study Buddies</span>
                    <span className="group-hover:animate-pulse">🎓</span>
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-lg font-semibold inline-block text-center"
                >
                  View Profile
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/auth/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
                >
                  <span className="flex items-center space-x-2">
                    <span>Join Your Campus</span>
                    <span className="group-hover:animate-pulse">🎓</span>
                  </span>
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-lg font-semibold"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/60 backdrop-blur-sm py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Why Choose MatchApp for Campus Life?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Interest-Based Matching
                </h3>
                <p className="text-gray-600">
                  Find students who share your hobbies, academic interests, and
                  extracurricular activities.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">🏫</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Campus-Focused
                </h3>
                <p className="text-gray-600">
                  Connect exclusively with students from your university for
                  authentic campus friendships.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Study Groups & Friends
                </h3>
                <p className="text-gray-600">
                  Form study groups, join clubs, and build lasting friendships
                  with like-minded classmates.
                </p>
              </div>
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
          <p className="text-gray-600 mb-6">
            Building campus friendships through shared interests.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <Link
              href="/privacy"
              className="hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-blue-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="hover:text-blue-600 transition-colors"
            >
              Support
            </Link>
            <Link
              href="/about"
              className="hover:text-blue-600 transition-colors"
            >
              About
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            © 2025 MatchApp. Made with 🎓 for campus connections.
          </p>
        </div>
      </footer>
    </div>
  );
}
