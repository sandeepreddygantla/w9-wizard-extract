
import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // Safe defaults
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Avoid SSR mismatch

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="border border-primary/20 transition-all duration-200"
    >
      {theme === "dark" ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
    </Button>
  );
}
