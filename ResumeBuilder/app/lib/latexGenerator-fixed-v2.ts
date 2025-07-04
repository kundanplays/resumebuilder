export function escapeLatex(input: any): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str.replace(/([\\{}_&%#$^~])/g, (match) => {
    switch (match) {
      case "\\":
        return "\\textbackslash{}";
      case "{":
        return "\\{";
      case "}":
        return "\\}";
      case "_":
        return "\\_";
      case "&":
        return "\\&";
      case "%":
        return "\\%";
      case "#":
        return "\\#";
      case "$":
        return "\\$";
      case "^":
        return "\\textasciicircum{}";
      case "~":
        return "\\textasciitilde{}";
      default:
        return match;
    }
  });
}

// ------------------- Professional Blue: Professional Blue Style -------------------
export function generateLatex1(data: any = {}): string {
  const {
    Name = "John Doe",
    Location = "Your Location",
    Email = "youremail@yourdomain.com",
    Phone = "0541 999 99 99",
    LinkedIn = "",
    Portfolio = "",
    Objective = "",
    Summary = [],
    Education = [],
    Experience = [],
    Skills = {},
    Projects = [],
    Certificates = [],
    Languages = "",
  } = data;

  const formatExperience = (exp: any) => {
    // Fix: Check both JobRole and "Job Role" to handle Gemini JSON format
    const jobRole = exp.JobRole || exp["Job Role"] || "Software Engineer";
    const company = exp.CompanyName || exp["Company Name"] || "Tech Company";
    const duration = exp.Duration || "2020-Present";
    const location = exp.Location || "";

    let highlights: string[] = [];
    
    if (exp.WhatHeDid && Array.isArray(exp.WhatHeDid)) {
      highlights.push(...exp.WhatHeDid.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    if (exp.HowHeDidIt && Array.isArray(exp.HowHeDidIt)) {
      highlights.push(...exp.HowHeDidIt.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    if (exp.ImpactMade && Array.isArray(exp.ImpactMade)) {
      highlights.push(...exp.ImpactMade.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    
    if (highlights.length === 0 && exp.Responsibilities) {
      highlights.push(`\\item ${escapeLatex(exp.Responsibilities)}`);
    }

    return `\\textbf{${escapeLatex(jobRole)}} - ${escapeLatex(company)} \\hfill ${escapeLatex(duration)}${location ? `\\\\ \\textit{${escapeLatex(location)}}` : ""}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
${highlights.join("\n")}
\\end{itemize}`;
  };

  const formatProjects = (projects: any[]) => {
    return projects.map(proj => {
      const title = proj.Title || proj.title || "Project Title";
      const description = proj.Description || proj.description || "Project description";
      const tools = proj.Tools || proj.tools || "Technologies used";
      const link = proj.Link || proj.link || "";
      
      return `\\textbf{${escapeLatex(title)}}${link ? ` - \\href{${link}}{${link}}` : ""}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
\\item ${escapeLatex(description)}
\\item \\textbf{Tools:} ${escapeLatex(tools)}
\\end{itemize}`;
    }).join("\n\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj).map(([category, skills]) => {
      const skillList = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
      return `\\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}`;
    }).join(" \\\\\n");
  };

  const formatCertificates = (certificates: any[]) => {
    return certificates.map(cert => {
      const name = cert.Name || cert.name || "Certificate Name";
      const organization = cert.IssuingOrganization || cert.organization || "Issuing Organization";
      const date = cert.Date || cert.date || "";
      const expiryDate = cert.ExpiryDate || "";
      const certNumber = cert.CertificateNumber || "";
      const verificationURL = cert.VerificationURL || "";
      const additionalDetails = cert.AdditionalDetails || "";
      
      let certLine = `\\textbf{${escapeLatex(name)}} - ${escapeLatex(organization)}`;
      if (date) certLine += ` (${escapeLatex(date)})`;
      if (expiryDate) certLine += ` - Expires: ${escapeLatex(expiryDate)}`;
      if (certNumber) certLine += `\\\\Certificate ID: ${escapeLatex(certNumber)}`;
      if (verificationURL) certLine += `\\\\Verification: \\href{${verificationURL}}{${verificationURL}}`;
      if (additionalDetails) certLine += `\\\\${escapeLatex(additionalDetails)}`;
      
      return certLine;
    }).join(" \\\\\n");
  };

  return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\definecolor{primaryblue}{RGB}{0,100,200}

\\titleformat{\\section}{\\color{primaryblue}\\bfseries\\Large}{}{0pt}{}[\\color{primaryblue}\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

% Header
\\begin{center}
{\\Huge\\bfseries\\color{primaryblue} ${escapeLatex(Name)}} \\\\
\\vspace{4pt}
{\\large ${escapeLatex(Location)} $\\bullet$ ${escapeLatex(Phone)} $\\bullet$ \\href{mailto:${escapeLatex(Email)}}{${escapeLatex(Email)}}${data.LinkedIn ? ` $\\bullet$ \\href{${data.LinkedIn}}{LinkedIn}` : ""}${data.Portfolio ? ` $\\bullet$ \\href{${data.Portfolio}}{Portfolio}` : ""}}
\\end{center}

\\vspace{12pt}

${Objective ? `\\section{Objective}
${escapeLatex(Objective)}

` : ""}

${Summary.length ? `\\section{Professional Summary}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
${Summary.map((point: string) => `\\item ${escapeLatex(point)}`).join("\n")}
\\end{itemize}

` : ""}

${Education.length ? `\\section{Education}
${Education.map((edu: any) => {
  // Debug logging for education data
  console.log('🔍 Education Debug - edu object:', JSON.stringify(edu, null, 2));
  console.log('🔍 edu.Duration:', edu.Duration, 'Type:', typeof edu.Duration);
  console.log('🔍 edu.DurationOrYear:', edu.DurationOrYear, 'Type:', typeof edu.DurationOrYear);
  
  const degree = edu.Degree || "Bachelor of Science";
  const university = edu.University || "University Name";
  // Fix: Only use duration if it exists, don't provide fallback years
  const duration = edu.DurationOrYear || edu.Duration || "";
  const cgpa = edu.CGPA ? ` - GPA: ${escapeLatex(edu.CGPA)}` : "";
  const coursework = edu.RelevantCoursework && edu.RelevantCoursework.length ? `\\\\\\textit{Relevant Coursework:} ${escapeLatex(edu.RelevantCoursework.join(', '))}` : "";
  const honors = edu.HonorsAndQualifications && edu.HonorsAndQualifications.length ? `\\\\\\textit{${escapeLatex(edu.HonorsAndQualifications.join(', '))}}` : "";
  
  // Only show duration if it exists
  const durationPart = duration ? ` \\hfill ${escapeLatex(duration)}` : "";
  
  return `\\textbf{${escapeLatex(degree)}} - ${escapeLatex(university)}${durationPart}${cgpa}${coursework}${honors}`;
}).join(" \\\\\n")}

` : ""}

${Experience.length ? `\\section{Professional Experience}
${Experience.map(formatExperience).join("\n\n")}

` : ""}

${Projects.length ? `\\section{Projects}
${formatProjects(Projects)}

` : ""}

${Object.keys(Skills).length ? `\\section{Technical Skills}
${formatSkills(Skills)}

` : ""}

${Certificates.length ? `\\section{Certifications}
${formatCertificates(Certificates)}

` : ""}

${Languages ? `\\section{Languages}
${escapeLatex(Languages)}

` : ""}

\\end{document}`;
}

// ------------------- Modern Green: Modern Green Style (Fixed) -------------------
export function generateLatex2(data: any = {}): string {
  const {
    Name = "John Doe",
    Location = "Your Location",
    Email = "youremail@yourdomain.com",
    Phone = "0541 999 99 99",
    LinkedIn = "",
    Portfolio = "",
    Objective = "",
    Summary = [],
    Education = [],
    Experience = [],
    Skills = {},
    Projects = [],
    Certificates = [],
    Languages = "",
  } = data;

  const formatExperience = (exp: any) => {
    // Fix: Check both JobRole and "Job Role" to handle Gemini JSON format
    const jobRole = exp.JobRole || exp["Job Role"] || "Software Engineer";
    const company = exp.CompanyName || exp["Company Name"] || "Tech Company";
    const duration = exp.Duration || "2020-Present";
    const location = exp.Location || "";

    let highlights: string[] = [];
    
    if (exp.WhatHeDid && Array.isArray(exp.WhatHeDid)) {
      highlights.push(...exp.WhatHeDid.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    if (exp.HowHeDidIt && Array.isArray(exp.HowHeDidIt)) {
      highlights.push(...exp.HowHeDidIt.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    if (exp.ImpactMade && Array.isArray(exp.ImpactMade)) {
      highlights.push(...exp.ImpactMade.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    
    if (highlights.length === 0 && exp.Responsibilities) {
      highlights.push(`\\item ${escapeLatex(exp.Responsibilities)}`);
    }

    return `\\textbf{${escapeLatex(jobRole)}} | \\textit{${escapeLatex(company)}} \\hfill ${escapeLatex(duration)}${location ? `\\\\ \\textcolor{gray}{${escapeLatex(location)}}` : ""}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
${highlights.join("\n")}
\\end{itemize}`;
  };

  const formatProjects = (projects: any[]) => {
    return projects.map(proj => {
      const title = proj.Title || proj.title || "Project Title";
      const description = proj.Description || proj.description || "Project description";
      const tools = proj.Tools || proj.tools || "Technologies used";
      const link = proj.Link || proj.link || "";
      
      return `\\textbf{\\textcolor{primarygreen}{${escapeLatex(title)}}}${link ? ` | \\href{${link}}{\\textcolor{gray}{View Project}}` : ""}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
\\item ${escapeLatex(description)}
\\item \\textbf{Technologies:} ${escapeLatex(tools)}
\\end{itemize}`;
    }).join("\n\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj).map(([category, skills]) => {
      const skillList = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
      return `\\textbf{\\textcolor{primarygreen}{${escapeLatex(category)}:}} ${escapeLatex(skillList)}`;
    }).join(" \\\\\n");
  };

  const formatCertificates = (certificates: any[]) => {
    return certificates.map(cert => {
      const name = cert.Name || cert.name || "Certificate Name";
      const organization = cert.IssuingOrganization || cert.organization || "Issuing Organization";
      const date = cert.Date || cert.date || "";
      const expiryDate = cert.ExpiryDate || "";
      const certNumber = cert.CertificateNumber || "";
      const verificationURL = cert.VerificationURL || "";
      const additionalDetails = cert.AdditionalDetails || "";
      
      let certLine = `\\textbf{${escapeLatex(name)}} - ${escapeLatex(organization)}`;
      if (date) certLine += ` (${escapeLatex(date)})`;
      if (expiryDate) certLine += ` - Expires: ${escapeLatex(expiryDate)}`;
      if (certNumber) certLine += `\\\\Certificate ID: ${escapeLatex(certNumber)}`;
      if (verificationURL) certLine += `\\\\Verification: \\href{${verificationURL}}{${verificationURL}}`;
      if (additionalDetails) certLine += `\\\\${escapeLatex(additionalDetails)}`;
      
      return certLine;
    }).join(" \\\\\n");
  };

  return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\definecolor{primarygreen}{RGB}{0,150,100}

\\titleformat{\\section}{\\color{primarygreen}\\bfseries\\Large}{}{0pt}{}[\\color{primarygreen}\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

% Header
\\begin{center}
{\\Huge\\bfseries ${escapeLatex(Name)}} \\\\
\\vspace{4pt}
{\\large\\color{primarygreen} ${escapeLatex(Location)} $\\bullet$ ${escapeLatex(Phone)} $\\bullet$ \\href{mailto:${escapeLatex(Email)}}{${escapeLatex(Email)}}${data.LinkedIn ? ` $\\bullet$ \\href{${data.LinkedIn}}{LinkedIn}` : ""}${data.Portfolio ? ` $\\bullet$ \\href{${data.Portfolio}}{Portfolio}` : ""}}
\\end{center}

\\vspace{12pt}

${Objective ? `\\section{Career Objective}
\\textit{${escapeLatex(Objective)}}

` : ""}

${Summary.length ? `\\section{Professional Summary}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
${Summary.map((point: string) => `\\item ${escapeLatex(point)}`).join("\n")}
\\end{itemize}

` : ""}

${Education.length ? `\\section{Education}
${Education.map((edu: any) => {
  // Debug logging for education data
  console.log('🔍 Education Debug - edu object:', JSON.stringify(edu, null, 2));
  console.log('🔍 edu.Duration:', edu.Duration, 'Type:', typeof edu.Duration);
  console.log('🔍 edu.DurationOrYear:', edu.DurationOrYear, 'Type:', typeof edu.DurationOrYear);
  
  const degree = edu.Degree || "Bachelor of Science";
  const university = edu.University || "University Name";
  // Fix: Only use duration if it exists, don't provide fallback years
  const duration = edu.DurationOrYear || edu.Duration || "";
  const cgpa = edu.CGPA ? ` | GPA: ${escapeLatex(edu.CGPA)}` : "";
  const coursework = edu.RelevantCoursework && edu.RelevantCoursework.length ? `\\\\\\textit{Relevant Coursework:} ${escapeLatex(edu.RelevantCoursework.join(', '))}` : "";
  const honors = edu.HonorsAndQualifications && edu.HonorsAndQualifications.length ? `\\\\\\textit{${escapeLatex(edu.HonorsAndQualifications.join(', '))}}` : "";
  
  // Only show duration if it exists
  const durationPart = duration ? ` \\hfill ${escapeLatex(duration)}` : "";
  
  return `\\textbf{${escapeLatex(degree)}} | \\textit{${escapeLatex(university)}} \\hfill ${durationPart}${cgpa}${coursework}${honors}`;
}).join(" \\\\\n")}

` : ""}

${Experience.length ? `\\section{Professional Experience}
${Experience.map(formatExperience).join("\n\n")}

` : ""}

${Projects.length ? `\\section{Key Projects}
${formatProjects(Projects)}

` : ""}

${Object.keys(Skills).length ? `\\section{Core Competencies}
${formatSkills(Skills)}

` : ""}

${Certificates.length ? `\\section{Certifications}
${formatCertificates(Certificates)}

` : ""}

${Languages ? `\\section{Languages}
${escapeLatex(Languages)}

` : ""}

\\end{document}`;
}

// ------------------- Compact Classic: Compact Style (Already Working) -------------------
export function generateLatex3(data: any = {}): string {
  const {
    Name = "John Doe",
    Location = "Your Location",
    Email = "youremail@yourdomain.com",
    Phone = "0541 999 99 99",
    Objective = "",
    Summary = [],
    Education = [],
    Experience = [],
    Skills = {},
    Projects = [],
    Certificates = [],
    Languages = "",
  } = data;

  const formatEducation = (edu: any) => {
    // Fix: Only use duration if it exists, don't provide fallback years
    const duration = edu.DurationOrYear || edu.Duration || "";
    const degree = edu.Degree ? escapeLatex(edu.Degree) : "Bachelor of Science";
    const university = edu.University ? escapeLatex(edu.University) : "University Name";
    const score = edu.CGPA
      ? `, GPA: ${escapeLatex(edu.CGPA)}`
      : edu.Percentage
      ? `, ${escapeLatex(edu.Percentage)}%`
      : ", GPA: 3.9/4.0";
    const coursework = edu.RelevantCoursework && edu.RelevantCoursework.length ? `\\\\\\textit{Relevant Coursework:} ${escapeLatex(edu.RelevantCoursework.join(', '))}` : "";
    const honors = edu.HonorsAndQualifications && edu.HonorsAndQualifications.length ? `\\\\\\textit{${escapeLatex(edu.HonorsAndQualifications.join(', '))}}` : "";
    
    // Only show duration if it exists
    const durationPart = duration ? ` \\hfill ${escapeLatex(duration)}` : "";
    
    return `\\textbf{${degree}} - ${university}${durationPart}${score}${coursework}${honors}`;
  };

  const formatExperience = (exp: any) => {
    // Fix: Check both JobRole and "Job Role" to handle Gemini JSON format
    const jobRole = exp.JobRole || exp["Job Role"] || "Position";
    const company = exp.CompanyName || exp["Company Name"] || "Company";
    const duration = exp.Duration || exp.duration || "2020-Present";
    
    let highlights: string[] = [];
    
    if (exp.WhatHeDid && Array.isArray(exp.WhatHeDid)) {
      highlights.push(...exp.WhatHeDid.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    if (exp.HowHeDidIt && Array.isArray(exp.HowHeDidIt)) {
      highlights.push(...exp.HowHeDidIt.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    if (exp.ImpactMade && Array.isArray(exp.ImpactMade)) {
      highlights.push(...exp.ImpactMade.map((item: string) => `\\item ${escapeLatex(item)}`));
    }
    
    if (highlights.length === 0 && exp.Responsibilities) {
      highlights.push(`\\item ${escapeLatex(exp.Responsibilities)}`);
    }

    return `\\textbf{${escapeLatex(jobRole)}} - ${escapeLatex(company)} \\hfill ${escapeLatex(duration)}
\\begin{itemize}[noitemsep,topsep=0pt]
${highlights.join("\n")}
\\end{itemize}`;
  };

  const formatProjects = (projects: any[]) => {
    return projects.map(proj => {
      const title = proj.Title || proj.title || "Project Title";
      const description = proj.Description || proj.description || "Project description";
      const tools = proj.Tools || proj.tools || "Technologies used";
      
      return `\\textbf{${escapeLatex(title)}}\\\\
${escapeLatex(description)}\\\\
\\textit{Technologies:} ${escapeLatex(tools)}`;
    }).join("\n\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj).map(([category, skills]) => {
      const skillList = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
      return `\\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}`;
    }).join(" \\\\\n");
  };

  const formatCertificates = (certificates: any[]) => {
    return certificates.map(cert => {
      const name = cert.Name || cert.name || "Certificate Name";
      const organization = cert.IssuingOrganization || cert.organization || "Issuing Organization";
      const date = cert.Date || cert.date || "";
      const expiryDate = cert.ExpiryDate || "";
      const certNumber = cert.CertificateNumber || "";
      const verificationURL = cert.VerificationURL || "";
      const additionalDetails = cert.AdditionalDetails || "";
      
      let certLine = `\\textbf{${escapeLatex(name)}} - ${escapeLatex(organization)}`;
      if (date) certLine += ` (${escapeLatex(date)})`;
      if (expiryDate) certLine += ` - Expires: ${escapeLatex(expiryDate)}`;
      if (certNumber) certLine += `\\\\Certificate ID: ${escapeLatex(certNumber)}`;
      if (verificationURL) certLine += `\\\\Verification: \\href{${verificationURL}}{${verificationURL}}`;
      if (additionalDetails) certLine += `\\\\${escapeLatex(additionalDetails)}`;
      
      return certLine;
    }).join(" \\\\\n");
  };

  return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\definecolor{darkgray}{RGB}{80,80,80}

\\titleformat{\\section}{\\bfseries\\large\\color{darkgray}}{}{0pt}{}[\\color{darkgray}\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{4pt}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

% Header
\\begin{center}
{\\Large\\textbf{${escapeLatex(Name)}}} \\\\
\\vspace{2pt}
${escapeLatex(Location)} $\\bullet$ ${escapeLatex(Phone)} $\\bullet$ \\href{mailto:${escapeLatex(Email)}}{${escapeLatex(Email)}}${data.LinkedIn ? ` $\\bullet$ \\href{${data.LinkedIn}}{LinkedIn}` : ""}${data.Portfolio ? ` $\\bullet$ \\href{${data.Portfolio}}{Portfolio}` : ""}
\\end{center}

\\vspace{8pt}

${Objective ? `\\section{Objective}
${escapeLatex(Objective)}

` : ""}

${Summary.length ? `\\section{Summary}
\\begin{itemize}[leftmargin=*,topsep=0pt,itemsep=0pt]
${Summary.map((point: string) => `\\item ${escapeLatex(point)}`).join("\n")}
\\end{itemize}

` : ""}

${Education.length ? `\\section{Education}
${Education.map(formatEducation).join(" \\\\\n")}

` : ""}

${Experience.length ? `\\section{Experience}
${Experience.map(formatExperience).join("\n\n")}

` : ""}

${Projects.length ? `\\section{Projects}
${formatProjects(Projects)}

` : ""}

${Object.keys(Skills).length ? `\\section{Skills}
${formatSkills(Skills)}

` : ""}

${Certificates.length ? `\\section{Certifications}
${formatCertificates(Certificates)}

` : ""}

${Languages ? `\\section{Languages}
${escapeLatex(Languages)}

` : ""}

\\end{document}`;
} 