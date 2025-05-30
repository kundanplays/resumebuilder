'use client'
import { Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {

  return (
    <footer className="bg-gray-900 text-white py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Interview Lift
            </div>
            <p className="text-gray-300 mb-6 max-w-md font-medium">
              Your trusted platform to ace any job interviews, craft the perfect resumes, and land your dream jobs.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">+91 867 801 8444</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">kundan@interviewlift.com</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://www.linkedin.com/company/interviewlift" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <span className="sr-only">LinkedIn</span>
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  in
                </div>
              </a>
              <a 
                href="https://www.instagram.com/interviewlift/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <span className="sr-only">Instagram</span>
                <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  ig
                </div>
              </a>
              <a 
                href="https://wa.me/+918678018444" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <span className="sr-only">WhatsApp</span>
                <div className="h-6 w-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  wa
                </div>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/interview-copilot" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Interview Copilot
                </Link>
              </li>
              <li>
                <Link 
                  href="/undetectability" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Undetectability
                </Link>
              </li>
              <li>
                <Link 
                  href="/ai-mock-interview" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  AI Mock Interview
                </Link>
              </li>
              <li>
                <Link 
                  href="/" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link 
                  href="/question-bank" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Question Bank
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/#how-it-works" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  How Interview Lift works
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  About
                </Link>
              </li>
              <li>
                <a 
                  href="#careers" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Careers
                </a>
              </li>
              <li>
                <Link 
                  href="/about#press" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#blog" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Blog
                </a>
              </li>
              <li>
                <Link 
                  href="/contact#help" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <a 
                  href="#community" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Community
                </a>
              </li>
              <li>
                <a 
                  href="#api-docs" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  API Docs
                </a>
              </li>
              <li>
                <a 
                  href="#status" 
                  className="hover:text-white transition-colors font-medium text-gray-300"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0 font-medium">
            © 2025 Interview Lift,<br />
            201, Haeli Hira, Gandhi Nagar, Patna, 800025
          </div>
          <div className="flex space-x-6 text-gray-400 text-sm">
            <a href="#privacy" className="hover:text-white transition-colors font-medium">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors font-medium">Terms of Service</a>
            <a href="#cookies" className="hover:text-white transition-colors font-medium">Cookie Policy</a>
          </div>
        </div>

        {/* Large Stylized Brand Text */}
        <div className="mt-16 text-center">
          <div className="text-6xl md:text-8xl lg:text-9xl font-black leading-none">
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent opacity-20 hover:opacity-40 transition-opacity duration-500">
              Interview Lift
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
} 