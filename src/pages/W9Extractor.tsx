
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

  // === LANDING HERO SECTION ===
  return (
    <div className={cn(
      "min-h-screen w-full flex flex-col items-center",
      "bg-gradient-to-br from-blue-200 from-30% via-fuchsia-100 to-pink-100 dark:from-gray-900 dark:to-gray-800 dark:via-indigo-900 transition-colors",
    )}>
      <header className="w-full flex justify-between items-center px-4 md:px-12 py-6">
        <h1 className="font-extrabold text-2xl md:text-3xl text-primary drop-shadow-sm flex items-center gap-2">
          <span role="img" aria-label="document">📄</span>
          W9 Extractor
        </h1>
        <ThemeSwitcher />
      </header>

      {/* HERO BANNER */}
      <section className="w-full flex flex-col justify-center items-center text-center py-6 md:py-12 mb-0">
        <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          Instantly Extract Data from your W9 PDFs
        </h2>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium mb-6 max-w-xl drop-shadow">
          Securely upload your W9 form PDFs and let our smart extractor pull out the data you need. Enjoy fast, accurate, and beautiful results any device, day or night.
        </p>
      </section>

      {/* FILE UPLOAD CARD */}
      <div className={cn(
        "w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl pb-8 px-4 md:px-10 mb-8 dark:bg-zinc-900/90",
        "ring-1 ring-indigo-200/40 dark:ring-indigo-800/50 isolate"
      )}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExtract();
          }}
          className="flex flex-col md:flex-row gap-4 items-center md:items-end py-6"
        >
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Label htmlFor="file-uploader" className="font-semibold text-indigo-800 dark:text-fuchsia-300">
              Upload PDF files
            </Label>
            <Input
              ref={fileInputRef}
              id="file-uploader"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="bg-white dark:bg-zinc-800/70 border-2 border-indigo-200/50 dark:border-fuchsia-700 transition-colors"
              disabled={loading}
              required
            />
            <div className="text-xs text-muted-foreground">
              Only PDF files are supported.
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="md:ml-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white shadow-xl transition-all"
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
      <footer className="pt-10 pb-4 text-center text-xs text-gray-500 dark:text-gray-400 opacity-75">
        &copy; {new Date().getFullYear()} W9 Extractor Tool. Made with <span className="text-pink-400">♥</span>.
      </footer>
    </div>
  );
}
