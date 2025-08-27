import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type FileUploadDropzoneProps = {
  onFilesAdded: (files: File[]) => void;
  loading: boolean;
};

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  onFilesAdded,
  loading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf"
    );
    
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFilesAdded(files);
    }
    // Reset input so same files can be selected again if needed
    e.target.value = '';
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
            : 'border-[var(--border)] hover:border-[var(--primary)]'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          background: isDragOver 
            ? `${getComputedStyle(document.documentElement).getPropertyValue('--primary')}08` 
            : "var(--surface)"
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
        />

        {/* Upload Icon */}
        <div className="mb-4">
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{ 
              background: "var(--light-blue)",
              color: "var(--primary)"
            }}
          >
            <span className="text-2xl">📁</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 
            className="text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {isDragOver ? "Drop your PDF files here" : "Upload W9 PDF Files"}
          </h3>
          <p 
            className="text-sm"
            style={{ color: "var(--secondary-text)" }}
          >
            {isDragOver 
              ? "Release to add files to your collection" 
              : "Drag and drop your files here, or click to browse"
            }
          </p>
        </div>

        {/* Browse Button */}
        {!isDragOver && (
          <div className="mt-6">
            <Button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              className="px-6 py-2 font-semibold rounded-lg text-white shadow-lg transition-all duration-150"
              style={{
                background: "var(--primary)",
                border: "none"
              }}
            >
              📂 Browse Files
            </Button>
          </div>
        )}

        {/* File type info */}
        <p 
          className="text-xs mt-4"
          style={{ 
            color: "var(--secondary-text)", 
            opacity: 0.8 
          }}
        >
          Only PDF files are supported • Multiple files allowed
        </p>
      </div>
    </div>
  );
};