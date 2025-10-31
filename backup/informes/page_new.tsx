"use client";

import { useState } from "react";
import { KHDashboard } from "./components/qlikview/KHDashboard";

export default function InformesPage() {
  const [filtros, setFiltros] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    hasta: new Date().toISOString().split('T')[0], // hoje
  });

  return (
    <KHDashboard
      filtros={filtros}
      autoRefresh={true}
      refreshInterval={30000}
    />
  );
}




