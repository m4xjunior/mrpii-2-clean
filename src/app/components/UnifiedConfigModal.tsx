"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TitleConfig {
  sistema: string;
  scada: string[];
}

interface UnifiedConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleConfig: TitleConfig;
  onSave: (config: TitleConfig) => void;
}

const defaultConfig: TitleConfig = {
  sistema: 'Sistema',
  scada: ['SCADA', 'KH', '2024']
};

export default function UnifiedConfigModal({
  isOpen,
  onClose,
  titleConfig,
  onSave
}: UnifiedConfigModalProps) {
  const [tempConfig, setTempConfig] = useState<TitleConfig>(titleConfig);

  useEffect(() => {
    if (isOpen) {
      setTempConfig(titleConfig);
    }
  }, [isOpen, titleConfig]);

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  const handleReset = () => {
    setTempConfig(defaultConfig);
  };

  const addScadaText = () => {
    if (tempConfig.scada.length < 5) {
      setTempConfig({
        ...tempConfig,
        scada: [...tempConfig.scada, '']
      });
    }
  };

  const updateScadaText = (index: number, value: string) => {
    const newScada = [...tempConfig.scada];
    newScada[index] = value;
    setTempConfig({
      ...tempConfig,
      scada: newScada
    });
  };

  const removeScadaText = (index: number) => {
    if (tempConfig.scada.length > 1) {
      const newScada = tempConfig.scada.filter((_, i) => i !== index);
      setTempConfig({
        ...tempConfig,
        scada: newScada
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="unified-config-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="unified-config-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
          >
            {/* Header */}
            <div className="unified-config-header">
              <div className="unified-config-title">
                <i className="fas fa-cog"></i>
                <h3>Configurações Unificadas</h3>
              </div>
              <button className="unified-config-close" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="unified-config-body">
              {/* Sistema Section */}
              <div className="config-section">
                <label className="config-label">
                  <i className="fas fa-tag"></i>
                  Texto "Sistema"
                </label>
                <input
                  type="text"
                  className="config-input"
                  value={tempConfig.sistema}
                  onChange={(e) => setTempConfig({...tempConfig, sistema: e.target.value})}
                  placeholder="Digite o texto do sistema..."
                />
              </div>

              {/* SCADA Texts Section */}
              <div className="config-section">
                <label className="config-label">
                  <i className="fas fa-exchange-alt"></i>
                  Textos Rotativos
                </label>
                <div className="scada-texts-list">
                  {tempConfig.scada.map((text, index) => (
                    <div key={index} className="scada-text-item">
                      <input
                        type="text"
                        className="config-input scada-input"
                        value={text}
                        onChange={(e) => updateScadaText(index, e.target.value)}
                        placeholder={`Texto ${index + 1}...`}
                      />
                      {tempConfig.scada.length > 1 && (
                        <button
                          className="remove-scada-btn"
                          onClick={() => removeScadaText(index)}
                          title="Remover texto"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {tempConfig.scada.length < 5 && (
                  <button className="add-scada-btn" onClick={addScadaText}>
                    <i className="fas fa-plus"></i>
                    Adicionar Texto
                  </button>
                )}
              </div>

              {/* Preview Section */}
              <div className="config-preview">
                <h4><i className="fas fa-eye"></i>Preview</h4>
                <div className="preview-container">
                  <div className="preview-title">
                    <img src="/images/logo_transparent.png" alt="KH Logo" className="preview-logo" />
                    <div className="preview-text">
                      <span className="preview-sistema">{tempConfig.sistema}</span>
                      <span className="preview-scada">
                        {tempConfig.scada.length > 0 ? tempConfig.scada[0] : 'SCADA'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="unified-config-footer">
              <button className="config-btn config-btn-secondary" onClick={handleReset}>
                <i className="fas fa-undo"></i>
                Resetar
              </button>
              <div className="config-btn-group">
                <button className="config-btn config-btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button className="config-btn config-btn-primary" onClick={handleSave}>
                  <i className="fas fa-save"></i>
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
