"use client";

import React from "react";

type Props = {
  message?: string;
};

export const LoadingSpinner: React.FC<Props> = ({ message }) => {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <p>{message ?? "Cargando..."}</p>
    </div>
  );
};

export default LoadingSpinner;
