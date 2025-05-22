
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type ExtractionResult = {
  file: string;
  response: string;
};

function useExtractW9Data() {
  // Stub for actual API call
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult[]>([]);
  const extract = async (files: File[]) => {
    setLoading(true);

    // TODO: Upload files to backend API and get structured response.
    // This stub simulates extraction and returns a fake JSON after timeout.
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

  // Helper for nice preview of PDFs (browser's PDF viewer)
  const getPdfUrl = (file: File) => URL.createObjectURL(file);

  // Helper for download
  const handleDownloadAll = () => {
    const jsonRaw = Object.fromEntries(
      result.map((r) => [r.file, r.response])
    );
    const blob = new Blob(
      [
        (() => {
          // Try to parse to JSON
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
    <div className="min-h-screen bg-gray-50 flex flex-col py-8">
      <div className="max-w-5xl mx-auto w-full">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              📄 W9 Extractor Tool
            </CardTitle>
            <p className="text-gray-500 mt-2">
              Upload one or multiple W9 PDF forms. The tool extracts data and displays a preview.
            </p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExtract();
              }}
              className="flex flex-col md:flex-row gap-4 items-center md:items-end"
            >
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Label htmlFor="file-uploader" className="font-semibold">
                  Upload PDF files
                </Label>
                <Input
                  ref={fileInputRef}
                  id="file-uploader"
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="bg-white"
                  disabled={loading}
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Only PDF files are supported.
                </div>
              </div>
              <Button type="submit" disabled={loading} className="md:ml-2">
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
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar for file list */}
          <aside className="lg:w-64 w-full flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {(uploadedFiles.length > 0 ? uploadedFiles : []).map((file) => (
                    <li key={file.name}>
                      <Button
                        variant={selected === file.name ? "secondary" : "ghost"}
                        className="w-full justify-start truncate"
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

          {/* Main preview section */}
          <main className="flex-1">
            {loading && (
              <div className="flex w-full items-center justify-center h-96">
                <Skeleton className="w-1/2 h-96" />
              </div>
            )}
            {!loading && currentResult && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* PDF Preview */}
                <div>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">PDF Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const file = uploadedFiles.find(f => f.name === currentResult.file);
                        if (!file) return (<div className="text-sm text-muted-foreground mt-4">PDF not found.</div>);
                        return (
                          <iframe
                            title={`PDF Preview - ${file.name}`}
                            src={getPdfUrl(file)}
                            className="w-full h-96 border rounded shadow"
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
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">Extracted JSON</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        try {
                          const data = JSON.parse(currentResult.response);
                          return (
                            <div className="bg-gray-900 text-white rounded p-4 overflow-auto text-xs font-mono h-96 max-h-96">
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
                <Button variant="outline" onClick={handleDownloadAll}>
                  Download Combined JSON
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
