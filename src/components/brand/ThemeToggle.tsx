import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="min-h-11 min-w-11 rounded-full"
    >
      {resolved === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
