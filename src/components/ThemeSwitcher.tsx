import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "optum-theme";

// Ensure tailwind "class" strategy for dark mode, see tailwind.config.ts
export function ThemeSwitcher() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, "light");
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setIsDark((d) => !d)}
      className="border border-primary/20 transition-all duration-200"
      tabIndex={0}
      type="button"
    >
      {isDark ? (
        <span role="img" aria-label="Light mode">🌞</span>
      ) : (
        <span role="img" aria-label="Dark mode">🌙</span>
      )}
    </Button>
  );
}

