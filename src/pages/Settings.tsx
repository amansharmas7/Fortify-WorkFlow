import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fh-text-dark">Settings</h1>
        <p className="text-sm text-fh-text-muted">Manage your application preferences and theme.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-fh-border shadow-sm">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Fortify Docs looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-fh-text-dark">Interface Theme</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    theme === 'light' ? 'border-fh-teal bg-fh-teal/5 ring-1 ring-fh-teal' : 'border-fh-border hover:bg-accent/50'
                  }`}
                >
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-fh-teal' : 'text-fh-text-muted'}`} />
                  <span className={`text-xs font-medium ${theme === 'light' ? 'text-fh-teal' : 'text-fh-text-dark'}`}>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    theme === 'dark' ? 'border-fh-teal bg-fh-teal/5 ring-1 ring-fh-teal' : 'border-fh-border hover:bg-accent/50'
                  }`}
                >
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-fh-teal' : 'text-fh-text-muted'}`} />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-fh-teal' : 'text-fh-text-dark'}`}>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    theme === 'system' ? 'border-fh-teal bg-fh-teal/5 ring-1 ring-fh-teal' : 'border-fh-border hover:bg-accent/50'
                  }`}
                >
                  <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-fh-teal' : 'text-fh-text-muted'}`} />
                  <span className={`text-xs font-medium ${theme === 'system' ? 'text-fh-teal' : 'text-fh-text-dark'}`}>System</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-fh-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-fh-text-dark">Reduced Motion</h4>
                  <p className="text-xs text-fh-text-muted">Minimize animations across the interface.</p>
                </div>
                <Button variant="outline" size="sm" className="border-fh-border">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
