import React from 'react';

interface BloomVerseLogoProps {
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showPingDot?: boolean;
}

export const BloomVerseLogo: React.FC<BloomVerseLogoProps> = ({
  accentColor = '#38bdf8',
  size = 'md',
  showPingDot = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group select-none font-hud font-black tracking-tighter ${sizeClasses[size]}`}
      style={{
        background: 'linear-gradient(135deg, #070d1a 0%, #0d1527 50%, #050914 100%)',
        border: `1.5px solid ${accentColor}aa`,
        boxShadow: `0 0 14px ${accentColor}40, inset 0 0 10px ${accentColor}25`,
      }}
    >
      {/* Tech Grid Background Lines */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Futuristic BV Monogram Text */}
      <div className="relative z-10 flex items-center justify-center font-hud">
        <span
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] font-black italic tracking-tighter"
          style={{ letterSpacing: '-0.08em' }}
        >
          B
        </span>
        <span
          className="font-black italic tracking-tighter"
          style={{
            color: accentColor,
            textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}88`,
            letterSpacing: '-0.05em',
            marginLeft: '-1px',
          }}
        >
          V
        </span>
      </div>

      {/* Micro Celestial Cross Star in Corner */}
      <div
        className="absolute top-1 right-1 w-1 h-1 rounded-full opacity-90"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 0 6px ${accentColor}`,
        }}
      />

      {/* Active Hunter System Ping Dot */}
      {showPingDot && (
        <>
          <div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />
        </>
      )}
    </div>
  );
};
