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
        className="font-semibold text-base"
        style={{ color: 'var(--primary)' }}
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
        className="transition-colors font-semibold outline-none focus:ring-2"
        style={{ color: 'var(--text)', background: 'var(--surface)', borderColor: 'var(--border)', minHeight: '44px' }}
        disabled={loading}
        required
      />
      <div className="text-xs pt-1 pl-1" style={{ color: 'var(--text)', opacity: 0.7 }}>
        Only PDF files are supported.
      </div>
    </div>
    <div className="flex items-end justify-end h-full pb-6 md:pb-0">
      <Button
        type="submit"
        disabled={loading}
        className="px-8 py-2 font-semibold rounded-xl text-white shadow-lg transition-all duration-150 relative bg-[#FF612B] hover:bg-[#d94e1f] outline-none ring-0 border-0"
        style={{
          boxShadow: "0 2px 24px -4px #ff612b44",
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
