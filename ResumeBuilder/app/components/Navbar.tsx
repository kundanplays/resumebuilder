'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsResourcesOpen(false)
        }
      }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="final-round-nav fixed w-full z-[99998] top-0 color-splash-section">
      {/* Background splash effects for navbar */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -top-10 -left-20 w-32 h-32 bg-gradient-to-tr from-green-400/12 to-blue-600/12 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 z-[99999] bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo - Compact spacing */}
          <div className="flex-shrink-0 mr-2 lg:mr-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10 lg:w-11 lg:h-11">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  IL
                </div>
              </div>
              <span className="text-lg lg:text-xl font-black final-round-text-gradient hidden sm:block">
                Interview Lift
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Optimized spacing for better fit */}
          <div className="hidden lg:flex flex-1 justify-center px-2 max-w-4xl">
            <div className="flex items-center space-x-1 xl:space-x-2">
              <Link href="/interview-copilot" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors whitespace-nowrap hover:bg-blue-50 rounded-lg">
                Interview Copilot
              </Link>
              <Link href="/ai-mock-interview" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors whitespace-nowrap hover:bg-blue-50 rounded-lg">
                AI Mock Interview
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors whitespace-nowrap hover:bg-blue-50 rounded-lg">
                AI Resume Builder
              </Link>
              <Link href="/undetectability" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors whitespace-nowrap hover:bg-blue-50 rounded-lg">
                Undetectability
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors hover:bg-blue-50 rounded-lg">
                Pricing
              </Link>
              
              {/* Resources Dropdown - Compact */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                  className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors flex items-center hover:bg-blue-50 rounded-lg"
                >
                  Resources
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
                
                {isResourcesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 py-1 z-[99999]">
                    <Link href="/about" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                      About Us
                    </Link>
                    <a href="#" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                      Blog
                    </a>
                    <a href="#" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                      Case Studies
                    </a>
                    <Link href="/contact" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                      Contact Us
                    </Link>
                    <a href="#" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                      Help Center
                    </a>
                  </div>
                )}
              </div>
              
              <Link href="/question-bank" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors whitespace-nowrap hover:bg-blue-50 rounded-lg">
                Question Bank
              </Link>
            </div>
          </div>

          {/* CTA Buttons - Ensured visibility with proper spacing */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 min-w-0">
            <a href="#" className="text-gray-700 hover:text-blue-600 px-2 py-1.5 text-sm font-medium transition-colors hover:bg-blue-50 rounded-lg whitespace-nowrap">
              Sign In
            </a>
            <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl whitespace-nowrap">
              Get Started Free
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 p-1"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm border-t border-gray-100 rounded-b-lg">
              <Link href="/interview-copilot" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                Interview Copilot
              </Link>
              <Link href="/ai-mock-interview" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                AI Mock Interview
              </Link>
              <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                AI Resume Builder
              </Link>
              <Link href="/undetectability" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                Undetectability
              </Link>
              <Link href="/pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                Pricing
              </Link>
              <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                About Us
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                Contact
              </Link>
              <Link href="/question-bank" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                Question Bank
              </Link>
              <div className="pt-4 pb-3 border-t border-gray-100">
                <div className="px-3 py-2">
                  <a href="#" className="block text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md px-3 py-2">
                    Sign In
                  </a>
                </div>
                <a href="#" className="block px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md mt-2 shadow-lg">
                  Get Started Free
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 