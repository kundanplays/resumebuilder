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

// ------------------- Professional Blue: Professional RenderCV Style -------------------
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
    targetJobRole = "",
    experienceLevel = "",
  } = data;

  const formatEducation = (edu: any) => {
    const duration = edu.Duration ? escapeLatex(edu.Duration) : "Sept 2000 – May 2005";
    const degree = edu.Degree ? escapeLatex(edu.Degree) : "BS in Computer Science";
    const university = edu.University ? escapeLatex(edu.University) : "University of Pennsylvania";
    const score = edu.CGPA
      ? `GPA: ${escapeLatex(edu.CGPA)}/4.0`
      : edu.Percentage
      ? `Percentage: ${escapeLatex(edu.Percentage)}`
      : "GPA: 3.9/4.0";
    
    return `\\begin{twocolentry}{
            
            
        \\textit{${duration}}}
            \\textbf{${university}}

            \\textit{${degree}}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
                \\item ${score}
                \\item \\textbf{Coursework:} Computer Architecture, Algorithms, Software Engineering
            \\end{highlights}
        \\end{onecolentry}`;
  };

  const formatExperience = (exp: any) => {
    const jobRole = exp["Job Role"] || exp["job role"] || "Software Engineer";
    const company = exp["Company Name"] || exp["company name"] || "Tech Company";
    const duration = exp.Duration || exp.duration || "June 2020 – Present";
    const location = exp.Location || "Remote";

    // Handle new structure with WhatHeDid, HowHeDidIt, ImpactMade
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
    
    // Fallback to old structure if new structure not present
    if (highlights.length === 0) {
      const responsibilities = exp.Responsibilities || exp["what did user do"] || "Developed software solutions";
      const approach = exp["Approach/Methodology"] || exp["how user did"] || "";
      const impact = exp["Product Impact"] || exp["what product impact"] || "";

      highlights.push(`\\item ${escapeLatex(responsibilities)}`);
      if (approach) highlights.push(`\\item ${escapeLatex(approach)}`);
      if (impact) highlights.push(`\\item ${escapeLatex(impact)}`);
    }

    return `\\begin{twocolentry}{
        \\textit{${escapeLatex(location)}}    
            
        \\textit{${escapeLatex(duration)}}}
            \\textbf{${escapeLatex(jobRole)}}
            
            \\textit{${escapeLatex(company)}}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
                ${highlights.join("\n                ")}
            \\end{highlights}
        \\end{onecolentry}`;
  };

  const formatProjects = (projects: any[]) => {
    return projects.map(proj => {
      const title = proj.Title || proj.title || "Project Title";
      const description = proj.Description || proj.description || "Project description";
      const tools = proj.Tools || proj.tools || "Technologies used";
      const link = proj.Link || proj.link || "";
      
      const linkText = link ? `\\href{${link}}{${link}}` : "github.com/username/repo";
      
      return `\\begin{twocolentry}{
            
            
        \\textit{${linkText}}}
            \\textbf{${escapeLatex(title)}}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
                \\item ${escapeLatex(description)}
                \\item Tools Used: ${escapeLatex(tools)}
            \\end{highlights}
        \\end{onecolentry}`;
    }).join("\n\n        \\vspace{0.2 cm}\n\n        ");
  };

  const formatSkills = (skillsObj: any) => {
    const entries = Object.entries(skillsObj).map(([category, skills]) => {
      const skillList = Array.isArray(skills) ? skills.join(", ") : skills;
      return `\\begin{onecolentry}
            \\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}
        \\end{onecolentry}`;
    });
    return entries.join("\n\n        \\vspace{0.2 cm}\n\n        ");
  };

  const formatSummary = (points: string[]) => {
    if (!points.length) return "";
    return points.map(point => `\\item ${escapeLatex(point)}`).join("\n        ");
  };

  const formatCertificates = (certificates: any[]) => {
    return certificates.map(cert => {
      const name = cert.Name || cert.name || "Certificate Name";
      const organization = cert.IssuingOrganization || cert.organization || "Issuing Organization";
      const date = cert.Date || cert.date || "";
      
      return `\\begin{onecolentry}
            \\textbf{${escapeLatex(name)}} - ${escapeLatex(organization)}${date ? ` (${escapeLatex(date)})` : ""}
        \\end{onecolentry}`;
    }).join("\n\n        \\vspace{0.1 cm}\n\n        ");
  };

  return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 79, 144} % define primary color
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={${escapeLatex(Name)}'s CV},
    pdfauthor={${escapeLatex(Name)}},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex
\\usepackage{etoolbox} % for \\AtBeginEnvironment and \\patchcmd
\\usepackage{calc} % for \\widthof

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    % \\usepackage[T1]{fontenc} % this breaks sb2nov
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

% Some settings:
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0cm} % set column seperation
\\makeatletter
\\let\\ps@customFooterStyle\\ps@plain % Copy the plain style to customFooterStyle
\\patchcmd{\\ps@customFooterStyle}{\\thepage}{
    \\color{gray}\\textit{\\small ${escapeLatex(Name)} - Page \\thepage{} of \\pageref*{LastPage}}
}{}{} % replace number by desired string
\\makeatother
\\pagestyle{customFooterStyle}

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\renewcommand\\labelitemi{$\\circ$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0.4 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights

\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0.2 cm + 0.00001 cm
    }{
        0.2 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.5}
}{
    \\par\\kern\\topsep
} % new environment for the header

