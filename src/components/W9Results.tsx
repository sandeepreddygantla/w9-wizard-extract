
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

  const currentResult =
    result.find((r) => r.file === selected) ?? result[0] ?? null;

  const getPdfUrl = (file: File) => URL.createObjectURL(file);

  if (!uploadedFiles.length) return null;

  return (
    <main className="flex-1">
      {/* DROPDOWN TO SELECT FILE */}
      {!loading && uploadedFiles.length > 1 && (
        <div className="w-full flex justify-center mb-4">
          <Select
            value={selected || uploadedFiles[0]?.name}
            onValueChange={(val) => setSelected(val)}
          >
            <SelectTrigger className="w-64 bg-white dark:bg-zinc-800 border border-indigo-400 dark:border-fuchsia-700">
              <SelectValue placeholder="Select a file..." />
            </SelectTrigger>
            <SelectContent>
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
  );
};
