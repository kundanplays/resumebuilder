import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateLatex1,
  generateLatex2,
  generateLatex3,
} from "../../lib/latexGenerator";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function compileLatexToPdfBase64(latex: string) {
  const encodedLatex = encodeURIComponent(latex);
  const latexOnlineUrl = `https://latexonline.cc/compile?text=${encodedLatex}`;
  const response = await fetch(latexOnlineUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to compile PDF: ${errorText}`);
  }
  const pdfBuffer = await response.arrayBuffer();
  return Buffer.from(pdfBuffer).toString("base64");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded or invalid file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const promptText = `Extract the following information from the provided resume text in this exact order as JSON, enclosed in a markdown code block labeled json:

Name
Location
Email
Phone
Objective
Summary (5 key points)
Education (latest to oldest)
Experience (for each role: Job Role, Company Name, Duration, Responsibilities, Approach/Methodology, Product Impact)
Projects (title ,tools , description)
Skills (properly divide with key pair)


If no objective is explicitly stated, create a concise and professional one based on the rest of the resume content, reflecting career aspirations and value proposition.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.type,
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

    // Compile all LaTeX templates to PDF base64
    const [pdfBase641, pdfBase642, pdfBase643] = await Promise.all([
      compileLatexToPdfBase64(latex1),
      compileLatexToPdfBase64(latex2),
      compileLatexToPdfBase64(latex3),
    ]);

    const templates = {
      "1": { latex: latex1, pdfBase64: pdfBase641 },
      "2": { latex: latex2, pdfBase64: pdfBase642 },
      "3": { latex: latex3, pdfBase64: pdfBase643 },
    };

    return NextResponse.json({ data: parsedData, templates });
  } catch (error: any) {
    console.error("🚨 Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}
