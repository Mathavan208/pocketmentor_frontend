import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Book icon with circuit pattern */}
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 transform hover:scale-110"
        >
          {/* Book cover */}
          <rect x="8" y="10" width="32" height="28" rx="2" fill="url(#bookGradient)" />
          
          {/* Circuit pattern */}
          <path d="M16 20H20M20 20V16M20 20H24M24 20V24M24 20H28M28 20V16M28 20H32" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" />
          
          <path d="M16 28H20M20 28V32M20 28H24M24 28V24M24 28H28M28 28V32M28 28H32" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" />
          
          {/* Book spine */}
          <rect x="8" y="10" width="4" height="28" rx="2" fill="url(#spineGradient)" />
          
          {/* Book pages */}
          <rect x="12" y="14" width="24" height="20" rx="1" fill="white" opacity="0.9" />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a2a80" />
              <stop offset="100%" stopColor="#3b38a0" />
            </linearGradient>
            <linearGradient id="spineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a2a80" />
              <stop offset="100%" stopColor="#1a2a80" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg opacity-50 blur-sm bg-gradient-to-r from-deep-blue to-purple-blue -z-10"></div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span className="block">Pocket</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-light-purple to-light-blue">
            Mentor
          </span>
        </h1>
      </div>
    </div>
  );
};

export default Logo;