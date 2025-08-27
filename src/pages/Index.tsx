import React, { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";
import { W9FileManager } from "@/components/W9FileManager";
import { W9Results } from "@/components/W9Results";

type FileWithId = File & { id: string };

type ExtractionResult = {
  file: string;
  response: string;
};

function useExtractW9Data() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult[]>([]);
  const extract = async (files: File[]) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setResult(
      files.map((f) => ({
        file: f.name,
        response: JSON.stringify(
          {
            name: "John Doe",
            ein: "12-3456789",
            ssn: "XXX-XX-6789",
            entity_type: "Individual/sole proprietor",
            address: "123 Sample St",
            city: "Somewhere",
            state: "TX",
            zip: "75001",
            signed: "Y",
            signature_date: "2024-05-21",
            file: f.name,
          },
          null,
          2
        ),
      }))
    );
    setLoading(false);
  };
  return { loading, extract, result, setResult };
}

export default function Index() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<FileWithId[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const { loading, extract, result, setResult } = useExtractW9Data();
  const [selected, setSelected] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    const filesWithIds: FileWithId[] = newFiles.map(file => 
      Object.assign(file, { id: `${file.name}-${Date.now()}-${Math.random()}` })
    );
    
    setUploadedFiles(prev => [...prev, ...filesWithIds]);
    setSelectedFileIds(prev => [...prev, ...filesWithIds.map(f => f.id)]);
    setResult([]);
    setSelected(null);
    
    toast({ 
      title: `Added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`
    });
  };
  
  const handleSelectFile = (fileId: string) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
  
  const handleSelectAll = () => {
    setSelectedFileIds(uploadedFiles.map(f => f.id));
  };
  
  const handleClearAll = () => {
    setUploadedFiles([]);
    setSelectedFileIds([]);
    setResult([]);
    setSelected(null);
    toast({ title: "All files cleared" });
  };
  
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    
    // If the deleted file was selected for viewing, clear the selection
    const deletedFile = uploadedFiles.find(f => f.id === fileId);
    if (deletedFile && selected === deletedFile.name) {
      setSelected(null);
    }
    
    toast({ title: "File deleted" });
  };

  const handleExtract = async () => {
    const selectedFiles = uploadedFiles.filter(f => selectedFileIds.includes(f.id));
    if (!selectedFiles.length) {
      toast({ title: "Please select files to extract." });
      return;
    }
    await extract(selectedFiles);
    toast({ title: "Extraction complete!" });
    setSelected(selectedFiles[0]?.name ?? null);
  };

  const handleDownloadAll = () => {
    const jsonRaw = Object.fromEntries(result.map((r) => [r.file, r.response]));
    const blob = new Blob(
      [
        (() => {
          try {
            const parsed = Object.fromEntries(
              Object.entries(jsonRaw).map(([k, v]) => [k, JSON.parse(v)])
            );
            return JSON.stringify(parsed, null, 2);
          } catch {
            return JSON.stringify(jsonRaw, null, 2);
          }
        })(),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "w9_data.json";
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // Optum palette for wrapper backgrounds
  const optumBg = "bg-[var(--background)]";

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-start",
        optumBg,
        "transition-colors"
      )}
    >
      <header className="w-full flex justify-between items-center px-4 md:px-16 py-8" style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <h1
          className="font-extrabold text-2xl md:text-3xl drop-shadow-sm flex items-center gap-2"
          style={{ color: 'var(--text)' }}
        >
          <span role="img" aria-label="document">📄</span>
          <span className="font-black tracking-tight">W9 Extractor</span>
        </h1>
        <ThemeSwitcher />
      </header>

      {/* HERO BANNER */}
      <section className="w-full flex flex-col justify-center items-center text-center py-4 md:py-10">
        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
          style={{ color: 'var(--text)' }}
        >
          Instantly Extract Data from your W9 PDFs
        </h2>
        <p className="text-lg md:text-xl font-medium mb-6 max-w-2xl drop-shadow" style={{ color: 'var(--secondary-text)' }}>
          Securely upload your W9 form PDFs and let our smart extractor pull out the data you need. Fast, accurate, and reliable results.
        </p>
      </section>

      {/* UPLOAD SECTION */}
      <div className="w-full flex flex-col items-center mb-8 px-4">
        <FileUploadDropzone
          onFilesAdded={handleFilesAdded}
          loading={loading}
        />
        
        <W9FileManager
          files={uploadedFiles}
          selectedFiles={selectedFileIds}
          loading={loading}
          onSelectFile={handleSelectFile}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          onDeleteFile={handleDeleteFile}
          onExtract={handleExtract}
        />
      </div>

      {/* CENTERED RESULTS + DROPDOWN */}
      <div className="w-full flex flex-col items-center justify-center px-4" style={{ minHeight: 440 }}>
        <W9Results
          loading={loading}
          uploadedFiles={uploadedFiles}
          result={result}
          selected={selected}
          setSelected={setSelected}
          handleDownloadAll={handleDownloadAll}
        />
      </div>
      <footer className="pt-10 pb-4 text-center text-xs" style={{ background: 'var(--background)', color: 'var(--text)', opacity: 0.9, borderTop: '1px solid var(--border)' }}>
        &copy; {new Date().getFullYear()} W9 Extractor Tool, Optum.
      </footer>
    </div>
  );
}
