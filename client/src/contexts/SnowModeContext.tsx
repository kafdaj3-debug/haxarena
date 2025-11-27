import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SnowModeContextType {
  isSnowEnabled: boolean;
  toggle: () => void;
}

const SnowModeContext = createContext<SnowModeContextType | undefined>(undefined);

export function SnowModeProvider({ children }: { children: ReactNode }) {
  const [isSnowEnabled, setIsSnowEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snowMode");
      if (stored !== null) {
        return stored === "true";
      }
      return true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("snowMode", isSnowEnabled.toString());
  }, [isSnowEnabled]);

  const toggle = () => {
    setIsSnowEnabled((prev) => !prev);
  };

  return (
    <SnowModeContext.Provider value={{ isSnowEnabled, toggle }}>
      {children}
    </SnowModeContext.Provider>
  );
}

export function useSnowMode() {
  const context = useContext(SnowModeContext);
  if (context === undefined) {
    throw new Error("useSnowMode must be used within a SnowModeProvider");
  }
  return context;
}

