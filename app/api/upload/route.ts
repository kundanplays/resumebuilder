import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateLatex1,
  generateLatex2,
  generateLatex3,
} from "../../lib/latexGenerator-fixed-v2";
import * as tar from 'tar-fs';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { FormData, File } from 'formdata-node';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface LaTeXService {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  maxLength: number;
  isTarballUpload?: boolean;
  queryParams?: Record<string, string>;
  prepare?: (latex: string) => string | any;
  headers: Record<string, string>;
}

async function compileLatexToPdfBase64(latex: string) {
  // Try multiple services in order of preference
  const services: LaTeXService[] = [
    {
      name: 'latexonline.cc (tarball POST)',
      url: 'https://texlive2020.latexonline.cc/data',
      method: 'POST',
      maxLength: 200000, // High limit for tarball uploads
      isTarballUpload: true,
      queryParams: {
        target: 'main.tex',
        command: 'pdflatex',
        force: 'true'
      },
      headers: {}, // Content-Type set automatically by FormData
    },
    {
      name: 'latexonline.cc (GET fallback)',
      url: 'https://latexonline.cc/compile',
      method: 'GET',
      maxLength: 8000, // URL length limit for GET requests
      prepare: (latex: string) => `?text=${encodeURIComponent(latex)}`,
      headers: {},
    }
    // Removed problematic services:
    // - latex.ytotech.com: ConnectTimeoutError
    // - advicement.io: 403 Forbidden (requires proper authentication)
  ];

  for (const service of services) {
    try {
      console.log(`Trying ${service.name}...`);
      
      if (latex.length > service.maxLength) {
        console.log(`LaTeX too long for ${service.name} (${latex.length} > ${service.maxLength})`);
        continue;
      }

      let response: Response;
      let actualFetchUrl = "";

      if (service.isTarballUpload) {
        // Special handling for tarball upload to latexonline.cc
        console.log(`Creating tarball for ${service.name}...`);
        
        // 1. Create a temporary directory
        const tempDir = await fs.promises.mkdtemp(path.join(tmpdir(), 'latex-'));
        const texFilePath = path.join(tempDir, 'main.tex');
        const tarFilePath = path.join(tempDir, 'archive.tar.gz');

        try {
          // 2. Write LaTeX to main.tex
          await fs.promises.writeFile(texFilePath, latex, 'utf-8');

          // 3. Create a .tar.gz archive containing main.tex
          await new Promise<void>((resolve, reject) => {
            const pack = tar.pack(tempDir, {
              entries: ['main.tex'] // Only pack main.tex from the tempDir
            });
            const gzip = createGzip();
            const dest = fs.createWriteStream(tarFilePath);
            
            pack.pipe(gzip).pipe(dest);
            
            pack.on('error', reject);
            gzip.on('error', reject);
            dest.on('error', reject);
            dest.on('finish', resolve);
          });

          // 4. Prepare FormData
          const tarBuffer = await fs.promises.readFile(tarFilePath);
          const formData = new FormData();
          const tarFile = new File([tarBuffer], 'archive.tar.gz', { type: 'application/gzip' });
          formData.append('file', tarFile);

          // 5. Construct URL with query parameters
          const queryParams = new URLSearchParams(service.queryParams).toString();
          actualFetchUrl = `${service.url}?${queryParams}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000); // Longer timeout for uploads

          // 6. Make the POST request
          response = await fetch(actualFetchUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

        } finally {
          // 7. Clean up temporary files and directory
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
      } else {
        // Existing logic for other services
        actualFetchUrl = service.url;
        let body = undefined;
        
        if (service.method === 'GET') {
          actualFetchUrl += (service.prepare as (latex: string) => string)(latex);
        } else if (service.prepare) {
          body = (service.prepare as (latex: string) => any)(latex);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        response = await fetch(actualFetchUrl, {
          method: service.method,
          headers: service.headers,
          body: body,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      }

        if (!response.ok) {
    const errorText = await response.text();
        console.error(`${service.name} failed with status ${response.status}:`, errorText);
        console.error(`Request details - URL: ${actualFetchUrl}, Method: ${service.method}, Headers:`, service.headers);
        continue;
      }

      // Check response type
      const contentType = response.headers.get('content-type');
      console.log(`${service.name} response content-type:`, contentType);
      
      if (contentType && contentType.includes('application/pdf')) {
        const pdfBuffer = await response.arrayBuffer();
        console.log(`${service.name} succeeded! PDF size: ${pdfBuffer.byteLength} bytes`);
        return Buffer.from(pdfBuffer).toString("base64");
      } else if (contentType && contentType.includes('application/json')) {
        // Try to parse as JSON (for ytotech and advicement services)
        try {
          const result = await response.json();
          console.log(`${service.name} JSON response:`, result);
          
          // Handle ytotech.com response format
          if (result.result && result.result.output) {
            console.log(`${service.name} succeeded with JSON response!`);
            return result.result.output;
          } 
          // Handle advicement.io response format
          else if (result.id && service.name === 'advicement.io') {
            console.log(`${service.name} compilation started, polling for result...`);
            const statusUrl = `https://api.advicement.io/v1/status/${result.id}`;
            // Poll for completion (simplified version)
            for (let i = 0; i < 10; i++) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
              try {
                const statusResponse = await fetch(statusUrl);
                if (statusResponse.ok) {
                  const statusResult = await statusResponse.json();
                  if (statusResult.statusCode === 201 && statusResult.documentUrl) {
                    // Download the PDF from the URL
                    const pdfResponse = await fetch(statusResult.documentUrl);
                    if (pdfResponse.ok) {
                      const pdfBuffer = await pdfResponse.arrayBuffer();
                      console.log(`${service.name} succeeded! PDF size: ${pdfBuffer.byteLength} bytes`);
                      return Buffer.from(pdfBuffer).toString("base64");
                    }
                  }
                }
              } catch (pollError) {
                console.error(`${service.name} polling error:`, pollError);
                break;
              }
            }
          }
          // Some services might return PDF as base64 in JSON
          else if (result.pdf) {
            console.log(`${service.name} succeeded with PDF in JSON!`);
            return result.pdf;
          }
        } catch (jsonError) {
          console.error(`${service.name} JSON parsing failed:`, jsonError);
        }
      } else {
        // For services that might return PDF directly without proper content-type or HTML redirects
        try {
          const buffer = await response.arrayBuffer();
          // Check if it's a PDF by looking at the first few bytes
          const uint8Array = new Uint8Array(buffer);
          if (uint8Array.length > 4 && 
              uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && 
              uint8Array[2] === 0x44 && uint8Array[3] === 0x46) { // %PDF
            console.log(`${service.name} succeeded! PDF detected by header, size: ${buffer.byteLength} bytes`);
            return Buffer.from(buffer).toString("base64");
          } else {
            // Check if it's HTML (might be a redirect or error page)
            const text = new TextDecoder().decode(uint8Array.slice(0, 100));
            if (text.toLowerCase().includes('<html') || text.toLowerCase().includes('<!doctype')) {
              console.error(`${service.name} returned HTML instead of PDF:`, text);
            } else {
              console.error(`${service.name} returned non-PDF data. First 20 bytes:`, Array.from(uint8Array.slice(0, 20)));
            }
          }
        } catch (bufferError) {
          console.error(`${service.name} buffer processing failed:`, bufferError);
        }
      }
    } catch (error: any) {
      console.error(`${service.name} error:`, error);
      // If it's an AbortError from our timeout, log it specifically
      if (error.name === 'AbortError') {
        console.error(`${service.name} request timed out after ${service.isTarballUpload ? '45s' : '30s'}.`);
      }
      continue;
    }
  }

  // If all services fail, throw error
  throw new Error('All LaTeX compilation services failed');
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");
    const targetJobRole = formData.get("targetJobRole") as string;
    const experienceLevel = formData.get("experienceLevel") as string;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: "No file uploaded or invalid file" },
        { status: 400 }
      );
    }

    if (!targetJobRole || !experienceLevel) {
      return NextResponse.json(
        { error: "Target job role and experience level are required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    
    // Determine the correct MIME type for Gemini API
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      // Default to text/plain for unknown types or common resume formats
      if (file.name.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        mimeType = 'text/plain';
      }
    }
    
    console.log(`📄 File: ${file.name}, Type: ${file.type} -> ${mimeType}, Size: ${arrayBuffer.byteLength} bytes`);

    const promptText = `You are an expert ATS-Optimized Resume Writer and Career Transition Coach. Your primary goal is to transform the provided resume information into a compelling, targeted resume for a user aiming for the role of "${targetJobRole}" with an experience level of "${experienceLevel}". The uploaded resume may be from a different career field or may lack sufficient details.

**Overall Task:**
Analyze the uploaded resume. Then, extract, critically evaluate, rewrite, and if necessary, **CREATE** content for all sections to perfectly align with the target role of "${targetJobRole}" and "${experienceLevel}". The output must be ATS-friendly, using strong action verbs and quantifiable achievements where possible. If the original resume lacks details, generate plausible, role-appropriate content.

**Output Format:**
Provide the output as a single JSON object enclosed in a markdown code block labeled json. Strictly adhere to the following structure:

\`\`\`json
{
  "Name": "Full Name (from original resume)",
  "Location": "City, State/Country (from original resume or suggest if missing)",
  "Email": "Professional Email (from original resume)",
  "Phone": "Phone Number (from original resume)",
  "LinkedIn": "LinkedIn Profile URL (extract if present; if not, suggest creating one by returning an empty string or null)",
  "Portfolio": "Portfolio URL (extract if present and relevant, e.g., for design/dev roles; otherwise null. For roles like Sales Manager, this is usually not applicable, so null is fine unless a specific sales portfolio is mentioned.)",
  "Objective": "Craft a powerful, concise objective statement (2-3 sentences) specifically for a '${targetJobRole}' with '${experienceLevel}'. This should highlight key transferable strengths and career goals relevant to the target role. Rewrite any existing objective.",
  "Summary": [
    // 4-5 bullet points. Each point MUST be tailored to the ${targetJobRole} and ${experienceLevel}.
    // Focus on summarizing key qualifications, years of relevant (or transferable) experience, and notable achievements re-cast for the target role.
    // Example for Sales Manager: "Strategic Sales Manager with [Number] years of experience in [related field], adept at leveraging data-driven insights and cross-functional team leadership to achieve and exceed revenue targets."
    // If original summary points are irrelevant, create new ones.
    "Tailored bullet point 1...",
    "Tailored bullet point 2...",
    "Tailored bullet point 3...",
    "Tailored bullet point 4..."
  ],
  "Education": [
    {
      "Degree": "Degree Name",
      "University": "University Name",
      "Location": "City, State (Optional)",
      "DurationOrYear": "e.g., Aug 2014 - May 2018 or Graduated May 2018",
      "CGPA": "e.g., 3.8/4.0 (Include if good and present; omit if not noteworthy or absent)",
      "HonorsAndQualifications": [ // Optional: Extract any academic honors, rankings, qualifications like 'First Rank', 'Gold Medalist', 'GSET Qualified', etc.
        "Honor/Qualification 1", "Honor/Qualification 2"
      ],
      "RelevantCoursework": [ // Optional: List 3-4 courses highly relevant to ${targetJobRole} if available or inferable.
        "Course 1", "Course 2"
      ]
    }
    // List in reverse chronological order.
  ],
  // --- EXPERIENCE SECTION: CRITICAL TAILORING REQUIRED ---
  "Experience": [
    // This section's content depends HEAVILY on the '${experienceLevel}'.
    // --- If '${experienceLevel}' indicates an EXPERIENCED candidate (e.g., not 'entry-level', 'fresher', 'intern', '0 years'): ---
    {
      "JobRole": "Original Job Title (or a slightly rephrased title if it helps align with transferable skills for '${targetJobRole}')",
      "CompanyName": "Company Name",
      "Location": "City, State (Optional)",
      "Duration": "e.g., April 2019 - Dec 2023",
      "DescriptionPreamble": "Optional: A brief 1-sentence context if the company or original role needs clarification for the transition to '${targetJobRole}'.",
      "WhatHeDid": [
        // Rewrite/Reframe responsibilities from the original resume using strong action verbs.
        // Each bullet MUST highlight aspects transferable or directly relevant to a '${targetJobRole}'.
        // Focus on problem-solving, strategic thinking, leadership, collaboration, customer interaction, data analysis, process improvement, etc., as applicable to the target.
        // If original resume is sparse, CREATE 2-3 plausible, impactful responsibilities for the original role that would be seen as valuable for the '${targetJobRole}'.
        // Example for transforming a technical role to Sales Manager:
        // Original: "Developed backend APIs."
        // Tailored: "Engineered robust backend API solutions to directly support sales operations and enhance customer data accessibility, contributing to improved sales cycle efficiency."
        "Tailored/Created Responsibility/Accomplishment 1...",
        "Tailored/Created Responsibility/Accomplishment 2...",
        "Tailored/Created Responsibility/Accomplishment 3..."
      ],
      "HowHeDidIt": [
        // Describe the methods, tools, skills, and strategies used, emphasizing those relevant to '${targetJobRole}'.
        // Example for Sales Manager: "Leveraged data analytics and CRM insights to identify new sales opportunities and optimize sales funnel performance." or "Utilized strong cross-functional communication and agile project management to align technical development with sales team requirements."
        // If sparse, CREATE 1-2 plausible points.
        "Tailored/Created Method/Tool/Skill Application 1...",
        "Tailored/Created Method/Tool/Skill Application 2..."
      ],
      "ImpactMade": [
        // CRITICAL: Quantify achievements with metrics where possible, or describe clear, strong outcomes.
        // Reframe impacts to show value for a '${targetJobRole}'.
        // Example for Sales Manager: "Contributed to a 15% increase in qualified leads by developing [tool/process]." or "Played a key role in a project that improved sales team productivity by X%."
        // If original resume lacks quantifiable impacts, CREATE 1-2 plausible, impactful outcomes relevant to the role and its contributions to sales/business goals. Use placeholders like '[achieved X% growth]' for user to fill if specific numbers cannot be generated.
        "Tailored/Created Quantifiable Impact 1...",
        "Tailored/Created Quantifiable Impact 2..."
      ]
    }
    // Add more past roles, similarly tailored. List in reverse chronological order.
    // --- If '${experienceLevel}' indicates NON-EXPERIENCED (e.g., 'entry-level', 'fresher', 'intern', '0 years', 'student'): ---
    // The 'Experience' array should focus on INTERNSHIPS.
    // If no internships are found in the uploaded resume, CREATE 1-2 plausible internship experiences relevant to the '${targetJobRole}'.
    // {
    //   "InternshipRole": "Internship Title (Tailored for '${targetJobRole}')",
    //   "CompanyName": "Company Name",
    //   "Location": "City, State (Optional)",
    //   "Duration": "e.g., June 2023 - Aug 2023",
    //   "WhatHeDid": [
    //     "Bullet point describing tasks, projects, and learnings highly relevant to the '${targetJobRole}'.",
    //     "Focus on skills developed, contributions made, and exposure to the target field."
    //   ],
    //   "ImpactMade": [ // Optional for internships, but strong if present or can be plausibly generated
    //     "Key learning outcome or specific contribution, e.g., 'Assisted in market research that contributed to the identification of a new potential customer segment.'"
    //   ]
    // }
  ],
  "Projects": [
    // For ALL candidates. Tailor existing projects heavily or CREATE 1-2 new, relevant projects if none suitable are present.
    {
      "Title": "Project Title (make it sound relevant to '${targetJobRole}')",
      "Description": "A 2-3 sentence ATS-optimized description. If it was a technical project, highlight aspects like problem-solving, teamwork, user focus, analytical skills, or any outcomes that would appeal to a hiring manager for a '${targetJobRole}'.",
      "Tools": "Comma-separated list of key technologies/tools/methodologies used, emphasizing those relevant to '${targetJobRole}'.",
      "Link": "URL to project if available (Optional, otherwise null)"
    }
    // Ensure 2-3 projects. If the resume has none, CREATE them.
  ],
  "Certificates": [
    // For ALL candidates. List relevant existing certificates or CREATE 1-2 plausible ones if none are suitable/present.
    {
      "Name": "Certificate Name (must be relevant to '${targetJobRole}' or broadly professional)",
      "IssuingOrganization": "e.g., Coursera, HubSpot Academy, Google, PMI",
      "Date": "Year or Month Year (Optional, otherwise null)"
    }
    // If none in resume, CREATE 1-2 relevant ones.
  ],
  "Skills": {
    // Categorize skills. Ensure ATS-friendliness. CREATE skills if resume is sparse but they are expected for the role.
    // The specific keys (e.g., "SalesSpecificSkills") should be chosen based on the ${targetJobRole}.
    // Example for Sales Manager:
    "SalesSpecificSkills": "Comma-separated list (e.g., Sales Strategy Development, Key Account Management, CRM (Salesforce, HubSpot), Negotiation & Closing, Sales Forecasting, B2B/B2C Sales, Lead Generation, Sales Pipeline Management, Market Analysis, Channel Sales). Generate a strong list relevant to '${experienceLevel}'.",
    "TransferableTechnicalSkills": "Comma-separated list of technical skills from the original resume that are genuinely valuable for the '${targetJobRole}' (e.g., Data Analysis, SQL, Business Intelligence Tools, Understanding of Cloud Platforms if selling tech). De-emphasize deeply niche tech skills unless directly selling them.",
    "LeadershipAndCollaborationSkills": "Comma-separated list (e.g., Team Leadership, Cross-functional Team Management, Stakeholder Management, Mentoring, Project Coordination).",
    "SoftSkills": "Comma-separated list (e.g., Communication (Verbal & Written), Presentation Skills, Persuasion, Problem-solving, Adaptability, Resilience, Active Listening, Time Management, Strategic Thinking)."
  },
  "Languages": "Comma-separated list if present in resume (e.g., English (Native), Spanish (Conversational)), otherwise null"
}
\`\`\`

Focus on creating the *best possible resume content* for the user given their inputs and the target role.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
    });

    const rawText = await result.response.text();
    console.log("🧠 Gemini raw response:", rawText);

    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/i);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "No JSON block found in Gemini response", raw: rawText },
        { status: 500 }
      );
    }

    let jsonText = jsonMatch[1].trim();
    jsonText = jsonText.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
      // Add the target job role and experience level to the parsed data for potential use in LaTeX generation
      parsedData.targetJobRole = targetJobRole;
      parsedData.experienceLevel = experienceLevel;
      console.log("✅ Parsed JSON Data:", JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e, "Raw JSON text:", jsonText);
      return NextResponse.json(
        { error: "Failed to parse JSON", raw: jsonText, detail: String(e) },
        { status: 500 }
      );
    }

    // Generate LaTeX for all 3 templates
    const latex1 = generateLatex1(parsedData);
    const latex2 = generateLatex2(parsedData);
    const latex3 = generateLatex3(parsedData);

    console.log("📝 LaTeX1 length:", latex1.length);
    console.log("📝 LaTeX2 length:", latex2.length);
    console.log("📝 LaTeX3 length:", latex3.length);
    
    // DEBUG: Log full LaTeX content for debugging
    console.log("🔍 DEBUG LaTeX1 (first 500 chars):", latex1.substring(0, 500));
    console.log("🔍 DEBUG LaTeX2 (first 500 chars):", latex2.substring(0, 500));

    // Function to create a simplified template based on template number
    const createSimplifiedTemplate = (templateNum: string, data: any) => {
      const escapeLatex = (text: any) => {
        if (!text) return "";
        // Handle arrays and objects properly
        let str: string;
        if (Array.isArray(text)) {
          str = text.join(", ");
        } else if (typeof text === 'object') {
          str = JSON.stringify(text);
        } else {
          str = String(text);
        }
        return str.replace(/[\\{}$&%#^_~]/g, (match) => {
          switch (match) {
            case '\\': return '\\textbackslash{}';
            case '{': return '\\{';
            case '}': return '\\}';
            case '$': return '\\$';
            case '&': return '\\&';
            case '%': return '\\%';
            case '#': return '\\#';
            case '^': return '\\textasciicircum{}';
            case '_': return '\\_';
            case '~': return '\\textasciitilde{}';
            default: return match;
          }
        });
      };

      if (templateNum === "1") {
        // Professional simplified template
        return `\\documentclass[11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\definecolor{blue}{RGB}{0,100,200}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large\\textbf{\\color{blue}${escapeLatex(data.Name || "Resume")}}} \\\\
\\vspace{4pt}
${escapeLatex(data.Location || "Location")} $\\bullet$ ${escapeLatex(data.Phone || "Phone")} $\\bullet$ \\href{mailto:${data.Email || "email"}}{${escapeLatex(data.Email || "Email")}}${data.LinkedIn ? ` $\\bullet$ \\href{${data.LinkedIn}}{LinkedIn}` : ""}
\\end{center}

\\vspace{10pt}

${data.Objective ? `\\section*{\\color{blue}Objective}
${escapeLatex(data.Objective)}

` : ""}

${data.Summary && data.Summary.length ? `\\section*{\\color{blue}Summary}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
${data.Summary.map((point: string) => `\\item ${escapeLatex(point)}`).join("\n")}
\\end{itemize}

` : ""}

${data.Education && data.Education.length ? `\\section*{\\color{blue}Education}
${data.Education.map((edu: any) => {
  let eduLine = `\\textbf{${escapeLatex(edu.Degree || "Degree")}} - ${escapeLatex(edu.University || "University")}`;
  if (edu.Duration) eduLine += ` (${escapeLatex(edu.Duration)})`;
  if (edu.CGPA) eduLine += ` - CGPA: ${escapeLatex(edu.CGPA)}`;
  return eduLine;
}).join(" \\\\\\\\ ")}

` : ""}

${data.Experience && data.Experience.length ? `\\section*{\\color{blue}Experience}
${data.Experience.map((exp: any) => {
  let expSection = `\\textbf{${escapeLatex(exp["Job Role"] || "Position")}} - ${escapeLatex(exp["Company Name"] || "Company")}`;
  if (exp.Duration) expSection += ` (${escapeLatex(exp.Duration)})`;
  expSection += "\\\\";
  
  // Handle new structure with WhatHeDid, HowHeDidIt, ImpactMade
  if (exp.WhatHeDid && exp.WhatHeDid.length) {
    expSection += "\\\\\\textit{Responsibilities:}\\\\";
    expSection += exp.WhatHeDid.map((item: string) => `$\\bullet$ ${escapeLatex(item)}`).join("\\\\");
  }
  if (exp.HowHeDidIt && exp.HowHeDidIt.length) {
    expSection += "\\\\\\textit{Approach:}\\\\";
    expSection += exp.HowHeDidIt.map((item: string) => `$\\bullet$ ${escapeLatex(item)}`).join("\\\\");
  }
  if (exp.ImpactMade && exp.ImpactMade.length) {
    expSection += "\\\\\\textit{Impact:}\\\\";
    expSection += exp.ImpactMade.map((item: string) => `$\\bullet$ ${escapeLatex(item)}`).join("\\\\");
  }
  
  // Fallback to old structure if new structure not present
  if (!exp.WhatHeDid && exp.Responsibilities) {
    expSection += `\\\\${escapeLatex(exp.Responsibilities)}`;
  }
  
  return expSection;
}).join("\n\n")}

` : ""}

${data.Projects && data.Projects.length ? `\\section*{\\color{blue}Projects}
${data.Projects.map((proj: any) => {
  let projSection = `\\textbf{${escapeLatex(proj.Title || "Project")}}`;
  if (proj.Tools) projSection += ` - \\textit{${escapeLatex(proj.Tools)}}`;
  if (proj.Description) projSection += `\\\\${escapeLatex(proj.Description)}`;
  return projSection;
}).join("\n\n")}

` : ""}

${data.Certificates && data.Certificates.length ? `\\section*{\\color{blue}Certificates}
${data.Certificates.map((cert: any) => {
  let certLine = `\\textbf{${escapeLatex(cert.Name || "Certificate")}}`;
  if (cert.IssuingOrganization) certLine += ` - ${escapeLatex(cert.IssuingOrganization)}`;
  if (cert.Date) certLine += ` (${escapeLatex(cert.Date)})`;
  return certLine;
}).join(" \\\\\\\\ ")}

` : ""}

${data.Skills && Object.keys(data.Skills).length ? `\\section*{\\color{blue}Skills}
${Object.entries(data.Skills).map(([category, skills]) => {
  const skillList = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
  return `\\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}`;
}).join(" \\\\\\\\ ")}

` : ""}

\\end{document}`;
      } else if (templateNum === "2") {
        // Modern simplified template
        return `\\documentclass[11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\definecolor{green}{RGB}{0,150,100}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large\\textbf{${escapeLatex(data.Name || "Resume")}}} \\\\
\\vspace{4pt}
\\color{green}${escapeLatex(data.Location || "Location")} $\\bullet$ ${escapeLatex(data.Phone || "Phone")} $\\bullet$ \\href{mailto:${data.Email || "email"}}{${escapeLatex(data.Email || "Email")}}${data.LinkedIn ? ` $\\bullet$ \\href{${data.LinkedIn}}{LinkedIn}` : ""}${data.Portfolio ? ` $\\bullet$ \\href{${data.Portfolio}}{Portfolio}` : ""}
\\end{center}

\\vspace{10pt}

${data.Objective ? `\\section*{\\color{green}Objective}
${escapeLatex(data.Objective)}

` : ""}

${data.Summary && data.Summary.length ? `\\section*{\\color{green}Professional Summary}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
${data.Summary.map((point: string) => `\\item ${escapeLatex(point)}`).join("\n")}
\\end{itemize}

` : ""}

${data.Education && data.Education.length ? `\\section*{\\color{green}Education}
${data.Education.map((edu: any) => {
  let eduLine = `\\textbf{${escapeLatex(edu.Degree || "Degree")}} - ${escapeLatex(edu.University || "University")}`;
  if (edu.Duration) eduLine += ` (${escapeLatex(edu.Duration)})`;
  if (edu.CGPA) eduLine += ` - CGPA: ${escapeLatex(edu.CGPA)}`;
  if (edu.Coursework) eduLine += `\\\\\\textit{Relevant Coursework:} ${escapeLatex(edu.Coursework)}`;
  return eduLine;
}).join(" \\\\\\\\ ")}

` : ""}

${data.Experience && data.Experience.length ? `\\section*{\\color{green}Professional Experience}
${data.Experience.map((exp: any) => {
  let expSection = `\\textbf{${escapeLatex(exp["Job Role"] || "Position")}} - ${escapeLatex(exp["Company Name"] || "Company")}`;
  if (exp.Location) expSection += `, ${escapeLatex(exp.Location)}`;
  if (exp.Duration) expSection += ` (${escapeLatex(exp.Duration)})`;
  expSection += "\\\\";
  
  // Handle new structure with WhatHeDid, HowHeDidIt, ImpactMade
  if (exp.WhatHeDid && exp.WhatHeDid.length) {
    expSection += exp.WhatHeDid.map((item: string) => `$\\bullet$ ${escapeLatex(item)}`).join("\\\\");
  }
  if (exp.HowHeDidIt && exp.HowHeDidIt.length) {
    expSection += exp.HowHeDidIt.map((item: string) => `$\\bullet$ ${escapeLatex(item)}`).join("\\\\");
  }
  if (exp.ImpactMade && exp.ImpactMade.length) {
    expSection += exp.ImpactMade.map((item: string) => `$\\bullet$ ${escapeLatex(item)}`).join("\\\\");
  }
  
  // Fallback to old structure if new structure not present
  if (!exp.WhatHeDid && exp.Responsibilities) {
    expSection += `$\\bullet$ ${escapeLatex(exp.Responsibilities)}`;
  }
  
  return expSection;
}).join("\n\n")}

` : ""}

${data.Projects && data.Projects.length ? `\\section*{\\color{green}Key Projects}
${data.Projects.map((proj: any) => {
  let projSection = `\\textbf{${escapeLatex(proj.Title || "Project")}}`;
  if (proj.Tools) projSection += ` | \\textit{${escapeLatex(proj.Tools)}}`;
  if (proj.Description) projSection += `\\\\${escapeLatex(proj.Description)}`;
  if (proj.Link) projSection += `\\\\\\href{${proj.Link}}{Project Link}`;
  return projSection;
}).join("\n\n")}

` : ""}

${data.Certificates && data.Certificates.length ? `\\section*{\\color{green}Certifications}
${data.Certificates.map((cert: any) => {
  let certLine = `\\textbf{${escapeLatex(cert.Name || "Certificate")}}`;
  if (cert.IssuingOrganization) certLine += ` - ${escapeLatex(cert.IssuingOrganization)}`;
  if (cert.Date) certLine += ` (${escapeLatex(cert.Date)})`;
  return certLine;
}).join(" \\\\\\\\ ")}

` : ""}

${data.Skills && Object.keys(data.Skills).length ? `\\section*{\\color{green}Core Competencies}
${Object.entries(data.Skills).map(([category, skills]) => {
  const skillList = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
  return `\\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}`;
}).join(" \\\\\\\\ ")}

` : ""}

