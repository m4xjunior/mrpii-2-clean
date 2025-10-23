"use client";

import React from 'react';
import Link from 'next/link';
import { InformesDashboard } from './components/InformesDashboard';
import '../factory-floor.css';

export default function InformesPage() {
  return (
    <div className="informes-page">
      {/* Botão de voltar */}
      <Link href="/" className="back-button">
        <i className="fas fa-arrow-left"></i>
        <span>Voltar</span>
      </Link>

      {/* Título principal com logo (mesmo estilo da dashboard) */}
      <div className="main-title-section kh-hero">
        <div className="title-with-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_transparent.png" alt="KH Logo" className="main-logo" />
          <div className="title-text">
            <div className="title-sistema-container">
              <span className="title-sistema">Informes de</span>
            </div>
            <span className="title-scada-static">Producción</span>
          </div>
        </div>
      </div>

      {/* Container principal */}
      <main className="informes-container">
        <InformesDashboard />
      </main>

      {/* Footer */}
      <footer className="informes-footer">
        <p>Sistema de Monitorización de Producción - MAPEX © 2024</p>
      </footer>

      <style jsx>{`
        .back-button {
          position: fixed;
          top: 1.5rem;
          left: 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9375rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          cursor: pointer;
        }

        .back-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }

        .back-button i {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .back-button:hover i {
          transform: translateX(-3px);
        }

        .main-title-section {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem 0;
          background: transparent;
          border-radius: 0;
          box-shadow: none;
        }

        .title-with-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .main-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3));
          animation: logo-pulse 3s ease-in-out infinite;
        }

        .title-text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-sistema-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .title-sistema {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          letter-spacing: 2px;
          line-height: 1;
        }

        .title-scada-static {
          font-size: 2rem;
          font-weight: 700;
          color: #dc3545;
          text-shadow: 2px 2px 4px rgba(220, 53, 69, 0.3);
          letter-spacing: 4px;
          line-height: 1;
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .back-button {
            top: 1rem;
            left: 1rem;
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
          }

          .main-title-section {
            padding: 1.5rem 0;
            margin-bottom: 1.5rem;
          }

          .title-with-logo {
            gap: 1rem;
          }

          .main-logo {
            width: 60px;
            height: 60px;
          }

          .title-sistema {
            font-size: 2rem;
          }

          .title-scada-static {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 480px) {
          .back-button {
            top: 0.75rem;
            left: 0.75rem;
            padding: 0.5rem 0.875rem;
            font-size: 0.8125rem;
          }

          .back-button span {
            display: none;
          }

          .back-button i {
            font-size: 1.125rem;
          }

          .main-title-section {
            padding: 1rem 0;
          }

          .title-with-logo {
            flex-direction: column;
            gap: 0.5rem;
          }

          .title-sistema {
            font-size: 1.8rem;
          }

          .title-scada-static {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
