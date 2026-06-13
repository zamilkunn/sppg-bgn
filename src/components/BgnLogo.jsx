import React from 'react';
import logoSppg from '../assets/logo-sppg.png';

export default function BgnLogo({ size = 80, className = '' }) {
  return (
    <img
      src={logoSppg}
      width={size}
      height={size}
      alt="Logo SPPG"
      className={className}
    />
  );
}