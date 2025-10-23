"use client";

import { useState } from 'react';

export interface DateFilters {
  startDate: Date | null;
  endDate: Date | null;
}

export function useDateFilters(initialStartDate?: Date, initialEndDate?: Date) {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);

  const updateStartDate = (date: Date) => {
    setStartDate(date);
    // Se a data de fim for anterior à nova data de início, ajustar
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  const updateEndDate = (date: Date) => {
    setEndDate(date);
    // Se a data de início for posterior à nova data de fim, ajustar
    if (startDate && date < startDate) {
      setStartDate(null);
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const hasActiveFilters = startDate !== null || endDate !== null;

  const getFormattedDateRange = () => {
    if (!startDate && !endDate) return null;

    const start = startDate ? startDate.toLocaleDateString('es-ES') : '...';
    const end = endDate ? endDate.toLocaleDateString('es-ES') : '...';

    return `${start} - ${end}`;
  };

  return {
    startDate,
    endDate,
    updateStartDate,
    updateEndDate,
    clearFilters,
    hasActiveFilters,
    getFormattedDateRange,
    filters: { startDate, endDate }
  };
}
