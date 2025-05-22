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

  // Optum palette for wrapper backgrounds
  const optumBg = "bg-gradient-to-br from-[#d9f6fa] via-white to-[#fff]";

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-start",
        optumBg,
        "transition-colors"
      )}
    >
      <header className="w-full flex justify-between items-center px-4 md:px-16 py-8">
        <h1
          className="font-extrabold text-2xl md:text-3xl drop-shadow-sm flex items-center gap-2"
          style={{ color: "#424242" /* GrayDark */ }}
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
          style={{
            background: "linear-gradient(90deg, #E87722 0%, #F2B411 60%, #FF612B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "2px 2px 12px #ffecb433",
            letterSpacing: "0.01em",
          }}
        >
          Instantly Extract Data from your W9 PDFs
        </h2>
        <p className="text-lg md:text-xl font-medium mb-6 max-w-2xl drop-shadow"
          style={{
            color: "#636363"
          }}>
          Securely upload your W9 form PDFs and let our smart extractor pull out the data you need. Fast, accurate, Optum-branded results.
        </p>
      </section>

      {/* CENTERED UPLOAD FORM */}
      <div className="w-full flex justify-center items-center mb-4" style={{ marginTop: 0 }}>
        <div
          className={cn("flex flex-col items-center justify-center rounded-2xl px-8 py-6 shadow-xl")}
          style={{
            background: "#FFFFFF",
            boxShadow: "0 8px 40px 8px #f7eee366",
            borderRadius: "20px",
            maxWidth: 600,
            minWidth: 340,
            border: "1.5px solid #B3B3B3",
          }}
        >
          <W9UploadForm
            loading={loading}
            handleExtract={handleExtract}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>

      {/* CENTERED RESULTS + DROPDOWN */}
      <div className="w-full flex flex-col items-center justify-center px-0" style={{ minHeight: 440, width: "100vw" }}>
        <W9Results
          loading={loading}
          uploadedFiles={uploadedFiles}
          result={result}
          selected={selected}
          setSelected={setSelected}
          handleDownloadAll={handleDownloadAll}
        />
      </div>
      <footer className="pt-10 pb-4 text-center text-xs" style={{ color: "#636363", opacity: 0.75 }}>
        &copy; {new Date().getFullYear()} W9 Extractor Tool, Optum. Made with <span className="text-[#E87722]">♥</span>.
      </footer>
    </div>
  );
}
