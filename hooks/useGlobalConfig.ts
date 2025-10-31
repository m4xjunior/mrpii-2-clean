import { useState, useEffect, useCallback } from "react";

export interface GlobalConfig {
  hero: {
    sistema: string;
    scada: string[];
    logoUrl?: string;
  };
  dashboard: {
    cardsPerRow: number;
    defaultFilter: "all" | "run" | "stop";
  };
  shifts: {
    hoursPerShift: number;
    showHistoricalDays: number;
  };
  lastUpdated: string;
}

const DEFAULT_CONFIG: GlobalConfig = {
  hero: {
    sistema: "SISTEMA",
    scada: ["SCADA", "2.0"],
    logoUrl: "/logo.png",
  },
  dashboard: {
    cardsPerRow: 4,
    defaultFilter: "all",
  },
  shifts: {
    hoursPerShift: 8,
    showHistoricalDays: 7,
  },
  lastUpdated: new Date().toISOString(),
};

export function useGlobalConfig() {
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration from server
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/config");

      if (!response.ok) {
        throw new Error("Failed to load configuration");
      }

      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      console.error("Error loading config:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save complete configuration
  const saveConfig = useCallback(async (newConfig: Partial<GlobalConfig>) => {
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      const data = await response.json();
      setConfig(data);
      return data;
    } catch (err) {
      console.error("Error saving config:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }, []);

  // Update specific section
  const updateSection = useCallback(
    async (section: keyof GlobalConfig, data: any) => {
      try {
        const response = await fetch("/api/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, data }),
        });

        if (!response.ok) {
          throw new Error("Failed to update configuration section");
        }

        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        return updatedConfig;
      } catch (err) {
        console.error("Error updating config section:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      }
    },
    []
  );

  // Reset to defaults
  const resetConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/config", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to reset configuration");
      }

      const data = await response.json();
      setConfig(data);
      return data;
    } catch (err) {
      console.error("Error resetting config:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }, []);

  // Convenience methods for updating specific sections
  const updateHeroConfig = useCallback(
    (data: Partial<GlobalConfig["hero"]>) => {
      return updateSection("hero", data);
    },
    [updateSection]
  );

  const updateDashboardConfig = useCallback(
    (data: Partial<GlobalConfig["dashboard"]>) => {
      return updateSection("dashboard", data);
    },
    [updateSection]
  );

  const updateShiftsConfig = useCallback(
    (data: Partial<GlobalConfig["shifts"]>) => {
      return updateSection("shifts", data);
    },
    [updateSection]
  );

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    resetConfig,
    updateHeroConfig,
    updateDashboardConfig,
    updateShiftsConfig,
  };
}
