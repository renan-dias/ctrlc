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
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-lg p-3 backdrop-blur-sm border border-white/20">
        {/* Hollow text effect */}
        <div className="font-bold tracking-wider relative">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100 drop-shadow-lg">
            &lt;ctrlC&gt;
          </span>
          
          {/* Inner glow */}
          <div className="absolute inset-0 font-bold tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 opacity-60">
              &lt;ctrlC&gt;
            </span>
          </div>
        </div>
        
        {/* Bottom glow line */}
        <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}
