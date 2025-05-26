"use client";
import { useState } from "react";

type TemplateResult = {
  latex: string;
  pdfBase64: string;
};

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, TemplateResult>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    setResults({}); // reset previous

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (data.templates) {
        // Expected data.templates = { '1': { latex, pdfBase64 }, '2': {...}, '3': {...} }
        setResults(data.templates);
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
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = `resume_template_${templateNum}.pdf`;
    link.click();
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
            className="mt-1"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !file}
        >
          {loading ? "Processing..." : "Upload Resume"}
        </button>
      </form>
      <div className="flex  w-screen gap-4 mx-auto  ">
        {Object.entries(results).map(([templateNum, { latex, pdfBase64 }]) => (
          <div
            key={templateNum}
            className="border rounded p-4 space-y-4 flex flex-col "
          >
            <h2 className="text-xl font-semibold">Template {templateNum}</h2>

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
            <button
              onClick={() =>
                window.open(
                  `data:application/pdf;base64,${pdfBase64}`,
                  "_blank"
                )
              }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Preview PDF (Template {templateNum})
            </button>

            <button
              onClick={() => handleDownload(pdfBase64, templateNum)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download PDF (Template {templateNum})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
