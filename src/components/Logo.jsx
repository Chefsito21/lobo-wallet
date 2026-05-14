import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
      fill="none"
    >
      {/* Fondo del escudo/cara del lobo (Tono oscuro) */}
      <path 
        d="M50 95 L10 35 L25 10 L50 20 L75 10 L90 35 Z" 
        className="fill-zinc-900 stroke-zinc-800"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Detalles esmeralda (Ojos y contorno interno) */}
      <path 
        d="M50 75 L25 35 L40 25 L50 40 L60 25 L75 35 Z" 
        className="fill-emerald-500/20 stroke-emerald-500"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Triángulo central Cyan (Nariz/Foco) */}
      <path 
        d="M45 65 L55 65 L50 75 Z" 
        className="fill-cyan-400"
      />
    </svg>
  );
};

export default Logo;