// src/contexts/ThemeContext.js
import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleDark = (forceValue) => {
    setDarkMode(forceValue !== undefined ? forceValue : (prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
