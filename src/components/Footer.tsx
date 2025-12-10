/* eslint-disable @next/next/no-img-element */
export function Footer() {
  return (
    <footer className="w-full bg-gray-800 border-t border-gray-700 py-4 px-6 mt-auto">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white text-sm sm:text-base">
          <span>Built with</span>
          <div className="flex items-center gap-3">
            <a
              href="https://www.orchids.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/orchids-logo.svg" 
                alt="Orchids" 
                height={24}
                className="h-6 w-auto brightness-0 invert"
              />
            </a>
            <span className="text-white">•</span>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <svg width="24" height="24" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                  <circle cx="90" cy="90" r="90" fill="black"/>
                </mask>
                <g mask="url(#mask0)">
                  <circle cx="90" cy="90" r="87" fill="white" stroke="white" strokeWidth="6"/>
                  <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear)"/>
                  <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear)"/>
                </g>
                <defs>
                  <linearGradient id="paint0_linear" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1f2937"/>
                    <stop offset="1" stopColor="#1f2937" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1f2937"/>
                    <stop offset="1" stopColor="#1f2937" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-medium">Next.js</span>
            </a>
            <span className="text-white">•</span>
            <a
              href="https://www.perplexity.ai/api-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/perplexity-logo.svg" 
                alt="Perplexity" 
                width={80} 
                height={24}
                className="h-6 w-auto brightness-0 invert"
              />
            </a>
          </div>
        </div>
        
        <a
          href="https://www.akileshjayakumar.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm sm:text-base text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
        >
          <span>akileshjayakumar.com</span>
        </a>
      </div>
      
      <div className="max-w-2xl mx-auto mt-3 pt-3 border-t border-gray-600">
        <p className="text-center text-xs sm:text-sm text-white">
          Inspired by{" "}
          <a
            href="https://www.nytimes.com/games/wordle/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-emerald-400 transition-colors underline underline-offset-2"
          >
            Wordle
          </a>
          {" "}by The New York Times
        </p>
      </div>
    </footer>
  );
}