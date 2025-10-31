"use client";

import React from "react";

type Props = {
  message: string;
  onRetry?: () => void;
};

export const ErrorMessage: React.FC<Props> = ({ message, onRetry }) => {
  return (
    <div className="error-message" role="alert">
      <strong>Ups, algo salió mal</strong>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
};

export default ErrorMessage;
