import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { W9UploadForm } from "@/components/W9UploadForm";
import { W9Sidebar } from "@/components/W9Sidebar";
import { W9Results } from "@/components/W9Results";

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

export default function W9Extractor() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { loading, extract, result, setResult } = useExtractW9Data();
  const [selected, setSelected] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setUploadedFiles(files);
    setResult([]); // Reset results on new upload
    setSelected(null);
  };

  const handleExtract = async () => {
    if (!uploadedFiles.length) {
      toast({ title: "Please select PDF file(s) to extract." });
      return;
    }
    await extract(uploadedFiles);
    toast({ title: "Extraction complete!" });
    setSelected(uploadedFiles[0]?.name ?? null);
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

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-start",
        "bg-gradient-to-br from-[#bfdcff] via-[#ffe2fd] to-[#f6dbff] dark:from-gray-900 dark:via-indigo-900 dark:to-gray-800 transition-colors"
      )}
    >
      <header className="w-full flex justify-between items-center px-4 md:px-16 py-8">
        <h1 className="font-extrabold text-2xl md:text-3xl text-[#1a2050] dark:text-white drop-shadow-sm flex items-center gap-2">
          <span role="img" aria-label="document">📄</span>
          <span className="font-black tracking-tight">W9 Extractor</span>
        </h1>
        <ThemeSwitcher />
      </header>

      {/* HERO BANNER */}
      <section
        className="w-full flex flex-col justify-center items-center text-center py-4 md:py-10"
      >
        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
          style={{
            background: "linear-gradient(90deg, #4438ca 10%, #e243bb 50%, #e687fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "2px 2px 12px #f8c8fc33",
          }}
        >
          Instantly Extract Data from your W9 PDFs
        </h2>
        <p className="text-lg md:text-xl text-[#46495e] dark:text-gray-200 font-medium mb-6 max-w-2xl drop-shadow">
          Securely upload your W9 form PDFs and let our smart extractor pull out the data you need. Enjoy fast, accurate, and beautiful results any device, day or night.
        </p>
      </section>

      {/* FILE UPLOAD CARD */}
      <div
        className={cn(
          "w-full max-w-xl mx-auto shadow-xl rounded-3xl bg-white/90 dark:bg-zinc-950/90 px-6 py-8 mb-8",
          "flex flex-col items-center",
          "backdrop-blur-[2px]",
          "ring-1 ring-indigo-100/40 dark:ring-indigo-600/30 relative",
          "z-10"
        )}
        style={{ boxShadow: "0 8px 40px 8px #e0d2f766" }}
      >
        <W9UploadForm
          loading={loading}
          handleExtract={handleExtract}
          handleFileChange={handleFileChange}
          fileInputRef={fileInputRef}
        />
      </div>

      {/* RESULTS AREA */}
      <div className={cn(
        "flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto px-2 relative z-10",
        uploadedFiles.length === 0 && "opacity-50 pointer-events-none"
      )}>
        {/* SIDEBAR: Files */}
        <W9Sidebar
          uploadedFiles={uploadedFiles}
          selected={selected}
          setSelected={setSelected}
          loading={loading}
        />
        {/* MAIN PREVIEW */}
        <W9Results
          loading={loading}
          uploadedFiles={uploadedFiles}
          result={result}
          selected={selected}
          setSelected={setSelected}
          handleDownloadAll={handleDownloadAll}
        />
      </div>
      <footer className="pt-10 pb-4 text-center text-xs text-[#545577] dark:text-gray-400 opacity-75">
        &copy; {new Date().getFullYear()} W9 Extractor Tool. Made with <span className="text-pink-400">♥</span>.
      </footer>
    </div>
  );
}
