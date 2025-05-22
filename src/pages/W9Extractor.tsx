import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

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

  const currentResult =
    result.find((r) => r.file === selected) ?? result[0] ?? null;

  const getPdfUrl = (file: File) => URL.createObjectURL(file);

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExtract();
          }}
          className="w-full flex flex-col md:flex-row gap-4 md:gap-2 items-stretch"
        >
          {/* Input + Label stack */}
          <div className="flex flex-col gap-1 flex-1">
            <Label
              htmlFor="file-uploader"
              className="font-semibold text-[#4438ca] dark:text-fuchsia-300 text-base"
            >
              Upload PDF files
            </Label>
            <Input
              ref={fileInputRef}
              id="file-uploader"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="bg-white/80 dark:bg-zinc-800/70 border border-[#7a72ba] dark:border-fuchsia-700 transition-colors font-semibold outline-none focus:ring-2 focus:ring-[#c77dfa]/60"
              disabled={loading}
              required
            />
            <div className="text-xs text-muted-foreground pt-1 pl-1">
              Only PDF files are supported.
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "px-8 py-2 font-semibold rounded-xl text-white shadow-lg transition-all duration-150 relative",
                "bg-gradient-to-br from-[#5b34ec] via-[#d935ae] to-[#fd62d9]",
                "hover:from-[#3821a6] hover:to-[#a43ffe]",
                "outline-none ring-0 border-0",
                loading && "pointer-events-none"
              )}
              style={{
                boxShadow: "0 2px 24px -4px #d7b2f7b8",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                  Extracting...
                </span>
              ) : (
                "Extract Data"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* RESULTS AREA */}
      <div className={cn(
        "flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto px-2 relative z-10",
        uploadedFiles.length === 0 && "opacity-50 pointer-events-none"
      )}>
        {/* SIDEBAR: Files */}
        <aside className={cn(
          "md:w-64 w-full flex-shrink-0",
          "rounded-lg bg-indigo-50/90 dark:bg-zinc-800 shadow-md",
          uploadedFiles.length === 0 && "hidden"
        )}>
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="pt-4">
              <div className="font-semibold text-indigo-700 dark:text-pink-200 mb-2">Documents</div>
              <ul className="space-y-1">
                {(uploadedFiles.length > 0 ? uploadedFiles : []).map((file) => (
                  <li key={file.name}>
                    <Button
                      variant={selected === file.name ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start truncate font-medium rounded transition",
                        selected === file.name
                          ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow"
                          : "hover:bg-indigo-100 dark:hover:bg-zinc-700"
                      )}
                      size="sm"
                      onClick={() => setSelected(file.name)}
                      disabled={loading}
                    >
                      {file.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* MAIN PREVIEW */}
        <main className="flex-1">
          {loading && (
            <div className="flex w-full items-center justify-center h-96">
              <Skeleton className="w-full max-w-2xl h-96" />
            </div>
          )}
          {!loading && uploadedFiles.length > 0 && currentResult && (
            <div className="grid gap-8 md:grid-cols-2">
              {/* PDF Preview */}
              <div>
                <Card className="h-full bg-gradient-to-br from-white to-indigo-100 dark:from-zinc-900 dark:to-indigo-950 shadow-lg">
                  <CardContent>
                    <div className="font-bold text-indigo-900 dark:text-fuchsia-300 mb-2">PDF Preview</div>
                    {(() => {
                      const file = uploadedFiles.find(f => f.name === currentResult.file);
                      if (!file) return (<div className="text-sm text-muted-foreground mt-4">PDF not found.</div>);
                      return (
                        <iframe
                          title={`PDF Preview - ${file.name}`}
                          src={getPdfUrl(file)}
                          className="w-full h-80 border rounded shadow"
                          allow="autoplay"
                          aria-label={`PDF Preview for ${file.name}`}
                        />
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
              {/* Extracted JSON */}
              <div>
                <Card className="h-full bg-gradient-to-bl from-white to-pink-100 dark:from-zinc-900 dark:to-pink-950 shadow-lg">
                  <CardContent>
                    <div className="font-bold text-fuchsia-700 dark:text-fuchsia-200 mb-2">Extracted JSON</div>
                    {(() => {
                      try {
                        const data = JSON.parse(currentResult.response);
                        return (
                          <div className="bg-gray-900 text-white rounded p-4 overflow-auto text-xs font-mono h-80 max-h-80 border border-gray-800 shadow-inner">
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                          </div>
                        );
                      } catch (e) {
                        return (
                          <>
                            <div className="text-red-600 mb-2 font-semibold">Invalid JSON</div>
                            <textarea
                              className="bg-gray-100 border text-xs rounded p-2 w-full h-28"
                              value={currentResult.response}
                              readOnly
                            />
                          </>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {!loading && result.length > 0 && (
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                className="border-indigo-400 dark:border-fuchsia-700 font-semibold"
                onClick={handleDownloadAll}
              >
                Download Combined JSON
              </Button>
            </div>
          )}
        </main>
      </div>
      <footer className="pt-10 pb-4 text-center text-xs text-[#545577] dark:text-gray-400 opacity-75">
        &copy; {new Date().getFullYear()} W9 Extractor Tool. Made with <span className="text-pink-400">♥</span>.
      </footer>
    </div>
  );
}
