import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "global-config.json");

// Default configuration
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

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(CONFIG_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load configuration from file
function loadConfig(): GlobalConfig {
  ensureDataDirectory();

  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  try {
    const fileContent = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
    const config = JSON.parse(fileContent);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error("Error loading config:", error);
    return DEFAULT_CONFIG;
  }
}

// Save configuration to file
function saveConfig(config: GlobalConfig) {
  ensureDataDirectory();

  try {
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error saving config:", error);
    throw new Error("Failed to save configuration");
  }
}

// GET: Retrieve current configuration
export async function GET() {
  try {
    const config = loadConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load configuration" },
      { status: 500 }
    );
  }
}

// POST: Update configuration
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const currentConfig = loadConfig();

    const updatedConfig: GlobalConfig = {
      ...currentConfig,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    saveConfig(updatedConfig);

    return NextResponse.json(updatedConfig);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

// PUT: Update specific section of configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: "Section and data are required" },
        { status: 400 }
      );
    }

    const currentConfig = loadConfig();

    // Create updated config with proper typing
    const updatedConfig: GlobalConfig = {
      ...currentConfig,
      hero: section === 'hero' ? { ...currentConfig.hero, ...data } : currentConfig.hero,
      dashboard: section === 'dashboard' ? { ...currentConfig.dashboard, ...data } : currentConfig.dashboard,
      shifts: section === 'shifts' ? { ...currentConfig.shifts, ...data } : currentConfig.shifts,
      lastUpdated: new Date().toISOString(),
    };

    saveConfig(updatedConfig);

    return NextResponse.json(updatedConfig);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update configuration section" },
      { status: 500 }
    );
  }
}

// DELETE: Reset configuration to defaults
export async function DELETE() {
  try {
    saveConfig(DEFAULT_CONFIG);
    return NextResponse.json(DEFAULT_CONFIG);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset configuration" },
      { status: 500 }
    );
  }
}
