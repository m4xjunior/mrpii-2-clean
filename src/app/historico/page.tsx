"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WorkcenterHistoryModal from '../../../components/WorkcenterHistoryModal';
import SimpleNavbar from '../../../components/SimpleNavbar';
import ReactBitsSidebar from '../../../components/ReactBitsSidebar';

// Componente de título rotativo para el histórico
function RotatingText({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <motion.span
      key={currentTextIndex}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-120%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="text-2rem font-weight-700 text-danger text-shadow-red letter-spacing-4px line-height-1"
    >
      {texts[currentTextIndex]}
    </motion.span>
  );
}

export default function HistoricoPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true); // Siempre abierto en esta página

  const sidebarItems = [
    {
      icon: <i className="fas fa-tachometer-alt"></i>,
      label: "Dashboard",
      href: "/"
    },
    {
      icon: <i className="fas fa-chart-bar"></i>,
      label: "Informes",
      href: "/informes"
    },
    {
      icon: <i className="fas fa-history"></i>,
      label: "Histórico",
      href: "/historico"
    },
    {
      icon: <i className="fas fa-cog"></i>,
      label: "Configurações",
      href: "#",
      onClick: () => {
        // Podríamos abrir un modal de configuración aquí
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <SimpleNavbar />

      {/* Título principal */}
      <div className="main-title-section kh-hero">
        <div className="title-with-logo">
          <img src="/images/logo_transparent.png" alt="KH Logo" className="main-logo" />
          <div className="title-text">
            <div className="title-sistema-container">
              <span className="title-sistema">Sistema</span>
            </div>
            <RotatingText texts={['SCADA', 'KH', '2024', 'HISTÓRICO']} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ReactBitsSidebar
        currentPage="historico"
        items={sidebarItems}
        baseItemSize={50}
        magnification={1.4}
        distance={100}
      />

      {/* Main Content */}
      <div className="pt-16 pl-0 transition-all duration-300">
        <div className="page-content-wrapper">
          <div className="page-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Breadcrumb */}
            <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
              <div className="breadcrumb-title pe-3">
                <i className="bx bx-home-alt me-2"></i>
                Histórico de Centros de Trabajo
              </div>
              <div className="ps-3">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0 p-0">
                    <li className="breadcrumb-item">
                      <Link href="/">
                        <i className="bx bx-home-alt"></i>
                      </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      <i className="fas fa-history me-1"></i>
                      Histórico
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="ms-auto">
                <small className="text-muted">
                  <i className="fas fa-clock me-1"></i>
                  Actualización automática
                </small>
              </div>
            </div>

            {/* Header Section */}
            <div className="kh-header-section mb-6">
              <div className="kh-header-content">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="kh-header-title">
                    <i className="fas fa-chart-line me-3 text-blue-600"></i>
                    Histórico de Centros de Trabajo Agrupado
                  </h1>
                  <p className="kh-header-subtitle">
                    Análisis completo de estados, paradas y métricas OEE por centro de trabajo
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Stats Cards */}
            <motion.div
              className="kh-kpis mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="kh-kpi kh-kpi--blue">
                <div className="kh-kpi__row">
                  <div className="kh-kpi__number">
                    <span className="text-2xl font-bold">85%</span>
                  </div>
                  <div className="kh-kpi__icon"><i className="fas fa-industry"></i></div>
                </div>
                <div className="kh-kpi__row" style={{marginTop: 6}}>
                  <div className="kh-kpi__label">Disponibilidad Global</div>
                  <div className="kh-kpi__trend">+
                    <span className="text-green-600">↑ 2.3%</span>
                  </div>
                </div>
                <div className="kh-kpi__pill"><div className="kh-kpi__fill" style={{width: '85%'}}></div></div>
              </div>

              <div className="kh-kpi kh-kpi--green">
                <div className="kh-kpi__row">
                  <div className="kh-kpi__number">
                    <span className="text-2xl font-bold">92%</span>
                  </div>
                  <div className="kh-kpi__icon"><i className="fas fa-tachometer-alt"></i></div>
                </div>
                <div className="kh-kpi__row" style={{marginTop: 6}}>
                  <div className="kh-kpi__label">Performance</div>
                  <div className="kh-kpi__trend">+
                    <span className="text-green-600">↑ 1.8%</span>
                  </div>
                </div>
                <div className="kh-kpi__pill"><div className="kh-kpi__fill" style={{width: '92%'}}></div></div>
              </div>

              <div className="kh-kpi kh-kpi--danger">
                <div className="kh-kpi__row">
                  <div className="kh-kpi__number">
                    <span className="text-2xl font-bold">96%</span>
                  </div>
                  <div className="kh-kpi__icon"><i className="fas fa-check-circle"></i></div>
                </div>
                <div className="kh-kpi__row" style={{marginTop: 6}}>
                  <div className="kh-kpi__label">Calidad</div>
                  <div className="kh-kpi__trend">+
                    <span className="text-green-600">↑ 0.5%</span>
                  </div>
                </div>
                <div className="kh-kpi__pill"><div className="kh-kpi__fill" style={{width: '96%'}}></div></div>
              </div>

              <div className="kh-kpi kh-kpi--primary">
                <div className="kh-kpi__row">
                  <div className="kh-kpi__number">
                    <span className="text-2xl font-bold">79%</span>
                  </div>
                  <div className="kh-kpi__icon"><i className="fas fa-chart-pie"></i></div>
                </div>
                <div className="kh-kpi__row" style={{marginTop: 6}}>
                  <div className="kh-kpi__label">OEE Global</div>
                  <div className="kh-kpi__trend">+
                    <span className="text-green-600">↑ 1.2%</span>
                  </div>
                </div>
                <div className="kh-kpi__pill"><div className="kh-kpi__fill" style={{width: '79%'}}></div></div>
              </div>
            </motion.div>

            {/* Modal Content - Always Open */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <WorkcenterHistoryModal
                isOpen={isModalOpen}
                onClose={() => {
                  // No cerrar en esta página, pero permitir navegación
                  router.push('/');
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p className="mb-0">Sistema SCADA MRPII - © 2024 Grupo KH</p>
      </div>

      <style jsx>{`
        .main-title-section {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
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
          color: #000000;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 2px;
          line-height: 1;
        }

        .text-2rem {
          font-size: 2rem;
        }

        .font-weight-700 {
          font-weight: 700;
        }

        .text-danger {
          color: #dc3545;
        }

        .text-shadow-red {
          text-shadow: 2px 2px 4px rgba(220, 53, 69, 0.3);
        }

        .letter-spacing-4px {
          letter-spacing: 4px;
        }

        .line-height-1 {
          line-height: 1;
        }

        .kh-header-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .kh-header-content {
          text-align: center;
          color: white;
        }

        .kh-header-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .kh-header-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .kh-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .kh-kpi {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .kh-kpi:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .kh-kpi__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .kh-kpi__number {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
        }

        .kh-kpi__icon {
          font-size: 2rem;
          opacity: 0.7;
        }

        .kh-kpi__label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .kh-kpi__trend {
          font-size: 0.8rem;
          color: #666;
        }

        .kh-kpi__pill {
          width: 100%;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .kh-kpi__fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 1s ease;
        }

        .kh-kpi--blue .kh-kpi__fill {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .kh-kpi--green .kh-kpi__fill {
          background: linear-gradient(90deg, #10B981 0%, #059669 100%);
        }

        .kh-kpi--danger .kh-kpi__fill {
          background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
        }

        .kh-kpi--primary .kh-kpi__fill {
          background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
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

          .kh-header-title {
            font-size: 2rem;
          }

          .kh-kpis {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
