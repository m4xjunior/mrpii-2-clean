"use client";

import React from 'react';

interface ReactBitsLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'dots' | 'pulse' | 'spin' | 'bars' | 'wave';
}

export const ReactBitsLoader: React.FC<ReactBitsLoaderProps> = ({
  message = "Cargando datos...",
  size = 'medium',
  type = 'dots'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} bg-purple-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} bg-pink-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="loader-wrapper">
            <div className="pulse-ring">
              <div className="ring"></div>
              <div className="ring"></div>
              <div className="ring"></div>
            </div>
            <p>{message}</p>

            <style jsx>{`
              .loader-wrapper {
                display: grid;
                gap: 1rem;
                place-items: center;
                padding: 2rem;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                box-shadow: 0 18px 32px -32px rgba(15, 23, 42, 0.28);
                color: #475569;
              }

              .pulse-ring {
                position: relative;
                width: 64px;
                height: 64px;
              }

              .ring {
                position: absolute;
                inset: 0;
                border-radius: 50%;
                border: 4px solid rgba(14, 165, 233, 0.35);
                animation: pulse 1.5s ease-out infinite;
              }

              .ring:nth-child(2) {
                animation-delay: 0.2s;
              }

              .ring:nth-child(3) {
                animation-delay: 0.4s;
              }

              p {
                margin: 0;
                font-size: 0.95rem;
                font-weight: 500;
              }

              @keyframes pulse {
                0% {
                  transform: scale(0.6);
                  opacity: 1;
                }
                100% {
                  transform: scale(1.3);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        );

      case 'spin':
        return (
          <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin`}></div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-400 to-purple-500 animate-pulse"
                style={{
                  height: `${20 + i * 8}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-blue-400 via-purple-500 to-pink-500 rounded-full animate-bounce"
                style={{
                  height: `${8 + i * 4}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1.5s'
                }}
              ></div>
            ))}
          </div>
        );

      default:
        return renderLoader();
    }
  };

  return (
    <div className="reactbits-loader">
      <div className="loader-container">
        <div className="loader-animation">
          {renderLoader()}
        </div>
        <div className="loader-message">
          <span className="shimmer-text">{message}</span>
        </div>
      </div>

      <style jsx>{`
        .reactbits-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 200px;
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .loader-animation {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-message {
          text-align: center;
        }

        .shimmer-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .shimmer-text::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: textShimmer 2s infinite;
        }

        @keyframes textShimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Hover effects */
        .loader-container:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }

        /* Dark theme adjustments */
        @media (prefers-color-scheme: dark) {
          .loader-container {
            background: rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .shimmer-text {
            color: rgba(255, 255, 255, 0.9);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .reactbits-loader {
            padding: 1rem;
          }

          .loader-container {
            padding: 1.5rem;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReactBitsLoader;
