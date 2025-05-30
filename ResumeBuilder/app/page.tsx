import UploadForm from './components/UploadForm'

export default function Home() {
  return (
    <div className="resume-builder-container color-splash-hero">
      {/* Hero splash overlay */}
      <div className="hero-splash-overlay"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="final-round-text-gradient">AI Resume Builder</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-medium">
            Transform your career with AI-powered resume creation. 
            Upload your existing resume and get 3 professionally crafted templates 
            tailored to your target role.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-12">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              ATS-Optimized Templates
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              AI Content Enhancement
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Professional LaTeX Formatting
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <UploadForm />
      </div>
    </div>
  )
}
