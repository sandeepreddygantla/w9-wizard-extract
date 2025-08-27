# W9 Data Extractor

A modern web application for extracting structured data from W9 tax form PDFs using AI and Azure Document Intelligence.

## Features

- 🚀 **Modern React Frontend** - Built with React 18, TypeScript, and Tailwind CSS
- 🤖 **AI-Powered Extraction** - Uses Azure OpenAI GPT-4 for intelligent data parsing
- 📄 **Document Intelligence** - Azure Document Intelligence for PDF processing
- 🎨 **Optum Design System** - Professional UI with light/dark mode support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔒 **Enterprise Security** - Azure AD authentication and secure API handling
- 🖱️ **Drag & Drop Upload** - Intuitive file upload interface
- 📊 **JSON Export** - Download extracted data in structured JSON format

## Architecture

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS with custom Optum design tokens
- **Components**: Minimal shadcn/ui component set
- **State**: React hooks for local state management

### Backend (Python FastAPI)
- **Framework**: FastAPI for modern async Python API
- **AI/ML**: Azure OpenAI GPT-4.1 for data extraction
- **Document Processing**: Azure Document Intelligence
- **Validation**: Pydantic models for data validation
- **Authentication**: Azure AD client credentials flow

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd w9-wizard-extract

# Install frontend dependencies
npm install

# Install backend dependencies  
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `backend/.env` file with your Azure credentials:

```env
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_PROJECT_ID=your-project-id
tenant_id=your-tenant-id
client_id=your-doc-intelligence-client-id
client_secret=your-doc-intelligence-client-secret
endpoint=your-doc-intelligence-endpoint
```

### 3. Development

```bash
# Terminal 1: Start React dev server
npm run dev

# Terminal 2: Start Python API
cd backend
python api_server.py
```

Visit `http://localhost:5173` to use the application.

### 4. Production Build

```bash
# Build React app
npm run build

# Start production server (serves React + API)
cd backend
python api_server.py
```

Visit `http://localhost:8000` for the production build.

## Deployment

### Windows IIS Server

This application is designed for deployment on Windows IIS Server. See the detailed [Deployment Guide](deployment-guide.md) for step-by-step instructions.

**Key deployment files:**
- `web.config` - IIS configuration for frontend
- `backend/web.config` - IIS configuration for Python API  
- `deployment-guide.md` - Complete deployment instructions

## How It Works

1. **Upload**: Drag and drop PDF files or click to browse
2. **Selection**: Choose which files to process (supports multiple files)
3. **Processing**: 
   - Azure Document Intelligence extracts text and form fields
   - GPT-4 processes the extracted content into structured JSON
   - Pydantic models validate and normalize the data
4. **Results**: View extracted data with PDF preview side-by-side
5. **Export**: Download all results as combined JSON file

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/extract` - Extract data from uploaded PDF files

## Development Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production  
npm run build:dev   # Build in development mode
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

## Project Structure

```
w9-wizard-extract/
├── src/                    # React frontend source
│   ├── components/         # UI components
│   ├── pages/             # Page components  
│   ├── services/          # API service layer
│   └── hooks/             # React hooks
├── backend/               # Python FastAPI backend
│   ├── api_server.py      # Main FastAPI application
│   ├── app.py             # W9 extraction logic
│   └── requirements.txt   # Python dependencies
├── dist/                  # React build output
└── deployment files...
```

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for frontend code
3. Include proper error handling
4. Test thoroughly before submitting
5. Update documentation as needed

## Security

- All Azure credentials should be stored securely (Azure Key Vault in production)
- Never commit `.env` files with real credentials
- API endpoints include proper validation and error handling
- File uploads are restricted to PDF files only
- Temporary files are cleaned up automatically

## License

© 2025 W9 Extractor Tool, Optum. All rights reserved.