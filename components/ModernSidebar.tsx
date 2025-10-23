"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "./ModernSidebar.css";

interface ModernSidebarProps {
  currentPage?: string;
}

export default function ModernSidebar({ currentPage = "dashboard" }: ModernSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const emitSidebarToggle = useCallback((nextState: boolean) => {
    const event = new CustomEvent("sidebarToggle", {
      detail: { isMinimized: nextState },
    });
    document.dispatchEvent(event);
  }, []);

  const toggleSidebar = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    emitSidebarToggle(newState);
  };

  useEffect(() => {
    const handleResponsiveSidebar = () => {
      const shouldMinimize = window.innerWidth < 1280;
      setIsMinimized((prev) => {
        if (prev === shouldMinimize) {
          return prev;
        }
        emitSidebarToggle(shouldMinimize);
        return shouldMinimize;
      });
    };

    handleResponsiveSidebar();
    window.addEventListener("resize", handleResponsiveSidebar);
    return () => window.removeEventListener("resize", handleResponsiveSidebar);
  }, [emitSidebarToggle]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      href: "/"
    },
    {
      id: "informes",
      label: "Informes",
      icon: "fas fa-chart-bar",
      href: "/informes"
    },
    {
      id: "historico",
      label: "Histórico",
      icon: "fas fa-history",
      href: "/historico"
    },
    {
      id: "configuracoes",
      label: "Configurações",
      icon: "fas fa-cog",
      href: "/configuracoes"
    }
  ];

  return (
    <div className={`modern-sidebar ${isMinimized ? "minimized" : ""}`}>
      {/* Header do Sidebar */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="/images/logo_transparent.png"
            alt="KH Logo"
            className="logo-image"
          />
          {!isMinimized && (
            <div className="logo-text">
              <span className="system-text">Sistema</span>
              <span className="scada-text">SCADA</span>
            </div>
          )}
        </div>
        
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={isMinimized ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <i className={`fas ${isMinimized ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link
                href={item.href}
                className={`nav-link ${currentPage === item.id ? "active" : ""}`}
              >
                <i className={item.icon}></i>
                {!isMinimized && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer do Sidebar */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          {!isMinimized && (
            <div className="user-details">
              <span className="user-name">Operador</span>
              <span className="user-role">Usuário</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
