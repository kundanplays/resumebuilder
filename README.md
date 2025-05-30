# 🚀 AI Resume Builder

An intelligent resume builder powered by Google Gemini AI that transforms your existing resume into professional, ATS-optimized resumes with multiple LaTeX templates.

## ✨ Features

### 🤖 AI-Powered Resume Enhancement
- **Google Gemini AI Integration**: Intelligently analyzes and improves your resume content
- **ATS Optimization**: Creates resumes optimized for Applicant Tracking Systems
- **Role-Specific Tailoring**: Customizes content based on target job role and experience level
- **Smart Content Generation**: Generates relevant achievements and descriptions

### 📄 Multiple Professional Templates
- **Professional Blue**: Clean, corporate-friendly design
- **Modern Green**: Contemporary layout with green accents
- **Compact Classic**: Space-efficient traditional format

### 🔧 Key Improvements
- **Accurate Education Year Extraction**: Preserves exact year formats from original resume
- **Real Company Names**: Extracts actual company names instead of placeholders
- **Genuine Numbers & Metrics**: Uses real data from your resume or generates contextually appropriate metrics
- **Better Error Handling**: Clear feedback for unsupported file formats

### 📁 File Support
- **PDF Files**: Full text extraction and analysis
- **Plain Text Files**: Direct content processing
- **Smart Error Messages**: Guides users on supported formats

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Resume Builder"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `ResumeBuilder` directory:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Development

### Available Scripts (from root directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
├── ResumeBuilder/          # Main Next.js application
│   ├── app/
│   │   ├── api/upload/     # Resume processing API
│   │   ├── components/     # React components
│   │   ├── lib/           # LaTeX generators and utilities
│   │   └── ...
│   ├── public/            # Static assets
│   └── package.json       # Dependencies
├── package.json           # Root package with convenience scripts
└── README.md              # This file
```

## 🔄 Recent Updates

### Education Year Handling
- ✅ Preserves exact year formats from original resume
- ✅ Handles various date formats (2024-Present, 2000-2005, etc.)
- ✅ Omits years when not present in original resume

### Company Name Extraction
- ✅ Extracts real company names from resumes
- ✅ Eliminates placeholder text like "[Company Name]"
- ✅ Maintains original company name formatting

### Metrics and Numbers
- ✅ Uses actual numbers from original resume
- ✅ Generates realistic, contextually appropriate metrics
- ✅ Removes placeholder numbers like "[Number]" or "[X%]"

### File Format Support
- ✅ Clear guidance on supported formats
- ✅ Better error messages for unsupported files
- ✅ Word document detection and guidance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Ensure your API key is correctly configured
3. Verify file formats are supported
4. Open an issue on GitHub

---

**Built with ❤️ using Next.js, Google Gemini AI, and LaTeX** 