"use client";

import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}: ModalProps) {
  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Impedir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fechar modal ao clicar no backdrop
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-container ${sizeClasses[size]}`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="modal-header">
              {title && <h3 className="modal-title">{title}</h3>}
              {showCloseButton && (
                <button
                  className="modal-close"
                  onClick={onClose}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="modal-body">
            {children}
          </div>
        </div>
    </div>
  );
}

// Componente para lista de máquinas
interface MachineCardProps {
  name: string;
  status?: 'running' | 'stopped' | 'maintenance' | 'inactive';
  onClick?: () => void;
}

export function MachineCard({ name, status = 'inactive', onClick }: MachineCardProps) {
  const statusColors = {
    running: 'status-running',
    stopped: 'status-stopped',
    maintenance: 'status-maintenance',
    inactive: 'status-inactive'
  };

  return (
    <div
      className={`machine-card-item ${statusColors[status]} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="machine-card-content">
        <div className="machine-name">{name}</div>
        <div className="machine-status">
          <span className={`status-dot ${status}`}></span>
          <span className="status-text">
            {status === 'running' && 'En funcionamiento'}
            {status === 'stopped' && 'Detenida'}
            {status === 'maintenance' && 'En mantenimiento'}
            {status === 'inactive' && 'Inactiva'}
          </span>
        </div>
      </div>
    </div>
  );
}
