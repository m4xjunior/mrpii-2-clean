"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ReactBitsSidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  className?: string;
  onClick?: () => void;
}

interface ReactBitsSidebarProps {
  items: ReactBitsSidebarItem[];
  currentPage?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  className?: string;
  showToggleButton?: boolean;
  defaultCollapsed?: boolean;
}

export default function ReactBitsSidebar({
  items,
  currentPage = "dashboard",
  distance = 80,
  panelHeight = 600,
  baseItemSize = 50,
  dockHeight = 80,
  magnification = 1.5,
  className = "",
  showToggleButton = true,
  defaultCollapsed = false
}: ReactBitsSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const getItemSize = (index: number) => {
    if (hoveredIndex === null) return baseItemSize;

    const distanceFromHovered = Math.abs(index - hoveredIndex);
    const scale = Math.max(1, magnification - distanceFromHovered * 0.2);
    return baseItemSize * scale;
  };

  const getItemStyle = (index: number) => {
    const size = getItemSize(index);
    const isActive = items[index].href === `/${currentPage}` || 
                   (currentPage === "dashboard" && items[index].href === "/");
    const isHovered = hoveredIndex === index;

    return {
      width: size,
      height: size,
      transform: `translateY(${isHovered ? -10 : 0}px)`,
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    };
  };

  return (
    <motion.div
      className={`reactbits-sidebar ${className}`}
      style={{
        position: "fixed",
        left: 20,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1000,
      }}
      animate={{
        width: isCollapsed ? 60 : "auto",
        opacity: isCollapsed ? 0.8 : 1
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Botão de Toggle */}
      {showToggleButton && (
        <motion.button
          onClick={toggleSidebar}
          className="sidebar-toggle-btn"
          style={{
            position: "absolute",
            top: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.9)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            color: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1001,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
             style={{ fontSize: '12px' }}></i>
        </motion.button>
      )}

      <motion.div
        className="sidebar-dock"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isCollapsed ? 0 : 1,
          scale: isCollapsed ? 0.8 : 1,
          y: isCollapsed ? 20 : 0
        }}
        transition={{ duration: 0.3, delay: isCollapsed ? 0 : 0.2 }}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          borderRadius: "25px",
          padding: isCollapsed ? "10px" : "20px 15px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          alignItems: "center",
          pointerEvents: isCollapsed ? "none" : "auto",
        }}
      >
        {items.map((item, index) => {
          const size = getItemSize(index);
          const isActive = item.href === `/${currentPage}` || 
                         (currentPage === "dashboard" && item.href === "/");
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={index}
              className={`dock-item ${item.className || ""} ${isActive ? "active" : ""}`}
              style={getItemStyle(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="dock-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: isActive
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: isActive ? "2px solid rgba(255, 255, 255, 0.3)" : "none",
                    color: "#dc3545",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    boxShadow: isActive
                      ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                      : "none",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${size * 0.4}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Tooltip */}
                  <motion.div
                    className="dock-tooltip"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                      x: hoveredIndex === index ? 0 : -10
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      left: "120%",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 1001,
                    }}
                  >
                    {item.label}
                    <div
                      style={{
                        position: "absolute",
                        right: "100%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "4px solid transparent",
                        borderBottom: "4px solid transparent",
                        borderRight: "4px solid rgba(0, 0, 0, 0.8)",
                      }}
                    />
                  </motion.div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="dock-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: isActive
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: isActive ? "2px solid rgba(255, 255, 255, 0.3)" : "none",
                    color: "#dc3545",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    boxShadow: isActive
                      ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                      : "none",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${size * 0.4}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Tooltip */}
                  <motion.div
                    className="dock-tooltip"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                      x: hoveredIndex === index ? 0 : -10
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      left: "120%",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 1001,
                    }}
                  >
                    {item.label}
                    <div
                      style={{
                        position: "absolute",
                        right: "100%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "4px solid transparent",
                        borderBottom: "4px solid transparent",
                        borderRight: "4px solid rgba(0, 0, 0, 0.8)",
                      }}
                    />
                  </motion.div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <style jsx>{`
        .reactbits-sidebar {
          pointer-events: auto;
        }

        .dock-item {
          position: relative;
          cursor: pointer;
        }

        .dock-link {
          text-decoration: none;
          color: inherit;
        }

        .dock-item.active .dock-link {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
        }

        .dock-tooltip {
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .reactbits-sidebar {
            left: 10px;
            transform: translateY(-50%) scale(0.9);
          }
        }
        .sidebar-toggle-btn {
          transition: all 0.3s ease;
        }

        .sidebar-toggle-btn:hover {
          background: rgba(255, 255, 255, 1) !important;
          transform: translateX(-50%) scale(1.05) !important;
        }

        .sidebar-toggle-btn:active {
          transform: translateX(-50%) scale(0.95) !important;
        }

        .sidebar-dock {
          transition: all 0.3s ease;
        }
      `}</style>
    </motion.div>
  );
}