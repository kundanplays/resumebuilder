"use client";
import { useState } from "react";

type TemplateResult = {
  latex: string;
  pdfBase64: string;
};

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [targetJobRole, setTargetJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, TemplateResult>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    if (!targetJobRole.trim()) return alert("Please enter a target job role");
    if (!experienceLevel) return alert("Please select an experience level");

    setLoading(true);
    setResults({}); // reset previous

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
      alert("Error uploading file: " + (error as Error).message);
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

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xl mx-auto"
      >
        <label className="block font-medium">
          Select Resume File:
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
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
          {loading ? "Processing..." : "Generate Resume Templates"}
        </button>
        
        {!loading && (
          <p className="text-sm text-gray-600 text-center">
            💡 After generation, you'll be able to preview and download your resume templates
          </p>
        )}
      </form>

      {/* Display user selections when results are available */}
      {Object.keys(results).length > 0 && (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✅ Resume Templates Generated Successfully!</h3>
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
            📥 Click the "Download PDF" buttons below to save your resume templates
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
              📥 Download All Templates
            </button>
          </div>
        </div>
      )}

      <div className="flex w-screen gap-4 mx-auto">
        {Object.entries(results).map(([templateNum, { latex, pdfBase64 }]) => {
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
              <h2 className="text-xl font-semibold text-gray-800">Template {templateNum}</h2>
              <p className="text-sm text-gray-600">{templateNames[templateNum as keyof typeof templateNames]}</p>
            </div>

            <div
              className="border rounded overflow-hidden"
              style={{ height: "400px" }}
            >
              <iframe
                src={`data:application/pdf;base64,${pdfBase64}`}
                width="100%"
                height="100%"
                title={`PDF Preview Template ${templateNum}`}
                style={{ border: "none" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  window.open(
                    `data:application/pdf;base64,${pdfBase64}`,
                    "_blank"
                  )
                }
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                👁️ Preview
              </button>

              <button
                onClick={() => handleDownload(pdfBase64, templateNum)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
              >
                📥 Download PDF
              </button>
                         </div>
            </div>
          );
        })}
        </div>
    </div>
  );
}