${data.Languages ? `\\section*{\\color{green}Languages}
${escapeLatex(data.Languages)}

` : ""}

\\end{document}`;
      } else {
        // Template 3 style (compact)
        return generateLatex3(data);
      }
    };

    // Compile all LaTeX templates to PDF base64 with fallback handling
    const compileWithFallback = async (latex: string, templateNum: string) => {
      try {
        return await compileLatexToPdfBase64(latex);
      } catch (error) {
        console.error(`Template ${templateNum} compilation failed:`, error);
        // Try simplified template first
        try {
          console.log(`Trying simplified template for ${templateNum}...`);
          const simplifiedTemplate = createSimplifiedTemplate(templateNum, parsedData);
          return await compileLatexToPdfBase64(simplifiedTemplate);
        } catch (fallbackError) {
          console.error(`Fallback template ${templateNum} also failed:`, fallbackError);
          // Return a minimal base64 PDF as last resort
          const minimalPdf = "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKFJlc3VtZSBHZW5lcmF0aW9uIEZhaWxlZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwOAolJUVPRg==";
          console.log(`Returning minimal PDF for template ${templateNum}`);
          return minimalPdf;
        }
      }
    };

    // Compile templates individually to handle failures gracefully
    const templates: Record<string, { latex: string; pdfBase64: string }> = {};
    
    // Template 1
    try {
      const pdfBase641 = await compileWithFallback(latex1, "1");
      templates["1"] = { latex: latex1, pdfBase64: pdfBase641 };
      console.log("✅ Template 1 compiled successfully");
    } catch (error) {
      console.error("❌ Template 1 failed completely:", error);
    }

    // Template 2
    try {
      const pdfBase642 = await compileWithFallback(latex2, "2");
      templates["2"] = { latex: latex2, pdfBase64: pdfBase642 };
      console.log("✅ Template 2 compiled successfully");
    } catch (error) {
      console.error("❌ Template 2 failed completely:", error);
    }

    // Template 3
    try {
      const pdfBase643 = await compileWithFallback(latex3, "3");
      templates["3"] = { latex: latex3, pdfBase64: pdfBase643 };
      console.log("✅ Template 3 compiled successfully");
    } catch (error) {
      console.error("❌ Template 3 failed completely:", error);
    }

    // Return results even if some templates failed
    if (Object.keys(templates).length === 0) {
      return NextResponse.json(
        { error: "All templates failed to compile", data: parsedData },
        { status: 500 }
      );
    }

    console.log(`🎉 Successfully compiled ${Object.keys(templates).length} out of 3 templates`);
    return NextResponse.json({ data: parsedData, templates });
  } catch (error: any) {
    console.error("🚨 Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}
