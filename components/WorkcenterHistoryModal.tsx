"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Filter, BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

// Interfaces para los datos
interface Workcenter {
  id: number;
  code: string;
  name: string;
  description?: string;
  lineId?: number;
  lineName?: string;
  areaId?: number;
  areaName?: string;
  typeId?: number;
  typeName?: string;
  isActive: boolean;
  displayOrder: number;
  color?: string;
}

interface WorkcenterState {
  id: number;
  workcenterId: number;
  workcenterCode: string;
  workcenterName: string;
  activityId: number;
  activityCode: string;
  activityName: string;
  activityColor: string;
  startDate: Date;
  endDate?: Date;
  durationMinutes: number;
  workOrderId?: number;
  workOrderCode?: string;
  quantity?: number;
}

interface WorkcenterDowntime {
  id: number;
  workcenterId: number;
  workcenterCode: string;
  workcenterName: string;
  downtimeTypeId: number;
  downtimeTypeCode: string;
  downtimeTypeName: string;
  downtimeColor: string;
  category: string;
  startDate: Date;
  endDate?: Date;
  durationMinutes: number;
  isJustified: boolean;
  observations?: string;
}

interface TimelineFilter {
  startDate: Date;
  endDate: Date;
  lineId?: number;
  areaId?: number;
  workcenterIds?: number[];
  includeInactive?: boolean;
}

interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

interface WorkcenterHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente de barra de progreso con animación
const ProgressBar: React.FC<{
  value: number;
  color: string;
  label: string;
  percentage: string;
}> = ({ value, color, label, percentage }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>
        {percentage}
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  </div>
);

// Componente de timeline para centros de trabajo
const WorkcenterTimeline: React.FC<{
  workcenters: Workcenter[];
  states: WorkcenterState[];
  downtimes: WorkcenterDowntime[];
  filter: TimelineFilter;
}> = ({ workcenters, states, downtimes, filter }) => {
  const [selectedWorkcenter, setSelectedWorkcenter] = useState<Workcenter | null>(null);

  // Calcular métricas OEE
  const calculateOEE = (
    workcenterId: number,
    startDate: Date,
    endDate: Date
  ): OEEMetrics => {
    const workcenterStates = states.filter(s => s.workcenterId === workcenterId);
    const workcenterDowntimes = downtimes.filter(d => d.workcenterId === workcenterId);

    const totalTime = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // minutos
    const productiveTime = workcenterStates
      .filter(s => s.activityCode === 'PRODUCTION')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const downtime = workcenterDowntimes.reduce((sum, d) => sum + d.durationMinutes, 0);

    const availability = totalTime > 0 ? (productiveTime / (totalTime - downtime)) : 0;
    const performance = productiveTime > 0 ? (workcenterStates.reduce((sum, s) => sum + (s.quantity || 0), 0) / productiveTime) : 0;
    const quality = 0.95; // Placeholder - sería calculado de datos reales

    return {
      availability: Math.round(availability * 100) / 100,
      performance: Math.round(performance * 100) / 100,
      quality,
      oee: Math.round((availability * performance * quality) * 100) / 100
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Histórico de Centros de Trabajo
        </h3>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter.startDate.toISOString().split('T')[0]}
              onChange={() => {}} // TODO: Implementar
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter.endDate.toISOString().split('T')[0]}
              onChange={() => {}} // TODO: Implementar
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Centro de Trabajo
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Todos los centros</option>
              {workcenters.map(wc => (
                <option key={wc.id} value={wc.id}>
                  {wc.code} - {wc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de centros de trabajo */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {workcenters.map((workcenter) => {
            const oee = calculateOEE(workcenter.id, filter.startDate, filter.endDate);
            const isSelected = selectedWorkcenter?.id === workcenter.id;

            return (
              <motion.div
                key={workcenter.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWorkcenter(workcenter)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {workcenter.code} - {workcenter.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {workcenter.lineName && `Línea: ${workcenter.lineName}`}
                      {workcenter.areaName && ` • Área: ${workcenter.areaName}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {oee.oee}%
                    </div>
                    <div className="text-xs text-gray-500">OEE</div>
                  </div>
                </div>

                {/* Métricas OEE */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <ProgressBar
                      value={oee.availability * 100}
                      color="#10B981"
                      label="Disponibilidad"
                      percentage={`${Math.round(oee.availability * 100)}%`}
                    />
                  </div>
                  <div>
                    <ProgressBar
                      value={oee.performance * 100}
                      color="#F59E0B"
                      label="Performance"
                      percentage={`${Math.round(oee.performance * 100)}%`}
                    />
                  </div>
                  <div>
                    <ProgressBar
                      value={oee.quality * 100}
                      color="#EF4444"
                      label="Calidad"
                      percentage={`${Math.round(oee.quality * 100)}%`}
                    />
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="flex justify-between text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                  <span>
                    <Clock className="inline w-3 h-3 mr-1" />
                    Estados: {states.filter(s => s.workcenterId === workcenter.id).length}
                  </span>
                  <span>
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Paradas: {downtimes.filter(d => d.workcenterId === workcenter.id).length}
                  </span>
                  <span>
                    <BarChart3 className="inline w-3 h-3 mr-1" />
                    Producción: {states.filter(s => s.workcenterId === workcenter.id).reduce((sum, s) => sum + (s.quantity || 0), 0)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente principal del modal
const WorkcenterHistoryModal: React.FC<WorkcenterHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [workcenters, setWorkcenters] = useState<Workcenter[]>([]);
  const [states, setStates] = useState<WorkcenterState[]>([]);
  const [downtimes, setDowntimes] = useState<WorkcenterDowntime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<TimelineFilter>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    endDate: new Date(),
  });

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, filter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [workcentersRes, statesRes, downtimesRes] = await Promise.all([
        fetch('/api/workcenters/list'),
        fetch('/api/workcenters/history/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filter),
        }),
        fetch('/api/workcenters/history/downtimes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filter),
        }),
      ]);

      if (!workcentersRes.ok || !statesRes.ok || !downtimesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const workcentersData = await workcentersRes.json();
      const statesData = await statesRes.json();
      const downtimesData = await downtimesRes.json();

      setWorkcenters(workcentersData.data || []);
      setStates(statesData.data || []);
      setDowntimes(downtimesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Histórico de Centros de Trabajo
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Análisis de estados, paradas y métricas OEE
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Cargando datos...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error al cargar datos
                        </h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <WorkcenterTimeline
                    workcenters={workcenters}
                    states={states}
                    downtimes={downtimes}
                    filter={filter}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Mostrando datos del {filter.startDate.toLocaleDateString('es-ES')} al {filter.endDate.toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={loadData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WorkcenterHistoryModal;
