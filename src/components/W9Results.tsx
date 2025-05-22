
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

  // Color system (Optum)
  const colors = {
    orange: "#E87722",
    orangeBold: "#C25608",
    marigold: "#F2B411",
    tango: "#FF612B",
    water: "#D9F6FA",
    white: "#FFFFFF",
    gray: "#636363",
    grayDark: "#424242",
    grayLight: "#B3B3B3",
  };

  // Panels & container styling
  const panelStyle = {
    border: `1px solid ${colors.grayLight}`,
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 16px 2px #00000008",
    display: "flex",
    flexDirection: "column" as const,
    width: "50%",
    minWidth: 320,
    maxWidth: "1fr",
    height: "100%",
  };

  // Responsiveness: max 1200px container, 92vw on mobile
  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* DROPDOWN AREA */}
      <div
        className="flex flex-col items-center w-full"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          className="w-full"
          style={{
            background: colors.white,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 2px 8px 0 #0001",
            border: `1px solid ${colors.grayLight}`,
            display: uploadedFiles.length > 1 ? "block" : "none",
          }}
        >
          {uploadedFiles.length > 1 && (
            <Select
              value={selected || uploadedFiles[0]?.name}
              onValueChange={val => setSelected(val)}
            >
              <SelectTrigger className={cn(
                "w-full bg-white",
                "text-base font-semibold border",
                "rounded-lg px-4 py-3",
                "outline-none focus:ring-2",
                "focus:ring-[#E87722]",
                "transition-all duration-150",
                "shadow-sm",
              )}
                style={{
                  borderColor: colors.grayLight,
                  color: colors.grayDark,
                  background: colors.white,
                }}
              >
                <SelectValue placeholder="Select a file..." />
              </SelectTrigger>
              <SelectContent
                className="z-50"
                style={{
                  background: colors.white,
                  borderColor: colors.grayLight,
                  color: colors.grayDark,
                }}
              >
                <SelectGroup>
                  {uploadedFiles.map((file) => (
                    <SelectItem
                      key={file.name}
                      value={file.name}
                      className="truncate"
                      style={{ color: colors.grayDark, background: colors.white }}
                    >
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {loading && (
        <div
          className="flex w-full items-center justify-center"
          style={{
            maxWidth: 1200,
            minHeight: 440,
            height: "62vh",
            margin: "0 auto",
          }}
        >
          <Skeleton className="w-full h-full max-w-7xl" />
        </div>
      )}

      {!loading && uploadedFiles.length > 0 && currentResult && (
        <div
          className="flex flex-row items-stretch justify-center"
          style={{
            maxWidth: 1200,
            width: "100vw",
            minHeight: 440,
            margin: "0 auto",
            background: "transparent",
            padding: "0",
            gap: 16,
          }}
        >
          {/* PDF PREVIEW PANEL */}
          <div
            style={{
              ...panelStyle,
              background: colors.water,
              marginRight: 8, // gutter
              color: colors.gray,
              height: "72vh",
            }}
            className="pdf-preview-col flex-1"
          >
            <div
              className="flex items-center justify-between mb-3 px-5 pt-5"
              style={{
                borderBottom: `1px solid ${colors.grayLight}`,
                minHeight: 44,
                marginBottom: 0,
              }}
            >
              <div
                className="font-bold"
                style={{ color: colors.grayDark, letterSpacing: 0.2 }}
              >
                PDF Preview
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Zoom out"
                  onClick={() => setPdfZoom(z => Math.max(z - 0.15, 0.25))}
                  tabIndex={0}
                  style={{
                    borderColor: colors.marigold,
                    background: colors.white,
                  }}
                >
                  <ZoomOut color={colors.tango} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Zoom in"
                  onClick={() => setPdfZoom(z => Math.min(z + 0.15, 3))}
                  tabIndex={0}
                  style={{
                    borderColor: colors.marigold,
                    background: colors.white,
                  }}
                >
                  <ZoomIn color={colors.tango} />
                </Button>
              </div>
            </div>
            <div
              className="flex-1 flex flex-col overflow-y-auto"
              style={{
                padding: 0,
                margin: 0,
                minHeight: 0,
                height: "calc(72vh - 52px)",
                overflowX: "hidden",
              }}
            >
              {(() => {
                const file = uploadedFiles.find(f => f.name === currentResult.file);
                if (!file) return (
                  <div className="text-sm mt-4" style={{ color: colors.gray }}>
                    PDF not found.
                  </div>
                );
                // The key is important so it resets the doc on file change.
                return (
                  <iframe
                    key={file.name + pdfZoom}
                    title={`PDF Preview - ${file.name}`}
                    src={getPdfUrl(file)}
                    className="flex-1 w-full border-none"
                    style={{
                      width: "100%",
                      minHeight: "100%",
                      height: "calc(72vh - 56px)",
                      background: colors.water,
                      zoom: pdfZoom,
                      display: "block",
                      padding: 0,
                      margin: 0,
                    }}
                    allow="autoplay"
                    aria-label={`PDF Preview for ${file.name}`}
                  />
                );
              })()}
            </div>
          </div>

          {/* JSON OUTPUT PANEL */}
          <div
            style={{
              ...panelStyle,
              background: colors.white,
              color: colors.gray,
              border: `1px solid ${colors.grayLight}`,
              height: "72vh",
            }}
            className="json-output-col flex-1"
          >
            <div
              className="font-bold mb-0 px-5 pt-5 pb-0"
              style={{
                color: colors.grayDark,
                letterSpacing: 0.2,
                minHeight: 44,
                borderBottom: `1px solid ${colors.grayLight}`,
                marginBottom: 0,
              }}
            >
              Extracted JSON
            </div>
            <div
              className="flex-1 flex flex-col overflow-y-auto font-mono"
              style={{
                background: "#FFF",
                color: colors.gray,
                borderRadius: "0 0 12px 12px",
                padding: "20px 12px 10px 16px",
                fontSize: "13px",
                height: "calc(72vh - 52px)",
                minHeight: 0,
                margin: 0,
                overflowX: "auto",
              }}
            >
              {(() => {
                try {
                  const data = JSON.parse(currentResult.response);
                  return (
                    <pre style={{ margin: 0, background: "inherit", color: "inherit" }}>{JSON.stringify(data, null, 2)}</pre>
                  );
                } catch (e) {
                  return (
                    <>
                      <div className="mb-2 font-semibold" style={{ color: colors.orangeBold }}>Invalid JSON</div>
                      <textarea
                        className="bg-gray-100 border text-xs rounded p-2 w-full h-28"
                        value={currentResult.response}
                        readOnly
                        style={{
                          color: colors.gray,
                          borderColor: colors.grayLight,
                          background: "#F9F9F9",
                        }}
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
        <div
          className="flex justify-end mt-6 w-full"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            paddingRight: 4,
          }}
        >
          <Button
            variant="outline"
            className="font-semibold"
            onClick={handleDownloadAll}
            style={{
              background: colors.orange,
              color: "white",
              borderColor: colors.orange,
              borderWidth: 1.5,
              borderStyle: "solid",
              borderRadius: 8,
              padding: "11px 27px",
              fontSize: "16px",
              boxShadow: "0 1px 4px 0 #ed7c1b3a",
              transition: "background 0.15s",
            }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.orangeBold; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.orange; }}
          >
            Download Combined JSON
          </Button>
        </div>
      )}
    </main>
  );
};

// ... file ends
