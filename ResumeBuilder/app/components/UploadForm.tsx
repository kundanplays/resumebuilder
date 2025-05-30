"use client";
import { useState, useEffect } from "react";

type TemplateResult = {
  latex: string;
  pdfBase64: string;
  imageUrl?: string;
};

// Declare PDF.js types for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [targetJobRole, setTargetJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, TemplateResult>>({});
  const [previewMode, setPreviewMode] = useState<{templateNum: string, pdfBase64: string, imageUrl?: string} | null>(null);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfLibLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const convertPdfToImage = async (pdfBase64: string): Promise<string> => {
    if (!pdfLibLoaded || !window.pdfjsLib) {
      throw new Error('PDF.js not loaded');
    }

    const pdfData = atob(pdfBase64);
    const pdfArray = new Uint8Array(pdfData.length);
    for (let i = 0; i < pdfData.length; i++) {
      pdfArray[i] = pdfData.charCodeAt(i);
    }

    const pdf = await window.pdfjsLib.getDocument({ data: pdfArray }).promise;
    const page = await pdf.getPage(1); // Get first page

    const viewport = page.getViewport({ scale: 1.5 }); // Good scale for thumbnail
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    
    return canvas.toDataURL('image/png');
  };

  // Generate thumbnails for all templates when results are set
  useEffect(() => {
    const generateThumbnails = async () => {
      if (Object.keys(results).length > 0 && pdfLibLoaded) {
        const updatedResults: Record<string, TemplateResult> = {};
        
        for (const [templateNum, template] of Object.entries(results)) {
          try {
            const imageUrl = await convertPdfToImage(template.pdfBase64);
            updatedResults[templateNum] = { ...template, imageUrl };
          } catch (error) {
            console.error(`Failed to generate thumbnail for template ${templateNum}:`, error);
            updatedResults[templateNum] = template; // Keep original without thumbnail
          }
        }
        
        setResults(updatedResults);
      }
    };

    generateThumbnails();
  }, [pdfLibLoaded, Object.keys(results).length]);

  const simulateProgress = () => {
    const progressSteps = [
      { progress: 10, message: "Uploading and parsing your resume...", duration: 2000 },
      { progress: 25, message: "Analyzing content and extracting information...", duration: 3000 },
      { progress: 40, message: "Generating Professional Blue (Professional Blue)...", duration: 8000 },
      { progress: 55, message: "Compiling Professional Blue to PDF...", duration: 5000 },
      { progress: 70, message: "Generating Modern Green (Modern Green)...", duration: 8000 },
      { progress: 80, message: "Compiling Modern Green to PDF...", duration: 5000 },
      { progress: 90, message: "Generating Compact Classic (Compact Classic)...", duration: 8000 },
      { progress: 95, message: "Compiling Compact Classic to PDF...", duration: 5000 },
      { progress: 100, message: "Finalizing your resume templates...", duration: 2000 }
    ];

    let currentStep = 0;
    
    const updateProgress = () => {
      if (currentStep < progressSteps.length) {
        const step = progressSteps[currentStep];
        setProgress(step.progress);
        setProgressMessage(step.message);
        
        setTimeout(() => {
          currentStep++;
          updateProgress();
        }, step.duration);
      }
    };
    
    updateProgress();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    if (!targetJobRole.trim()) return alert("Please enter a target job role");
    if (!experienceLevel) return alert("Please select an experience level");

    setLoading(true);
    setResults({}); // reset previous
    setProgress(0);
    setProgressMessage("Starting resume generation...");
    
    // Start progress simulation
    simulateProgress();

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetJobRole", targetJobRole.trim());
    formData.append("experienceLevel", experienceLevel);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLoading(false);
      setProgress(100);
      setProgressMessage("Completed!");

      if (!res.ok) {
        // Handle HTTP error responses
        if (res.status === 400 && data.error) {
          alert(`❌ ${data.error}`);
          if (data.supportedFormats) {
            console.log("Supported formats:", data.supportedFormats);
          }
        } else {
          alert(`❌ Server error (${res.status}): ${data.error || 'Unknown error'}`);
        }
        return;
      }

      if (data.templates && Object.keys(data.templates).length > 0) {
        // Expected data.templates = { '1': { latex, pdfBase64 }, '2': {...}, '3': {...} }
        setResults(data.templates);
        const templateCount = Object.keys(data.templates).length;
        if (templateCount < 3) {
          alert(`Successfully generated ${templateCount} out of 3 templates. Some templates may have failed due to compilation issues.`);
        }
      } else {
        alert(
          "No templates found in response: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      setLoading(false);
      setProgress(0);
      setProgressMessage("");
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert("❌ Network error: Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        alert("❌ Error processing your request: " + (error as Error).message);
      }
    }
  };

  const handleDownload = (pdfBase64: string, templateNum: string) => {
    try {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      
      // Create a more descriptive filename
      const jobRole = targetJobRole.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      link.download = `${jobRole}_Resume_Template_${templateNum}_${timestamp}.pdf`;
      
      // Add the link to DOM, click it, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert(`✅ Resume Template ${templateNum} downloaded successfully!`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('❌ Download failed. Please try again.');
    }
  };

  const handlePreview = async (pdfBase64: string, templateNum: string) => {
    try {
      setPreviewMode({ templateNum, pdfBase64 }); // Show modal first
      
      if (pdfLibLoaded) {
        const imageUrl = await convertPdfToImage(pdfBase64);
        setPreviewMode({ templateNum, pdfBase64, imageUrl });
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
      alert('❌ Preview generation failed. The PDF may be corrupted.');
    }
  };

  const closePreview = () => {
    setPreviewMode(null);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xl mx-auto"
      >
        <label className="block font-medium">
          Upload your current resume:
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-sm text-gray-600">
            📄 <strong>Supported formats:</strong> PDF (.pdf) and Plain Text (.txt)
          </p>
          <p className="mt-1 text-xs text-gray-500">
            💡 <strong>Note:</strong> Word documents (.doc/.docx) are not supported. Please convert to PDF format.
          </p>
        </label>

        <label className="block font-medium">
          Target Job Role:
          <input
            type="text"
            value={targetJobRole}
            onChange={(e) => setTargetJobRole(e.target.value)}
            placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block font-medium">
          Experience Level:
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="entry-level">Entry Level (0-2 years)</option>
            <option value="mid-level">Mid Level (2-5 years)</option>
            <option value="senior-level">Senior Level (5-10 years)</option>
            <option value="executive-level">Executive Level (10+ years)</option>
          </select>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          disabled={loading || !file || !targetJobRole.trim() || !experienceLevel}
        >
          {loading ? "Processing..." : "Create New Resume"}
        </button>
        
        {!loading && (
          <p className="text-sm text-gray-600 text-center">
            90% of job seekers get diisqualified because of poor resume.
          </p>
        )}
      </form>

      {/* Progress Bar */}
      {loading && (
        <div className="max-w-xl mx-auto mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900">Creating Your Resume</h3>
            <span className="text-sm font-medium text-blue-700">{progress}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Progress Message */}
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">{progressMessage}</p>
          </div>
          
          {/* Estimated Time */}
          <p className="text-sm text-blue-600 mt-3 text-center">
            This process typically takes 30-60 seconds. Please wait while we craft your professional resume.
          </p>
        </div>
      )}

      {/* Display user selections when results are available */}
      {Object.keys(results).length > 0 && (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Resume Created!</h3>
          <p className="text-green-800">
            <span className="font-medium">Target Role:</span> {targetJobRole}
          </p>
          <p className="text-green-800">
            <span className="font-medium">Experience Level:</span> {experienceLevel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          
          {/* Check for placeholders */}
          {(() => {
            const hasPlaceholders = Object.values(results).some((template: any) => 
              template.latex.includes('[X%]') || template.latex.includes('[Number]') || template.latex.includes('[achieve')
            );
            
            return hasPlaceholders && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>📝 Review Needed:</strong> Your resume contains placeholders like [X%] or [Number] that you should replace with specific metrics from your experience.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
          
          <p className="text-green-700 text-sm mt-2">
            Click the "Download PDF" buttons below to save your resume templates
          </p>
          <div className="mt-3">
            <button
              onClick={() => {
                Object.entries(results).forEach(([templateNum, { pdfBase64 }]) => {
                  setTimeout(() => handleDownload(pdfBase64, templateNum), 100 * parseInt(templateNum));
                });
              }}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors font-semibold"
            >
              Download all
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Resume Preview - Template {previewMode.templateNum}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewMode.imageUrl ? (
                <img
                  src={previewMode.imageUrl}
                  alt={`Resume Template ${previewMode.templateNum} Preview`}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    maxHeight: 'calc(90vh - 200px)',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click
                  draggable={false} // Disable drag
                />
              ) : (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating preview...</p>
                  {!pdfLibLoaded && (
                    <p className="text-sm text-gray-500 mt-2">Loading PDF renderer...</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={closePreview}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-screen gap-4 mx-auto">
        {Object.entries(results).map(([templateNum, { latex, pdfBase64, imageUrl }]) => {
          const templateNames = {
            "1": "Professional Blue",
            "2": "Modern Green", 
            "3": "Compact Classic"
          };
          
          return (
          <div
            key={templateNum}
            className="border-2 border-gray-200 rounded-lg p-4 space-y-4 flex flex-col shadow-lg"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">{templateNames[templateNum as keyof typeof templateNames]}</h2>
            </div>

            <div
              className="border rounded overflow-hidden bg-gray-100 flex items-center justify-center"
              style={{ height: "400px" }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${templateNames[templateNum as keyof typeof templateNames]} Preview`}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click
                  draggable={false} // Disable drag
                />
              ) : (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Generating thumbnail...</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(pdfBase64, templateNum)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                disabled={!pdfLibLoaded}
              >
                {pdfLibLoaded ? 'Preview' : 'Loading...'}
              </button>

              <button
                onClick={() => handleDownload(pdfBase64, templateNum)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
              >
                Download PDF
              </button>
                         </div>
            </div>
          );
        })}
        </div>
    </div>
  );
}
