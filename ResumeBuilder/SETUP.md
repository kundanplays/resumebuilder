# Setup Instructions

## 1. Environment Configuration

Create a `.env.local` file in the root directory with your Gemini API key:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### How to get your Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key and paste it in your `.env.local` file

## 2. Install Dependencies

```bash
npm install
```

## 3. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

## 4. Test the Application

1. Upload a resume file (PDF or image)
2. Enter your target job role (e.g., "Software Engineer")
3. Select your experience level
4. Click "Create New Resume"
5. View and download the generated professional resume templates

## Features

- **AI-Powered Processing**: Uses Google Gemini to extract and optimize resume content
- **Target Role Optimization**: Tailors content based on your desired job role
- **Experience Level Customization**: Adjusts content emphasis for your experience level
- **Professional Templates**: 3 different LaTeX-based resume templates
- **PDF Generation**: Automatic compilation to high-quality PDF files

## Troubleshooting

### "File is not defined" Error
This has been fixed in the latest version. The API now properly handles file uploads in the Node.js environment.

### "No templates found" Error
This usually means the Gemini API key is missing or invalid. Make sure you've:
1. Created the `.env.local` file
2. Added your valid Gemini API key
3. Restarted the development server

### LaTeX Compilation Issues
The application uses an online LaTeX compiler. If compilation fails:
1. Check your internet connection
2. Try again after a few moments
3. The LaTeX service might be temporarily unavailable 