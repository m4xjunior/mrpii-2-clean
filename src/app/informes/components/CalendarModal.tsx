"use client";

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Modal } from './Modal';
import 'react-calendar/dist/Calendar.css';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function CalendarModal({
  isOpen,
  onClose,
  title,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate
}: CalendarModalProps) {
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate);

  const handleDateChange = (value: any, event?: any) => {
    setTempDate(value);
  };

  const handleConfirm = () => {
    if (tempDate) {
      onDateSelect(tempDate);
      onClose();
    }
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="md"
    >
      <div className="calendar-modal-content">
        {/* Calendário futurista */}
        <div className="calendar-container">
          <Calendar
            value={tempDate}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            className="futuristic-calendar"
            locale="es-ES"
            showNeighboringMonth={false}
            next2Label={null}
            prev2Label={null}
            navigationLabel={({ date, label, locale, view }) => {
              const year = date.getFullYear();
              const month = date.toLocaleString(locale, { month: 'long' });
              return `${month} ${year}`;
            }}
          />
        </div>

        {/* Data selecionada */}
        {tempDate && (
          <div className="selected-date-display">
            <div className="selected-date-label">Fecha seleccionada:</div>
            <div className="selected-date-value">
              {tempDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="calendar-actions">
          <button
            onClick={handleCancel}
            className="calendar-btn calendar-btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tempDate}
            className="calendar-btn calendar-btn-primary"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
