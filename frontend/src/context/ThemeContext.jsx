// src/context/ThemeContext.jsx

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const themes = ["theme1", "theme2", "theme3", "theme4"];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [mode, setMode] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const storedMode = localStorage.getItem("mode");

    setTheme(themes.includes(storedTheme) ? storedTheme : "theme1");
    setMode(storedMode === "dark" || storedMode === "light" ? storedMode : "light");
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !theme || !mode) return;

    const root = document.documentElement;
    root.className = "";
    root.classList.add(`${theme}-${mode}`);

    localStorage.setItem("theme", theme);
    localStorage.setItem("mode", mode);
  }, [theme, mode, isLoaded]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const cycleTheme = () => {
    setTheme((prev) => {
      const nextIndex = (themes.indexOf(prev) + 1) % themes.length;
      return themes[nextIndex];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleMode, cycleTheme }}>
      {isLoaded ? children : null}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);


