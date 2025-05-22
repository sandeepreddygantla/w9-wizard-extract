
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ZoomIn, ZoomOut } from "lucide-react";

type ExtractionResult = {
  file: string;
  response: string;
};
type W9ResultsProps = {
  loading: boolean;
  uploadedFiles: File[];
  result: ExtractionResult[];
  selected: string | null;
  setSelected: (fileName: string | null) => void;
  handleDownloadAll: () => void;
};

export const W9Results: React.FC<W9ResultsProps> = ({
  loading,
  uploadedFiles,
  result,
  selected,
  setSelected,
  handleDownloadAll,
}) => {
  // Always try to sync the selected file to the first result if none is selected.
  React.useEffect(() => {
    if (!selected && result.length > 0) {
      setSelected(result[0].file);
    }
  }, [result, selected, setSelected]);

  // PDF zoom state
  const [pdfZoom, setPdfZoom] = React.useState(1);
  // Reset zoom if file changes or files re-uploaded
  React.useEffect(() => {
    setPdfZoom(1);
  }, [selected, uploadedFiles.length]);

  const currentResult =
    result.find((r) => r.file === selected) ?? result[0] ?? null;

  const getPdfUrl = (file: File) => URL.createObjectURL(file);

  if (!uploadedFiles.length) return null;

  return (
    <main className="w-full">
      {/* FILE DROPDOWN */}
      {!loading && uploadedFiles.length > 1 && (
        <div className="flex justify-center w-full mb-4">
          <Select
            value={selected || uploadedFiles[0]?.name}
            onValueChange={(val) => setSelected(val)}
          >
            <SelectTrigger className="w-full bg-white dark:bg-zinc-800 border border-indigo-400 dark:border-fuchsia-700">
              <SelectValue placeholder="Select a file..." />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white dark:bg-zinc-800">
              <SelectGroup>
                {uploadedFiles.map((file) => (
                  <SelectItem
                    key={file.name}
                    value={file.name}
                    className="truncate"
                  >
                    {file.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {loading && (
        <div className="flex w-full items-center justify-center h-96">
          <Skeleton className="w-full max-w-2xl h-96" />
        </div>
      )}

      {!loading && uploadedFiles.length > 0 && currentResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* LEFT COLUMN: PDF Preview */}
          <div className="flex flex-col items-center">
            <Card className="h-full w-full bg-gradient-to-br from-white to-indigo-100 dark:from-zinc-900 dark:to-indigo-950 shadow-lg">
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-indigo-900 dark:text-fuchsia-300">PDF Preview</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-indigo-400 dark:border-fuchsia-700"
                      aria-label="Zoom out"
                      onClick={() => setPdfZoom(z => Math.max(z - 0.15, 0.25))}
                    >
                      <ZoomOut />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-indigo-400 dark:border-fuchsia-700"
                      aria-label="Zoom in"
                      onClick={() => setPdfZoom(z => Math.min(z + 0.15, 3))}
                    >
                      <ZoomIn />
                    </Button>
                  </div>
                </div>
                {(() => {
                  const file = uploadedFiles.find(f => f.name === currentResult.file);
                  if (!file) return (<div className="text-sm text-muted-foreground mt-4">PDF not found.</div>);
                  return (
                    <div className="w-full flex justify-center">
                      <iframe
                        title={`PDF Preview - ${file.name}`}
                        src={getPdfUrl(file)}
                        className="border rounded shadow bg-white"
                        style={{
                          width: `${280 * pdfZoom}px`,
                          height: `${320 * pdfZoom}px`,
                          minWidth: 240,
                          minHeight: 180,
                          maxWidth: "100%",
                          maxHeight: "60vh",
                          transition: "all 0.2s cubic-bezier(.23,1.07,.42,1)",
                          zoom: pdfZoom,
                        }}
                        allow="autoplay"
                        aria-label={`PDF Preview for ${file.name}`}
                      />
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
          {/* RIGHT COLUMN: Extracted JSON */}
          <div>
            <Card className="h-full w-full bg-gradient-to-bl from-white to-pink-100 dark:from-zinc-900 dark:to-pink-950 shadow-lg">
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
  );
};
