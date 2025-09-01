
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};
