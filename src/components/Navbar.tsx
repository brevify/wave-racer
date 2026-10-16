import React from 'react';

interface NavbarProps {
  onOpenSubscription: () => void;
  onOpenDiagnostics: () => void;
  onScrollToSection: (sectionId: string) => void;
  hasErrorsOrSlow: boolean;
  isSubscribed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubscription,
  onOpenDiagnostics,
  onScrollToSection,
  hasErrorsOrSlow,
  isSubscribed = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <button
          onClick={() => onScrollToSection('hero')}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-cyan-400">🌊</span>
          <span>WaveReady</span>
        </button>

        {/* Zone 2: Concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => onScrollToSection('map-section')}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Singapore Map
          </button>
          <button
            onClick={() => onScrollToSection('beaches-list')}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Beach Spots
          </button>
          <button
            onClick={() => onScrollToSection('tides-section')}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Coastal Tides
          </button>
          <button
            onClick={() => onScrollToSection('partners')}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Boat & Gear Partners
          </button>
          <button
            onClick={onOpenDiagnostics}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              hasErrorsOrSlow
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Live Data Status</span>
            {hasErrorsOrSlow && (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSubscription}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {isSubscribed ? 'Pro Member' : '1 Month Free Trial'}
          </button>
        </div>
      </div>
    </header>
  );
};
