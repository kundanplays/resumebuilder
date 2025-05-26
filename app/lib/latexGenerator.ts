// lib/generatelatex.ts

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

// ------------------- Template 1: Simple -------------------
export function generateLatex1(data: any = {}): string {
  const {
    Name = "",
    Location = "",
    Email = "",
    Phone = "",
    Course = "",
    Objective = "",
    Summary = [],
    Education = [],
    Experience = [],
    Skills = {},
    Projects = [],
    Technologies = [],
  } = data;

  const formatEducation = (edu: any) => {
    const duration = edu.Duration ? ` (${escapeLatex(edu.Duration)})` : "";
    const score = edu.CGPA
      ? `, CGPA: ${escapeLatex(edu.CGPA)}`
      : edu.Percentage
      ? `, Percentage: ${escapeLatex(edu.Percentage)}`
      : "";
    return `\\textbf{${escapeLatex(edu.Degree)}} \\\\
${escapeLatex(edu.University)}${duration}${score}`;
  };

  const formatExperience = (exp: any) => {
    const parts = [
      `\\textbf{${escapeLatex(exp["Job Role"] || exp["job role"] || "")}} \\\\`,
      `${escapeLatex(
        exp["Company Name"] || exp["company name"] || ""
      )} \\hfill ${escapeLatex(exp.Duration || exp.duration || "")}`,
    ];
    if (exp.Responsibilities || exp["what did user do"]) {
      parts.push(
        `\\textit{Responsibilities:} ${escapeLatex(
          exp.Responsibilities || exp["what did user do"]
        )}`
      );
    }
    if (exp["Approach/Methodology"] || exp["how user did"]) {
      parts.push(
        `\\textit{Approach:} ${escapeLatex(
          exp["Approach/Methodology"] || exp["how user did"]
        )}`
      );
    }
    if (exp["Product Impact"] || exp["what product impact"]) {
      parts.push(
        `\\textit{Product Impact:} ${escapeLatex(
          exp["Product Impact"] || exp["what product impact"]
        )}`
      );
    }
    return parts.join(" \\\\\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj)
      .map(
        ([category, skills]) =>
          `\\textbf{${escapeLatex(category)}}: ${
            Array.isArray(skills)
              ? skills.map(escapeLatex).join(", ")
              : escapeLatex(skills)
          }`
      )
      .join(" \\\\ \n");
  };

  const formatProjects = (projects: any[]) => {
    return projects
      .map(
        (proj) => `\\item \\textbf{${escapeLatex(proj.title)}} \\\\
${escapeLatex(proj.description)} \\\\
\\textit{Technologies:} ${escapeLatex(proj.tools)}`
      )
      .join("\n");
  };

  const formatSummary = (points: string[]) => {
    if (!points.length) return "";
    return (
      "\\begin{itemize}[leftmargin=*]\n" +
      points.map((point) => `  \\item ${escapeLatex(point)}`).join("\n") +
      "\n\\end{itemize}"
    );
  };

  const formatTechnologies = (techs: string[]) =>
    techs.length ? techs.map(escapeLatex).join(", ") : "";

  return `
\\documentclass{article}
\\usepackage[a4paper,margin=0.6in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\begin{document}

% Header
\\begin{center}
  {\\Huge \\textbf{${escapeLatex(Name)}}} \\\\
  \\vspace{2pt}
  ${escapeLatex(Location)} \\\\
  \\vspace{4pt}
  ${escapeLatex(Phone)} \\textbar\\ \\href{mailto:${escapeLatex(
    Email
  )}}{${escapeLatex(Email)}}
\\end{center}

\\vspace{4mm}

% Course
${
  Course
    ? `\\section*{Course}
  \\rule{\\linewidth}{0.2pt}
  \vspace{2mm}

${escapeLatex(Course)}
\\vspace{5mm}`
    : ""
}

% Objective
${
  Objective
    ? `\\section*{Objective}
    \\rule{\\linewidth}{0.2pt}
    \vspace{2mm}

${escapeLatex(Objective)}
\\vspace{5mm}`
    : ""
}

% Summary
${
  Summary.length
    ? `\\section*{Summary}
    \\rule{\\linewidth}{0.2pt}
    \vspace{2mm}

${formatSummary(Summary)}
\\vspace{5mm}`
    : ""
}

% Education
${
  Education.length
    ? `\\section*{Education}
    \\rule{\\linewidth}{0.2pt}
    \vspace{2mm}

${Education.map(formatEducation).join("\n\n")}
`
    : ""
}

% Experience
${
  Experience.length
    ? `\\section*{Experience}
    \\rule{\\linewidth}{0.2pt}
    \vspace{2mm}

${Experience.map(formatExperience).join("\n\\vspace{3mm}\n")}
\\vspace{5mm}`
    : ""
}

% Skills
${
  Object.keys(Skills).length
    ? `\\section*{Skills}
    \\rule{\\linewidth}{0.2pt}
    \vspace{2mm}

${formatSkills(Skills).replace(/\n/g, "\\\\\n")}
\\vspace{5mm}`
    : ""
}

% Projects
${
  Projects.length
  ? `\\section*{Projects}
  \\rule{\\linewidth}{0.2pt}
  \vspace{2mm}
\\begin{itemize}[leftmargin=*]

${formatProjects(Projects)}
\\end{itemize}
\\vspace{5mm}`
    : ""
}

% Technologies
${
  Technologies.length
    ? `\\section*{Technologies}
    \\rule{\\linewidth}{0.2pt}
    \vspace{2mm}

${formatTechnologies(Technologies)}
\\vspace{5mm}`
    : ""
}

\\end{document}
`.trim();
}

// ------------------- Template 2: Modern -------------------
export function generateLatex2(data: any = {}): string {
  const {
    Name = "",
    Location = "",
    Email = "",
    Phone = "",
    Course = "",
    Objective = "",
    Summary = [],
    Education = [],
    Experience = [],
    Skills = {},
    Projects = [],
    Technologies = [],
  } = data;

  const formatEducation = (edu: any) => {
    const duration = edu.Duration ? ` (${escapeLatex(edu.Duration)})` : "";
    const score = edu.CGPA
      ? `, CGPA: ${escapeLatex(edu.CGPA)}`
      : edu.Percentage
      ? `, Percentage: ${escapeLatex(edu.Percentage)}`
      : edu.CPI
      ? `, CPI: ${escapeLatex(edu.CPI)}`
      : "";
    return `\\textbf{${escapeLatex(edu.Degree)}} \\\\
\\textcolor{gray}{${escapeLatex(edu.University)}}${duration}${score}`;
  };

  const formatExperience = (exp: any) => {
    const parts = [
      `\\textbf{${escapeLatex(
        exp["Job Role"] || exp["job role"] || ""
      )}} \\hfill {\\color{blue}\\textit{${escapeLatex(
        exp.Duration || exp.duration || ""
      )}}} \\\\`,
      `\\textcolor{gray}{${escapeLatex(
        exp["Company Name"] || exp["company name"] || ""
      )}}`,
    ];
    if (exp.Responsibilities || exp["what did user do"]) {
      parts.push(
        `\\textit{Responsibilities:} ${escapeLatex(
          exp.Responsibilities || exp["what did user do"]
        )}`
      );
    }
    if (exp["Approach/Methodology"] || exp["how user did"]) {
      parts.push(
        `\\textit{Approach:} ${escapeLatex(
          exp["Approach/Methodology"] || exp["how user did"]
        )}`
      );
    }
    if (exp["Product Impact"] || exp["what product impact"]) {
      parts.push(
        `\\textit{Product Impact:} ${escapeLatex(
          exp["Product Impact"] || exp["what product impact"]
        )}`
      );
    }
    return parts.join(" \\\\\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj)
      .map(
        ([category, skills]) =>
          `\\textbf{${escapeLatex(category)}}: ${
            Array.isArray(skills)
              ? skills.map(escapeLatex).join(", ")
              : escapeLatex(skills)
          }`
      )
      .join(" \\\\ \n");
  };

  const formatProjects = (projects: any[]) => {
    return projects
      .map(
        (proj) => `\\item \\textbf{${escapeLatex(proj.title)}} \\\\
${escapeLatex(proj.description)} \\\\
\\textit{Technologies:} ${escapeLatex(proj.tools)}`
      )
      .join("\n");
  };

  const formatSummary = (points: string[]) => {
    if (!points.length) return "";
    return (
      "\\begin{itemize}[leftmargin=*]\n" +
      points.map((point) => `  \\item ${escapeLatex(point)}`).join("\n") +
      "\n\\end{itemize}"
    );
  };

  const formatTechnologies = (techs: string[]) =>
    techs.length ? techs.map(escapeLatex).join(", ") : "";

  return `
\\documentclass{article}
\\usepackage[a4paper,margin=0.8in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{tcolorbox}
\\tcbuselibrary{listingsutf8}
\\tcbuselibrary{breakable}

\\definecolor{myblue}{RGB}{0,102,204}
\\definecolor{mygray}{gray}{0.5}

\\begin{document}

% Header
\\begin{center}
  {\\Huge \\textbf{\\textcolor{myblue}{${escapeLatex(Name)}}}} \\\\
  \\vspace{2pt}
  ${escapeLatex(Location)} \\\\
  \\vspace{4pt}
  ${escapeLatex(Phone)} \\textbar\\ \\href{mailto:${escapeLatex(
    Email
  )}}{${escapeLatex(Email)}}
\\end{center}

\\vspace{6mm}

% Course
${
  Course
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Course]
${escapeLatex(Course)}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Objective
${
  Objective
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Objective]
${escapeLatex(Objective)}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Summary
${
  Summary.length
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Summary]
${formatSummary(Summary)}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Education
${
  Education.length
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Education]
${Education.map(formatEducation).join("\n\n")}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Experience
${
  Experience.length
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Experience]
${Experience.map(formatExperience).join("\n\\vspace{3mm}\n")}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Skills
${
  Object.keys(Skills).length
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Skills]
${formatSkills(Skills).replace(/\n/g, "\\\\\n")}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Projects
${
  Projects.length
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Projects]
\\begin{itemize}[leftmargin=*]
${formatProjects(Projects)}
\\end{itemize}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

% Technologies
${
  Technologies.length
    ? `
\\begin{tcolorbox}[colframe=myblue!60!black,breakable,title=Technologies]
${formatTechnologies(Technologies)}
\\end{tcolorbox}
\\vspace{5mm}`
    : ""
}

\\end{document}
`.trim();
}

// ------------------- Template 3: Academic -------------------
export function generateLatex3(data: any = {}): string {
  const {
    Name = "",
    Location = "",
    Email = "",
    Phone = "",
    Course = "",
    Objective = "",
    Summary = [],
    Education = [],
    Experience = [],
    Skills = {},
    Projects = [],
    Technologies = [],
  } = data;

  const formatEducation = (edu: any) => {
    const duration = edu.Duration ? ` (${escapeLatex(edu.Duration)})` : "";
    const score = edu.CGPA
      ? `, CGPA: ${escapeLatex(edu.CGPA)}`
      : edu.Percentage
      ? `, Percentage: ${escapeLatex(edu.Percentage)}`
      : "";
    return `\\textbf{${escapeLatex(edu.Degree)}} \\\\
\\textit{${escapeLatex(edu.University)}}${duration}${score}`;
  };

  const formatExperience = (exp: any) => {
    const parts = [
      `\\textbf{${escapeLatex(exp["Job Role"] || exp["job role"] || "")}} \\\\`,
      `\\textit{${escapeLatex(
        exp["Company Name"] || exp["company name"] || ""
      )}} \\hfill ${escapeLatex(exp.Duration || exp.duration || "")}`,
    ];
    if (exp.Responsibilities || exp["what did user do"]) {
      parts.push(
        `\\textit{Responsibilities:} ${escapeLatex(
          exp.Responsibilities || exp["what did user do"]
        )}`
      );
    }
    if (exp["Approach/Methodology"] || exp["how user did"]) {
      parts.push(
        `\\textit{Approach:} ${escapeLatex(
          exp["Approach/Methodology"] || exp["how user did"]
        )}`
      );
    }
    if (exp["Product Impact"] || exp["what product impact"]) {
      parts.push(
        `\\textit{Product Impact:} ${escapeLatex(
          exp["Product Impact"] || exp["what product impact"]
        )}`
      );
    }
    return parts.join(" \\\\\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj)
      .map(
        ([category, skills]) =>
          `\\textbf{${escapeLatex(category)}}: ${
            Array.isArray(skills)
              ? skills.map(escapeLatex).join(", ")
              : escapeLatex(skills)
          }`
      )
      .join(" \\\\ \n");
  };

  const formatProjects = (projects: any[]) => {
    return projects
      .map(
        (proj) => `\\item \\textbf{${escapeLatex(proj.title)}} \\\\
${escapeLatex(proj.description)} \\\\
\\textit{Technologies:} ${escapeLatex(proj.tools)}`
      )
      .join("\n");
  };

  const formatSummary = (points: string[]) => {
    if (!points.length) return "";
    return (
      "\\begin{itemize}[leftmargin=*]\n" +
      points.map((point) => `  \\item ${escapeLatex(point)}`).join("\n") +
      "\n\\end{itemize}"
    );
  };

  const formatTechnologies = (techs: string[]) =>
    techs.length ? techs.map(escapeLatex).join(", ") : "";

  return `
\\documentclass[12pt]{article}
\\usepackage[a4paper,margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}

\\hypersetup{
  colorlinks=true,
  urlcolor=blue,
  linkcolor=black,
  citecolor=black
}

\\begin{document}

% Header
\\begin{center}
  {\\LARGE \\textbf{${escapeLatex(Name)}}} \\\\
  \\vspace{2pt}
  ${escapeLatex(Location)} \\\\
  \\vspace{4pt}
  ${escapeLatex(Phone)} \\textbar\\ \\href{mailto:${escapeLatex(
    Email
  )}}{${escapeLatex(Email)}}
\\end{center}

\\vspace{6mm}

% Course
${
  Course
    ? `\\section*{Course}
${escapeLatex(Course)}
\\vspace{5mm}`
    : ""
}

% Objective
${
  Objective
    ? `\\section*{Objective}
${escapeLatex(Objective)}
\\vspace{5mm}`
    : ""
}

% Summary
${
  Summary.length
    ? `\\section*{Summary}
${formatSummary(Summary)}
\\vspace{5mm}`
    : ""
}

% Education
${
  Education.length
    ? `\\section*{Education}
${Education.map(formatEducation).join("\n\n")}
\\vspace{5mm}`
    : ""
}

% Experience
${
  Experience.length
    ? `\\section*{Experience}
${Experience.map(formatExperience).join("\n\\vspace{3mm}\n")}
\\vspace{5mm}`
    : ""
}

% Skills
${
  Object.keys(Skills).length
    ? `\\section*{Skills}
${formatSkills(Skills).replace(/\n/g, "\\\\\n")}
\\vspace{5mm}`
    : ""
}

% Projects
${
  Projects.length
    ? `\\section*{Projects}
\\begin{itemize}[leftmargin=*]
${formatProjects(Projects)}
\\end{itemize}
\\vspace{5mm}`
    : ""
}

% Technologies
${
  Technologies.length
    ? `\\section*{Technologies}
${formatTechnologies(Technologies)}
\\vspace{5mm}`
    : ""
}

\\end{document}
`.trim();
}
