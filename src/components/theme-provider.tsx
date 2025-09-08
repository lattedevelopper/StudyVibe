import { useEffect } from 'react';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize theme on app startup
    const savedTheme = localStorage.getItem('theme') || 'light';
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(savedTheme);
    }
  }, []);

  return <>{children}</>;
};