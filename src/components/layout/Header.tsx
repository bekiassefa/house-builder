import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Moon, Sun, Languages, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Header() {
  const { toggleLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground font-bold shadow-sm">
            H
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:inline-block">HBT <span className="text-primary">Pro</span></span>
          <span className="font-bold text-xl tracking-tight md:hidden">HBT Pro</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isOnline && (
             <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-medium border border-rose-500/20">
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
             </div>
          )}

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="w-12 px-0">
            <span className="font-bold">{language.toUpperCase()}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}