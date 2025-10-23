import React from 'react';
import { cacheDb } from 'lib/cache/historical-cache';
import InformesDashboard from './components/InformesDashboard';

// Esta es una página de servidor (Server Component)
// Podemos buscar dados iniciales aquí si es necesario
async function getInitialDataForFilters() {
  // Busca máquinas diretamente del cache para popular el filtro inicial
  try {
    const maquinas = cacheDb.prepare(`
      SELECT id_maquina, Cod_maquina, Desc_maquina from maquinas WHERE activo = 1 ORDER BY Cod_maquina
    `).all();
    return { maquinas };
  } catch (error) {
    console.error("Error al buscar datos iniciales para filtros:", error);
    // Em caso de erro no build, retorna vazio para não quebrar a página
    return { maquinas: [] };
  }
}

export default async function InformesPage() {
  const { maquinas } = await getInitialDataForFilters();

  return (
    <div className="page-container p-4 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              Sistema de Métricas de Producción
            </h1>
            <p className="text-gray-600 mt-2">Dashboard unificado con datos históricos y análisis QlikView avanzado.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-green-600 font-medium">
              ✅ Sistema operacional
            </div>
          </div>
        </div>
      </header>

      <main>
        <InformesDashboard maquinas={maquinas} />
      </main>

      <footer className="mt-12 text-center text-sm text-gray-400 border-t border-gray-200 pt-8">
        <p className="mb-2">MRPII Advanced Analytics | © {new Date().getFullYear()}</p>
        <p className="text-xs">Versión 2.0 - Dashboard QlikView Integrado</p>
      </footer>
    </div>
  );
}