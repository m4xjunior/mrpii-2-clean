"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Item = { id: string; label: string; onClick: () => void; icon?: string };

export default function GooeyNav({
  items,
  mainLabel = "⋯",
}: { items: Item[]; mainLabel?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="gooey-wrap">
      {/* filtro gooey */}
      <svg width="0" height="0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="gooey" style={{ filter: "url(#goo)" }}>
        <button
          className="gooey-main"
          onClick={() => setOpen((value) => !value)}
          aria-label="menu"
          type="button"
        >
          {mainLabel}
        </button>

        <AnimatePresence>
          {open &&
            items.map((it, index) => (
              <motion.button
                key={it.id}
                className="gooey-item"
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                type="button"
                initial={{ y: 0, opacity: 0, scale: 0.6 }}
                animate={{ y: -(index + 1) * 56, opacity: 1, scale: 1 }}
                exit={{ y: 0, opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
              >
                {it.icon && <i className={it.icon} style={{ marginRight: '8px' }}></i>}
                {it.label}
              </motion.button>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
