import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`relative inline-block ${sizes[size]} ${className}`}>
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg blur-sm opacity-75"></div>
      
      {/* Main logo container */}
      <div className="relative bg-black/60 rounded-lg p-3 backdrop-blur-md border border-white/20 shadow-xl">        {/* Hollow text effect */}
        <div className="font-bold tracking-wider relative">
          <span className="text-white drop-shadow-lg">
            &lt;ctrlC&gt;
          </span>
        </div>
        
        {/* Bottom glow line */}
        <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}