\\newcommand{\\placelastupdatedtext}{% \\placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \\AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \\put(
        \\LenToUnit{\\paperwidth-2 cm-0.2 cm+0.05cm},
        \\LenToUnit{\\paperheight-1.0 cm}
    ){\\vtop{{\\null}\\makebox[0pt][c]{
        \\small\\color{gray}\\textit{Last updated in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}\\hspace{\\widthof{Last updated in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}}
    }}}%
  }%
}%

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

% new command for external links:
\\renewcommand{\\href}[2]{\\hrefWithoutArrow{#1}{\\ifthenelse{\\equal{#2}{}}{ }{#2 }\\raisebox{.15ex}{\\footnotesize \\faExternalLink*}}}

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{}

    \\placelastupdatedtext
    \\begin{header}
        \\textbf{\\fontsize{24 pt}{24 pt}\\selectfont ${escapeLatex(Name)}}

        \\vspace{0.3 cm}

        \\normalsize
        \\mbox{{\\color{black}\\footnotesize\\faMapMarker*}\\hspace*{0.13cm}${escapeLatex(Location)}}%
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%
        \\mbox{\\hrefWithoutArrow{mailto:${escapeLatex(Email)}}{{\\color{black}{\\footnotesize\\faEnvelope[regular]}\\hspace*{0.13cm}${escapeLatex(Email)}}}}%
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%
        \\mbox{\\hrefWithoutArrow{tel:${escapeLatex(Phone)}}{{\\color{black}{\\footnotesize\\faPhone*}\\hspace*{0.13cm}${escapeLatex(Phone)}}}}%${LinkedIn ? `
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%
        \\mbox{\\hrefWithoutArrow{${LinkedIn}}{{\\color{black}{\\footnotesize\\faLinkedin}\\hspace*{0.13cm}LinkedIn}}}%` : ""}${Portfolio ? `
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%
        \\mbox{\\hrefWithoutArrow{${Portfolio}}{{\\color{black}{\\footnotesize\\faGlobe}\\hspace*{0.13cm}Portfolio}}}%` : ""}
    \\end{header}

    \\vspace{0.3 cm - 0.3 cm}

${Objective ? `
    \\section{Objective}

        \\begin{onecolentry}
${escapeLatex(Objective)}
        \\end{onecolentry}

` : ""}

${Summary.length ? `
    \\section{Professional Summary}

    \\begin{onecolentry}
        \\begin{highlightsforbulletentries}
${formatSummary(Summary)}
        \\end{highlightsforbulletentries}
    \\end{onecolentry}

` : ""}

${Education.length ? `
    \\section{Education}

        ${Education.map(formatEducation).join("\n\n        ")}

` : ""}

${Experience.length ? `
    \\section{Experience}

        ${Experience.map(formatExperience).join("\n\n        \\vspace{0.2 cm}\n\n        ")}

` : ""}

${Projects.length ? `
    \\section{Projects}

${formatProjects(Projects)}

` : ""}

${Object.keys(Skills).length ? `
    \\section{Technologies}

        ${formatSkills(Skills)}

` : ""}

${Certificates.length ? `
    \\section{Certifications}

        ${formatCertificates(Certificates)}

` : ""}

${Languages ? `
    \\section{Languages}

        \\begin{onecolentry}
            ${escapeLatex(Languages)}
        \\end{onecolentry}

` : ""}

\\end{document}`;
}

// ------------------- Modern Green: Modern RenderCV Style -------------------
export function generateLatex2(data: any = {}): string {
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
    targetJobRole = "",
    experienceLevel = "",
  } = data;

  const formatEducation = (edu: any) => {
    const duration = edu.Duration ? escapeLatex(edu.Duration) : "Sept 2000 – May 2005";
    const degree = edu.Degree ? escapeLatex(edu.Degree) : "BS";
    const university = edu.University ? escapeLatex(edu.University) : "University of Pennsylvania";
    const field = edu.Field || "Computer Science";
    const score = edu.CGPA
      ? `GPA: ${escapeLatex(edu.CGPA)}/4.0`
      : edu.Percentage
      ? `Percentage: ${escapeLatex(edu.Percentage)}`
      : "GPA: 3.9/4.0";
    
    return `\\begin{threecolentry}{\\textbf{${degree}}}{
            ${duration}
        }
            \\textbf{${university}}, ${escapeLatex(field)}
            \\begin{highlights}
                \\item ${score}
                \\item \\textbf{Coursework:} Computer Architecture, Algorithms, Software Engineering
            \\end{highlights}
        \\end{threecolentry}`;
  };

  const formatExperience = (exp: any) => {
    const jobRole = exp["Job Role"] || exp["job role"] || "Software Engineer";
    const company = exp["Company Name"] || exp["company name"] || "Tech Company";
    const duration = exp.Duration || exp.duration || "June 2020 – Present";
    const location = exp.Location || "Remote";
    const responsibilities = exp.Responsibilities || exp["what did user do"] || "Developed software solutions";
    const approach = exp["Approach/Methodology"] || exp["how user did"] || "";
    const impact = exp["Product Impact"] || exp["what product impact"] || "";

    let highlights = [`\\item ${escapeLatex(responsibilities)}`];
    if (approach) highlights.push(`\\item ${escapeLatex(approach)}`);
    if (impact) highlights.push(`\\item ${escapeLatex(impact)}`);

    return `\\begin{twocolentry}{
            ${escapeLatex(location)}

        ${escapeLatex(duration)}
        }
            \\textbf{${escapeLatex(company)}}, ${escapeLatex(jobRole)}
            \\begin{highlights}
                ${highlights.join("\n                ")}
            \\end{highlights}
        \\end{twocolentry}`;
  };

  const formatProjects = (projects: any[]) => {
    return projects.map(proj => {
      const title = proj.title || "Project Title";
      const description = proj.description || "Project description";
      const tools = proj.tools || "Technologies used";
      
      return `\\begin{twocolentry}{
            \\href{https://github.com/username/repo}{github.com/username/repo}
        }
            \\textbf{${escapeLatex(title)}}
            \\begin{highlights}
                \\item ${escapeLatex(description)}
                \\item Tools Used: ${escapeLatex(tools)}
            \\end{highlights}
        \\end{twocolentry}`;
    }).join("\n\n        \\vspace{0.2 cm}\n\n        ");
  };

  const formatSkills = (skillsObj: any) => {
    const entries = Object.entries(skillsObj).map(([category, skills]) => {
      const skillList = Array.isArray(skills) ? skills.join(", ") : skills;
      return `\\begin{onecolentry}
            \\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}
        \\end{onecolentry}`;
    });
    return entries.join("\n\n        \\vspace{0.2 cm}\n\n        ");
  };

  const formatSummary = (points: string[]) => {
    if (!points.length) return "";
    return points.map(point => `\\item ${escapeLatex(point)}`).join("\n        ");
  };

  return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage[explicit]{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 79, 144} % define primary color
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={${escapeLatex(Name)}'s CV},
    pdfauthor={${escapeLatex(Name)}},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex
\\usepackage{etoolbox} % for \\AtBeginEnvironment and \\patchcmd
\\usepackage{calc} % for \\widthof

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

% \\usepackage[default, type1]{sourcesanspro} % Comment out if not available 

% Some settings:
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0.15cm} % set column seperation
\\makeatletter
\\let\\ps@customFooterStyle\\ps@plain % Copy the plain style to customFooterStyle
\\patchcmd{\\ps@customFooterStyle}{\\thepage}{
    \\color{gray}\\textit{\\small ${escapeLatex(Name)} - Page \\thepage{} of \\pageref*{LastPage}}
}{}{} % replace number by desired string
\\makeatother
\\pagestyle{customFooterStyle}

\\titleformat{\\section}{
    % avoid page braking right after the section title
    \\needspace{4\\baselineskip}
    % make the font size of the section title large and color it with the primary color
    \\Large\\color{primaryColor}
}{
}{
}{
    % print bold title, give 0.15 cm space and draw a line of 0.8 pt thickness
    % from the end of the title to the end of the body
    \\textbf{#1}\\hspace{0.15cm}\\titlerule[0.8pt]\\hspace{-0.1cm}
}[] % section title formatting

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0.4 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights

\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0.2 cm + 0.00001 cm
    }{
        0.2 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{threecolentry}[3][]{
    \\onecolentry
    \\def\\thirdColumn{#3}
    \\setcolumnwidth{1 cm, \\fill, 4.5 cm}
    \\begin{paracol}{3}
    {\\raggedright #2} \\switchcolumn
}{
    \\switchcolumn \\raggedleft \\thirdColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for three column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\color{primaryColor}\\linespread{1.5}
}{
    \\par\\kern\\topsep
} % new environment for the header

\\newcommand{\\placelastupdatedtext}{% \\placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \\AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \\put(
        \\LenToUnit{\\paperwidth-2 cm-0.2 cm+0.05cm},
        \\LenToUnit{\\paperheight-1.0 cm}
    ){\\vtop{{\\null}\\makebox[0pt][c]{
        \\small\\color{gray}\\textit{Last updated in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}\\hspace{\\widthof{Last updated in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}}
    }}}%
  }%
}%

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

% new command for external links:
\\renewcommand{\\href}[2]{\\hrefWithoutArrow{#1}{\\ifthenelse{\\equal{#2}{}}{ }{#2 }\\raisebox{.15ex}{\\footnotesize \\faExternalLink*}}}

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{}

    \\placelastupdatedtext
    \\begin{header}
        \\fontsize{30 pt}{30 pt}
        \\textbf{${escapeLatex(Name)}}

        \\vspace{0.3 cm}

        \\normalsize
        \\mbox{{\\footnotesize\\faMapMarker*}\\hspace*{0.13cm}${escapeLatex(Location)}}%
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%
        \\mbox{\\hrefWithoutArrow{mailto:${escapeLatex(Email)}}{{\\footnotesize\\faEnvelope[regular]}\\hspace*{0.13cm}${escapeLatex(Email)}}}%
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%
        \\mbox{\\hrefWithoutArrow{tel:${escapeLatex(Phone)}}{{\\footnotesize\\faPhone*}\\hspace*{0.13cm}${escapeLatex(Phone)}}}%
    \\end{header}

    \\vspace{0.3 cm - 0.3 cm}

${Objective ? `
    \\section{Objective}

        \\begin{onecolentry}
${escapeLatex(Objective)}
        \\end{onecolentry}

` : ""}

${Summary.length ? `
    \\section{Professional Summary}

    \\begin{onecolentry}
        \\begin{highlightsforbulletentries}
${formatSummary(Summary)}
        \\end{highlightsforbulletentries}
    \\end{onecolentry}

` : ""}

${Education.length ? `
    \\section{Education}

        ${Education.map(formatEducation).join("\n\n        ")}

` : ""}

${Experience.length ? `
    \\section{Experience}

        ${Experience.map(formatExperience).join("\n\n        \\vspace{0.2 cm}\n\n        ")}

` : ""}

${Projects.length ? `
    \\section{Projects}

${formatProjects(Projects)}

` : ""}

${Object.keys(Skills).length ? `
    \\section{Technologies}

        ${formatSkills(Skills)}

` : ""}

\\end{document}`;
}

// ------------------- Compact Classic: Compact Style -------------------
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
    targetJobRole = "",
    experienceLevel = "",
  } = data;

  const formatEducation = (edu: any) => {
    const duration = edu.Duration ? escapeLatex(edu.Duration) : "2000-2005";
    const degree = edu.Degree ? escapeLatex(edu.Degree) : "Bachelor of Science";
    const university = edu.University ? escapeLatex(edu.University) : "University Name";
    const score = edu.CGPA
      ? `, GPA: ${escapeLatex(edu.CGPA)}`
      : edu.Percentage
      ? `, ${escapeLatex(edu.Percentage)}%`
      : ", GPA: 3.9/4.0";
    
    return `\\textbf{${degree}} - ${university} \\hfill ${duration}${score}`;
  };

  const formatExperience = (exp: any) => {
    const jobRole = exp["Job Role"] || exp["job role"] || "Position";
    const company = exp["Company Name"] || exp["company name"] || "Company";
    const duration = exp.Duration || exp.duration || "2020-Present";
    const responsibilities = exp.Responsibilities || exp["what did user do"] || "Key responsibilities";
    
    return `\\textbf{${escapeLatex(jobRole)}} - ${escapeLatex(company)} \\hfill ${escapeLatex(duration)}
\\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
\\item ${escapeLatex(responsibilities)}
\\end{itemize}`;
  };

  const formatProjects = (projects: any[]) => {
    return projects.map(proj => {
      const title = proj.title || "Project";
      const description = proj.description || "Description";
      const tools = proj.tools || "Tools";
      
      return `\\textbf{${escapeLatex(title)}} - ${escapeLatex(description)} (${escapeLatex(tools)})`;
    }).join("\\\\\n");
  };

  const formatSkills = (skillsObj: any) => {
    return Object.entries(skillsObj).map(([category, skills]) => {
      const skillList = Array.isArray(skills) ? skills.join(", ") : skills;
      return `\\textbf{${escapeLatex(category)}:} ${escapeLatex(skillList)}`;
    }).join(" \\\\\n");
  };

  return `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\definecolor{darkblue}{RGB}{0,50,100}

\\titleformat{\\section}{\\color{darkblue}\\bfseries\\large}{}{0pt}{}[\\color{darkblue}\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{4pt}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

% Header
\\begin{center}
{\\LARGE\\bfseries ${escapeLatex(Name)}} \\\\
  \\vspace{2pt}
${escapeLatex(Location)} $\\bullet$ ${escapeLatex(Phone)} $\\bullet$ \\href{mailto:${escapeLatex(Email)}}{${escapeLatex(Email)}}
\\end{center}

\\vspace{8pt}

${Objective ? `\\section{Objective}
${escapeLatex(Objective)}

` : ""}

 ${Summary.length ? `\\section{Summary}
 \\begin{itemize}[leftmargin=*,topsep=2pt,itemsep=1pt]
 ${Summary.map((point: string) => `\\item ${escapeLatex(point)}`).join("\n")}
 \\end{itemize}

` : ""}

${Education.length ? `\\section{Education}
${Education.map(formatEducation).join("\\\\\n")}

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

\\end{document}`;
}
