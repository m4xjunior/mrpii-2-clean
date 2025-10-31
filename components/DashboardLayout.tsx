'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MachineStatus } from '../types/machine'; // Ajuste o caminho conforme necessário

interface DashboardLayoutProps {
  children: React.ReactNode;
  machines: MachineStatus[];
  onMachineSelect: (machineCode: string) => void;
  selectedMachineCode: string | null;
  lastUpdate: string;
}

// Custom hook para manejar el tema
function useThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    console.log('🎨 useThemeSwitcher: Inicializando...');

    // Cargar tema guardado en localStorage
    const savedTheme = localStorage.getItem('scada-theme') || 'light';
    setCurrentTheme(savedTheme);

    // Event listener para cambios de tema desde el script global
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail.theme;
      setCurrentTheme(newTheme);
      console.log('🔄 useThemeSwitcher: Tema cambiado a:', newTheme);
    };

    document.addEventListener('themeChange' as any, handleThemeChange);

    return () => {
      document.removeEventListener('themeChange' as any, handleThemeChange);
    };
  }, []);

  return { currentTheme };
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  machines,
  onMachineSelect,
  selectedMachineCode,
  lastUpdate
}) => {
  const { currentTheme } = useThemeSwitcher();

  // Estado para controlar o layout da sidebar
  const [sidebarToggled, setSidebarToggled] = useState(false);

  useEffect(() => {
    console.log('🏠 DashboardLayout: Tema actual:', currentTheme);
  }, [currentTheme]);

  // Listener para eventos da sidebar
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarToggled(event.detail.isMinimized);
      console.log('📏 DashboardLayout: Sidebar toggle:', event.detail.isMinimized ? 'minimizada' : 'expandida');
    };

    document.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => document.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  const alerts = machines
    .map(m => {
      if (m.status === 'PARADA') {
        return {
          type: 'PARADA',
          machine: `${m.machine.desc_maquina} -${m.machine.Cod_maquina}`,
          code: m.machine.Cod_maquina,
          message: m.downtime || 'Parada detectada',
          time: new Date().toLocaleTimeString('es-ES')
        };
      }
      if ((m.production?.nok || 0) > 0) {
        return {
          type: 'CALIDAD',
          machine: `${m.machine.desc_maquina} -${m.machine.Cod_maquina}`,
          code: m.machine.Cod_maquina,
          message: `Piezas NOK: ${m.production.nok}`,
          time: new Date().toLocaleTimeString('es-ES')
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{ type: string; machine: string; code: string; message: string; time: string }>;

  const getMachineTypeIcon = (machineCode: string) => {
    if (machineCode.includes('DOBL')) return 'fas fa-industry';
    if (machineCode.includes('SOLD')) return 'fas fa-fire';
    if (machineCode.includes('TROQ')) return 'fas fa-cut';
    if (machineCode.includes('TERM')) return 'fas fa-compress-arrows-alt';
    return 'fas fa-cog';
  };

  return (
    <div className={`wrapper ${sidebarToggled ? 'toggled' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar-wrapper" data-simplebar="true">
        <div className="sidebar-header">
          <div className="">
            <img src="/images/logo_transparent.png" className="logo-icon-2" alt="KH Know How" />
          </div>
          <div>
            <h4 className="logo-text">Sistema SCADA</h4>
          </div>
          <a href="javascript:;" className="toggle-btn ms-auto">
            <i className="bx bx-menu"></i>
          </a>
        </div>
        <ul className="metismenu" id="menu">
          <li>
            <Link href="/" className="has-arrow">
              <div className="parent-icon icon-color-1">
                <i className="bx bx-home-alt"></i>
              </div>
              <div className="menu-title">Panel de Control</div>
            </Link>
            <ul>
              <li><a href="#"><i className="bx bx-right-arrow-alt"></i>Máquinas</a></li>
              <li><a href="#"><i className="bx bx-right-arrow-alt"></i>Producción</a></li>
              <li><a href="#"><i className="bx bx-right-arrow-alt"></i>OEE</a></li>
            </ul>
          </li>
          <li className="menu-label">Monitoreo</li>
          <li>
            <a href="/informes">
              <div className="parent-icon icon-color-2">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="menu-title">Informes</div>
            </a>
          </li>
          <li>
            <a href="javascript:;">
              <div className="parent-icon icon-color-3">
                <i className="fas fa-cogs"></i>
              </div>
              <div className="menu-title">Configuración</div>
            </a>
          </li>
          <li className="menu-label">Máquinas</li>
          {machines.map(machine => (
            <li key={machine.machine.Cod_maquina}>
              <a
                href="#"
                className={selectedMachineCode === machine.machine.Cod_maquina ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  onMachineSelect(machine.machine.Cod_maquina);
                }}
              >
                <div className="parent-icon icon-color-4">
                  <i className={`${getMachineTypeIcon(machine.machine.Cod_maquina)}`}></i>
                </div>
                <div className="menu-title">{machine.machine.desc_maquina}</div>
              </a>
            </li>
          ))}
        </ul>
      </div>


      {/* Main Content */}
      <div className="page-wrapper">
        <div className="page-content-wrapper">
          <div className="page-content">
            <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
              <div className="breadcrumb-title pe-3">Informes</div>
              <div className="ps-3">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0 p-0">
                    <li className="breadcrumb-item">
                      <a href="javascript:;"><i className="bx bx-home-alt"></i></a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Informes por Turno
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="ms-auto">
                <small className="text-muted">
                  <i className="fas fa-clock me-1"></i>
                  Última Actualización: {lastUpdate}
                </small>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p className="mb-0">Sistema SCADA MRPII - © 2024 Grupo KH</p>
      </div>

      {/* Theme Customizer */}
      <div className="switcher-body">
        <button className="btn btn-primary btn-switcher shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling">
          <i className="bx bx-cog bx-spin"></i>
        </button>
        <div className="offcanvas offcanvas-end shadow border-start-0 p-2" data-bs-scroll="true" data-bs-backdrop="false" tabIndex={-1} id="offcanvasScrolling">
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id="offcanvasScrollingLabel">Personalizador de Tema</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            <h6 className="mb-0">Variación de Tema</h6>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="lightmode" value="option1" defaultChecked />
              <label className="form-check-label" htmlFor="lightmode">Claro</label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="darkmode" value="option2" />
              <label className="form-check-label" htmlFor="darkmode">Oscuro</label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="darksidebar" value="option3" />
              <label className="form-check-label" htmlFor="darksidebar">Barra Lateral Oscura</label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="ColorLessIcons" value="option4" />
              <label className="form-check-label" htmlFor="ColorLessIcons">Iconos sin Color</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;