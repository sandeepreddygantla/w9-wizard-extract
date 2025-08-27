# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 5173 (default Vite port)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

This is a React-based W9 form data extraction tool built with modern TypeScript stack:

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC
- **UI Components**: shadcn/ui (Radix UI primitives) - minimal set retained
- **Styling**: Tailwind CSS with custom Optum design system
- **Routing**: React Router DOM
- **State Management**: React hooks (TanStack Query available but not actively used)
- **Notifications**: Sonner toast notifications
- **Theming**: next-themes for dark/light mode support

### Project Structure

```
src/
├── components/
│   ├── ui/                      # shadcn/ui components (button, skeleton, select, dialog, etc.)
│   ├── FileUploadDropzone.tsx   # Modern drag-and-drop file upload interface
│   ├── W9FileManager.tsx        # File management table with checkboxes and operations
│   ├── W9Results.tsx            # Results display with PDF preview and JSON output
│   └── ThemeSwitcher.tsx        # Theme toggle component
├── pages/
│   └── Index.tsx                # Main application page and state management
├── hooks/                       # Custom React hooks (use-toast)
├── lib/
│   └── utils.ts                 # Utility functions (cn, etc.)
└── main.tsx                     # Application entry point
```

### Key Application Flow

1. **File Upload** (`FileUploadDropzone`): Modern drag-and-drop PDF upload with browse button
2. **File Management** (`W9FileManager`): Table interface with selection, file operations, and extraction trigger
3. **Data Extraction** (`Index.tsx`): Mock extraction service simulates processing with loading states
4. **Results Display** (`W9Results`): Side-by-side PDF preview and JSON output with file switching dropdown
5. **Data Export**: Download combined JSON results from all processed files

### Component Architecture

- **Index.tsx** is the main container managing all state and coordinating between components
- **FileUploadDropzone** handles modern drag-and-drop file upload with visual feedback
- **W9FileManager** provides file selection, operations, and extraction initiation in a table layout
- **W9Results** displays dual-panel results (PDF viewer + JSON output) with dropdown file selection
- UI components use minimal shadcn/ui set for consistent design system

### Styling System

Uses Optum design system colors and custom CSS variables:
- Primary colors: `#FF612B` (orange), `#FAF8F2` (light background), `#D9F6FA` (water blue)
- Secondary colors: `#002677` (navy), `#4B4D4F` (gray), `#FFFFFF` (white)
- Custom CSS variables for theming: `var(--background)`, `var(--text)`, `var(--primary)`, etc.
- Consistent container widths: All major UI containers use `max-w-4xl` (1024px) for alignment
- Responsive design with mobile-first approach

### State Management

- Local React state for file management, extraction results, and UI state
- `useExtractW9Data` custom hook encapsulates mock extraction logic
- File objects use `Object.assign()` to preserve File prototype (critical for PDF preview)
- State includes: `uploadedFiles`, `selectedFileIds`, `result`, `selected` file for viewing

### Configuration Files

- `components.json` - shadcn/ui configuration
- `vite.config.ts` - Vite build configuration with @ alias
- `tailwind.config.ts` - Tailwind CSS configuration
- Path alias `@` points to `./src`

## Development Notes

- This is a Lovable.dev project with auto-deployment via GitHub integration
- Currently uses mock data extraction (see `useExtractW9Data` in Index.tsx)
- PDF preview uses `URL.createObjectURL()` and iframe embedding with proper error handling
- File upload restricted to PDF files only with drag-and-drop support
- Results display supports multiple file processing with dropdown selection
- Major cleanup performed: removed 67% of unused shadcn/ui components to reduce bundle size

## Important Implementation Details

### File Object Handling
When creating file objects with IDs, use `Object.assign(file, { id: ... })` instead of spread operator to preserve File prototype. This is critical for PDF preview functionality.

### Container Alignment
All major UI containers (upload, file manager, dropdown, previews) use consistent `max-w-4xl` width for visual alignment.

### Error Handling
The `getPdfUrl` function includes proper null checks and try-catch blocks to prevent blank preview issues.