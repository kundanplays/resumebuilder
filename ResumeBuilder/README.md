# Resume Builder

This is a [Next.js](https://nextjs.org) project that generates professional resume templates using AI-powered content extraction and LaTeX compilation.

## Features

- **AI-Powered Resume Processing**: Upload your existing resume and get professionally formatted templates
- **Target Job Role Optimization**: Specify your target job role for tailored resume content
- **Experience Level Customization**: Select your experience level for appropriate content emphasis
- **Multiple Templates**: Generate 3 different professional resume templates
- **PDF Generation**: Automatic LaTeX to PDF compilation with preview and download

## Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Configuration**:
Create a `.env.local` file in the root directory and add your Google Gemini API key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
You can get your API key from: https://makersuite.google.com/app/apikey

3. **Run the Development Server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. **Open the Application**:
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. **Upload Resume**: Select your existing resume file (PDF or image format)
2. **Specify Target Role**: Enter the job role you're targeting (e.g., "Software Engineer", "Data Scientist")
3. **Select Experience Level**: Choose from Entry Level, Mid Level, Senior Level, or Executive Level
4. **Generate Templates**: Click "Create New Resume" to process your resume
5. **Preview & Download**: View the generated templates and download your preferred version

## New Features Implemented

### Target Job Role & Experience Level Input
- **Frontend Form Enhancement**: Added input fields for target job role and experience level selection
- **Backend API Integration**: Modified the upload API to receive and process the additional user inputs
- **AI Prompt Optimization**: Enhanced the Gemini AI prompt to consider target role and experience level for:
  - Tailored objective statements
  - Relevant skill emphasis
  - Experience-appropriate content highlighting
  - Role-specific content optimization

### Technical Implementation
- **Form Validation**: Ensures all required fields are completed before submission
- **Enhanced UI**: Improved form styling with better user experience
- **Data Flow**: Seamless integration from frontend form to backend AI processing
- **Result Display**: Shows user selections alongside generated templates

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Processing**: Google Gemini 1.5 Pro
- **PDF Generation**: LaTeX Online Compiler
- **File Handling**: FormData for multipart uploads

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
