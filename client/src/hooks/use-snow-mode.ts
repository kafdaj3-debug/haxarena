import { useEffect, useState } from "react";

export function useSnowMode() {
  const [isSnowEnabled, setIsSnowEnabled] = useState(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snowMode");
      if (stored !== null) {
        return stored === "true";
      }
      // Default: enabled
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

  return { isSnowEnabled, toggle };
}

