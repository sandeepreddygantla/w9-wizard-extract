
import React from "react";
import { Button } from "@/components/ui/button";
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
  React.useEffect(() => {
    if (!selected && result.length > 0) {
      setSelected(result[0].file);
    }
  }, [result, selected, setSelected]);

  // PDF zoom state
  const [pdfZoom, setPdfZoom] = React.useState(1);
  React.useEffect(() => {
    setPdfZoom(1);
  }, [selected, uploadedFiles.length]);

  const currentResult =
    result.find((r) => r.file === selected) ?? result[0] ?? null;

  const getPdfUrl = (file: File) => URL.createObjectURL(file);

  if (!uploadedFiles.length) return null;

  // Layout sizing
  // 80vh is a good fit for desktop, falls back to 60vh at small screen.
  // 16px gutter (gap-4).
  // On mobile, columns stack.
  return (
    <main className="w-screen max-w-none px-0">
      {/* FILE DROPDOWN */}
      {!loading && uploadedFiles.length > 1 && (
        <div className="flex justify-center w-full mb-4">
          <Select
            value={selected || uploadedFiles[0]?.name}
            onValueChange={(val) => setSelected(val)}
          >
            <SelectTrigger className="w-full max-w-3xl bg-white dark:bg-zinc-800 border border-indigo-400 dark:border-fuchsia-700">
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
        <div className="flex w-full items-center justify-center" style={{ height: "80vh" }}>
          <Skeleton className="w-full h-full max-w-7xl" />
        </div>
      )}

      {!loading && uploadedFiles.length > 0 && currentResult && (
        <div
          className={cn(
            "w-full grid",
            "grid-cols-1 md:grid-cols-2", // Split to 2 columns on md+
            "gap-4", // 16px gutter between columns
            "max-w-none", // Full width
            "mx-0" // Remove side margin so columns touch viewport edge
          )}
          style={{
            height: "80vh",
            minHeight: 320,
          }}
        >
          {/* LEFT COLUMN: PDF Preview */}
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex items-center justify-between mb-2 px-2">
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
            <div className="flex-1 overflow-y-auto w-full h-0" style={{ minHeight: 0 }}>
              {(() => {
                const file = uploadedFiles.find(f => f.name === currentResult.file);
                if (!file) return (<div className="text-sm text-muted-foreground mt-4">PDF not found.</div>);
                return (
                  <iframe
                    title={`PDF Preview - ${file.name}`}
                    src={getPdfUrl(file)}
                    className="w-full h-full border-none"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 0,
                      minWidth: 0,
                      maxWidth: "100%",
                      maxHeight: "100%",
                      background: "white",
                      zoom: pdfZoom,
                      display: "block",
                    }}
                    allow="autoplay"
                    aria-label={`PDF Preview for ${file.name}`}
                  />
                );
              })()}
            </div>
          </div>
          {/* RIGHT COLUMN: Extracted JSON */}
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="font-bold text-fuchsia-700 dark:text-fuchsia-200 mb-2 px-2">Extracted JSON</div>
            <div className="flex-1 bg-gray-900 text-white rounded p-2 overflow-y-auto text-xs font-mono border border-gray-800 shadow-inner h-0" style={{
              minHeight: 0,
              height: "100%",
              maxHeight: "100%",
            }}>
              {(() => {
                try {
                  const data = JSON.parse(currentResult.response);
                  return (
                    <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
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
            </div>
          </div>
        </div>
      )}
      {!loading && result.length > 0 && (
        <div className="flex justify-end mt-6 px-2">
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
