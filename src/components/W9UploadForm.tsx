
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type W9UploadFormProps = {
  loading: boolean;
  handleExtract: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
};

export const W9UploadForm: React.FC<W9UploadFormProps> = ({
  loading,
  handleExtract,
  handleFileChange,
  fileInputRef,
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleExtract();
    }}
    className="w-full flex flex-row gap-4 items-center"
  >
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
        style={{ minHeight: "44px" }}
      />
      <div className="text-xs text-muted-foreground pt-1 pl-1">
        Only PDF files are supported.
      </div>
    </div>
    <div className="flex items-end justify-end h-full pb-6 md:pb-0">
      <Button
        type="submit"
        disabled={loading}
        className="px-8 py-2 font-semibold rounded-xl text-white shadow-lg transition-all duration-150 relative bg-gradient-to-br from-[#5b34ec] via-[#d935ae] to-[#fd62d9] hover:from-[#3821a6] hover:to-[#a43ffe] outline-none ring-0 border-0"
        style={{
          boxShadow: "0 2px 24px -4px #d7b2f7b8",
          minHeight: "44px",
          marginBottom: "0",
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
);
