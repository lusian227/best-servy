import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  lightMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  lightMode = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 72, text: 'text-4xl', sub: 'text-sm' },
  };

  const { icon: iconSize, text: textSizeClass, sub: subSizeClass } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Hexagonal Shield + Gear + Building Icon SVG */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: iconSize, height: iconSize }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="logoGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E7D32" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
            <linearGradient id="logoDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="towerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>

          {/* Hexagon Border Frame */}
          <polygon
            points="100,10 178,55 178,145 100,190 22,145 22,55"
            stroke="url(#logoGreenGrad)"
            strokeWidth="12"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Architectural Skyscrapers background */}
          <path
            d="M55,140 L55,75 L85,55 L85,140 Z"
            fill="url(#towerGrad)"
          />
          <path
            d="M85,140 L85,25 L125,45 L125,140 Z"
            fill="url(#logoGreenGrad)"
          />
          <path
            d="M125,140 L125,60 L150,80 L150,140 Z"
            fill="url(#towerGrad)"
          />

          {/* Stencil 'E' cutout line on central green building */}
          <path
            d="M93,48 H117 M93,68 H112 M93,88 H117 M93,108 H112"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Engineering Gear at Base */}
          <g fill="url(#logoDarkGrad)">
            {/* Gear Teeth Outer Ring */}
            <circle cx="100" cy="155" r="32" stroke="url(#logoGreenGrad)" strokeWidth="6" fill="#1E293B" />
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + Math.cos(rad) * 30;
              const y1 = 155 + Math.sin(rad) * 30;
              const x2 = 100 + Math.cos(rad) * 38;
              const y2 = 155 + Math.sin(rad) * 38;
              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#logoGreenGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Gear Inner Hole */}
            <circle cx="100" cy="155" r="14" fill="#0F172A" stroke="url(#logoGreenGrad)" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight leading-none ${textSizeClass} ${lightMode ? 'text-slate-900' : 'text-white'}`}>
            Engineer<span className="text-emerald-500">OS</span>
          </div>
          {variant === 'full' && (
            <div className={`font-semibold tracking-wider uppercase mt-0.5 ${subSizeClass} ${lightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
              The Engineering Platform
            </div>
          )}
        </div>
      )}
    </div>
  );
};
