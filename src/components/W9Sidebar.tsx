
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type W9SidebarProps = {
  uploadedFiles: File[];
  selected: string | null;
  setSelected: (fileName: string) => void;
  loading: boolean;
};

export const W9Sidebar: React.FC<W9SidebarProps> = ({
  uploadedFiles,
  selected,
  setSelected,
  loading,
}) => {
  if (uploadedFiles.length === 0) return null;
  return (
    <aside className={cn(
      "md:w-64 w-full flex-shrink-0",
      "rounded-lg bg-indigo-50/90 dark:bg-zinc-800 shadow-md"
    )}>
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="pt-4">
          <div className="font-semibold text-indigo-700 dark:text-pink-200 mb-2">Documents</div>
          <ul className="space-y-1">
            {uploadedFiles.map((file) => (
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
  );
};
