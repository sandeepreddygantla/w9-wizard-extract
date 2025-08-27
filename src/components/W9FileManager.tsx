import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type FileWithId = File & { id: string };

type W9FileManagerProps = {
  files: FileWithId[];
  selectedFiles: string[];
  loading: boolean;
  onSelectFile: (fileId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onDeleteFile: (fileId: string) => void;
  onExtract: () => void;
};

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getTotalSize = (files: FileWithId[], selectedIds: string[]): number => {
  return files
    .filter(file => selectedIds.includes(file.id))
    .reduce((total, file) => total + file.size, 0);
};

export const W9FileManager: React.FC<W9FileManagerProps> = ({
  files,
  selectedFiles,
  loading,
  onSelectFile,
  onSelectAll,
  onClearAll,
  onDeleteFile,
  onExtract,
}) => {
  if (files.length === 0) return null;

  const isAllSelected = files.length > 0 && selectedFiles.length === files.length;
  const totalSize = getTotalSize(files, selectedFiles);

  return (
    <div 
      className="w-full max-w-4xl mx-auto mt-6"
      style={{ 
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <div 
        className="flex justify-between items-center px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            📋 Uploaded Files
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={loading}
            className="text-sm font-medium"
            style={{
              color: "var(--text)",
              borderColor: "var(--primary)",
              background: isAllSelected ? "var(--primary)" : "transparent"
            }}
          >
            {isAllSelected ? "✓ All Selected" : "☑ Select All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={loading}
            className="text-sm font-medium"
            style={{
              color: "var(--secondary-text)",
              borderColor: "var(--border)"
            }}
          >
            🗑 Clear All
          </Button>
        </div>
      </div>

      {/* Table Header */}
      <div 
        className="flex items-center px-6 py-3 text-sm font-semibold"
        style={{ 
          background: "var(--light-blue)",
          color: "var(--text)" 
        }}
      >
        <div className="w-12 flex justify-center items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={isAllSelected ? onClearAll : onSelectAll}
            disabled={loading}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--primary)" }}
          />
        </div>
        <div className="flex-1 min-w-0">FILE NAME</div>
        <div className="w-20 text-center">SIZE</div>
        <div className="w-24 text-center">STATUS</div>
        <div className="w-20 text-center">ACTIONS</div>
      </div>

      {/* File Rows */}
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {files.map((file, index) => {
          const isSelected = selectedFiles.includes(file.id);
          return (
            <div
              key={file.id}
              className="flex items-center px-6 py-4 hover:bg-opacity-30 transition-colors"
              style={{ 
                background: isSelected ? "var(--light-blue)" : "transparent" 
              }}
            >
              {/* Checkbox */}
              <div className="w-12 flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectFile(file.id)}
                  disabled={loading}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--primary)" }}
                />
              </div>
              
              {/* File Name */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className="text-xl">📄</span>
                <span 
                  className="font-medium truncate"
                  style={{ color: "var(--text)" }}
                  title={file.name}
                >
                  {file.name}
                </span>
              </div>
              
              {/* Size */}
              <div className="w-20 text-center">
                <span 
                  className="text-sm font-medium"
                  style={{ color: "var(--secondary-text)" }}
                >
                  {formatFileSize(file.size)}
                </span>
              </div>
              
              {/* Status */}
              <div className="w-24 flex justify-center">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                  style={{ 
                    background: "#10B981", 
                    color: "white" 
                  }}
                >
                  ✓ READY
                </span>
              </div>
              
              {/* Actions */}
              <div className="w-20 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteFile(file.id)}
                  disabled={loading}
                  className="p-2 h-8 w-8"
                  style={{
                    borderColor: "#EF4444",
                    color: "#EF4444"
                  }}
                >
                  🗑
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div 
        className="flex justify-between items-center px-6 py-4"
        style={{ 
          background: "var(--light-blue)",
          borderTop: "1px solid var(--border)" 
        }}
      >
        <div className="flex items-center gap-4">
          <span 
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--text)" }}
          >
            📄 {selectedFiles.length} files selected
          </span>
          <span 
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--secondary-text)" }}
          >
            💾 {formatFileSize(totalSize)} total size
          </span>
        </div>
        
        <Button
          onClick={onExtract}
          disabled={loading || selectedFiles.length === 0}
          className="px-6 py-2 font-semibold rounded-lg text-white shadow-lg transition-all duration-150 disabled:opacity-50"
          style={{
            background: selectedFiles.length > 0 ? "var(--primary)" : "var(--secondary-text)",
            border: "none",
            boxShadow: selectedFiles.length > 0 ? "0 4px 12px rgba(255, 97, 43, 0.3)" : "none"
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full bg-white animate-pulse" />
              Extracting...
            </span>
          ) : (
            `Extract ${selectedFiles.length > 0 ? selectedFiles.length : ""} Files`
          )}
        </Button>
      </div>
    </div>
  );
};