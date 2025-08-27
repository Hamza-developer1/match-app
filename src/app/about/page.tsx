"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function About() {
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
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link href="/about" className="text-blue-600 font-medium">
            About
          </Link>
          <Link
            href="/terms"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/support"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Support
          </Link>
        </nav>

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
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {(session.user?.name || session.user?.email)
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {session.user?.name || session.user?.email?.split("@")[0]}
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

      {/* About Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              About Campus Connect
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connecting college students through shared interests, academic
            pursuits, and campus life.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Our Mission
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              Campus Connect was created to solve one of the biggest challenges in
              college life: finding your tribe. We believe that meaningful
              connections are the foundation of a successful and fulfilling
              college experience. Our platform helps students discover
              classmates who share their academic interests, hobbies, and
              passions, making it easier to form study groups, join clubs, and
              build lasting friendships.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Create Your Profile
              </h3>
              <p className="text-gray-600">
                Share your university, major, interests, and what you're looking
                for in a study buddy or friend.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Discover Matches
              </h3>
              <p className="text-gray-600">
                Browse through profiles of students from your campus who share
                similar interests and academic goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Connect & Collaborate
              </h3>
              <p className="text-gray-600">
                Start conversations, form study groups, and build meaningful
                friendships that enhance your college experience.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Privacy & Safety
                </h3>
              </div>
              <p className="text-gray-600">
                Your safety is our priority. We verify university affiliations
                and maintain strict privacy controls.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Authentic Connections
                </h3>
              </div>
              <p className="text-gray-600">
                We focus on meaningful connections based on shared interests
                rather than superficial criteria.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🎓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Academic Success
                </h3>
              </div>
              <p className="text-gray-600">
                We believe that collaboration and friendship enhance learning
                and academic achievement.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Inclusive Community
                </h3>
              </div>
              <p className="text-gray-600">
                We welcome students from all backgrounds and celebrate the
                diversity that makes campus life rich.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-12 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Making Campus Connections</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">900+</div>
              <div className="text-blue-100">Universities Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">275+</div>
              <div className="text-blue-100">Academic Majors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Campus Focused</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Ready to Find Your Study Squad?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already discovered their perfect
            study partners and campus friends.
          </p>
          {session ? (
            <Link
              href="/discover"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
            >
              Start Discovering
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
            >
              Get Started Today
            </Link>
          )}
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
            © 2025 Campus Connect. Made with 🎓 for campus connections.
          </p>
        </div>
      </footer>
    </div>
  );
}
