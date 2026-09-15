import { useEffect, useRef, useState } from "react";

export default function SantaSleigh() {
  const [speed, setSpeed] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("santa_sleigh_speed");
      if (saved) {
        const val = Number(saved);
        if (!isNaN(val) && val >= 6 && val <= 60) return val;
      }
    }
    return 26;
  });

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const flightRef = useRef<HTMLDivElement | null>(null);

  // Listen to speed changes from AdminPanel (single event listener, no redundant storage listeners)
  useEffect(() => {
    const handleSpeedChange = (e: any) => {
      const newSpeed = e?.detail?.speed;
      if (newSpeed) {
        const val = Number(newSpeed);
        if (!isNaN(val) && val >= 6 && val <= 60) {
          setSpeed(val);
        }
      }
    };

    window.addEventListener("sleigh-speed-change", handleSpeedChange);
    return () => {
      window.removeEventListener("sleigh-speed-change", handleSpeedChange);
    };
  }, []);

  // RequestAnimationFrame animation loop for the flight across the night sky
  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let flightProgress = 0; // 0 to 1 across screen, 1 to 1.15 for rest pause offscreen
    let isPaused = false;
    let windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

    // Passive resize listener to update screen bounds without thrashing DOM
    const handleResize = () => {
      windowWidth = window.innerWidth;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Cooldown duration after crossing screen before next flight (in seconds)
    const COOLDOWN_SECONDS = 3.5;

    const animate = (currentTime: number) => {
      if (isPaused) return;

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Throttle excessively large deltas (e.g. after background tab resume)
      const clampedDelta = Math.min(deltaTime, 0.1);

      const currentFlightDuration = speedRef.current;
      const totalCycleDuration = currentFlightDuration + COOLDOWN_SECONDS;

      // Advance progress
      flightProgress += clampedDelta / totalCycleDuration;
      if (flightProgress >= 1) {
        flightProgress = 0;
      }

      if (flightRef.current) {
        const element = flightRef.current;

        // Fraction of flight time spent actively crossing the screen (0 to 1)
        const activeFlightRatio = currentFlightDuration / totalCycleDuration;

        if (flightProgress <= activeFlightRatio) {
          // Actively crossing the sky
          const normalizedProgress = flightProgress / activeFlightRatio; // 0 to 1

          const startX = -380;
          const endX = windowWidth + 380;
          const currentX = startX + normalizedProgress * (endX - startX);

          // Gentle undulating flight wave and subtle rotation
          const currentY =
            Math.sin(normalizedProgress * Math.PI * 2) * 12 +
            Math.sin(currentTime * 0.003) * 4;
          const rotation = Math.cos(normalizedProgress * Math.PI * 2) * 1.8;

          // Smooth fade in at start and fade out at exit
          let opacity = 1;
          if (normalizedProgress < 0.04) {
            opacity = normalizedProgress / 0.04;
          } else if (normalizedProgress > 0.95) {
            opacity = (1 - normalizedProgress) / 0.05;
          }

          element.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg)`;
          element.style.opacity = opacity.toFixed(2);
          element.style.display = "flex";
        } else {
          // Offscreen cooldown pause: hide element to skip rendering & compositing
          element.style.display = "none";
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Pause when tab/screen is hidden (saves 100% CPU on mobile when backgrounded)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        isPaused = false;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 h-40 sm:h-52 overflow-hidden pointer-events-none z-20 select-none"
      id="magical-santa-sleigh-layer"
    >
      <style>{`
        @keyframes reindeerGallop {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-1.5deg); }
        }

        @keyframes sleighGentleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(3px); }
        }

        .reindeer-bob-1 { animation: reindeerGallop 1.2s ease-in-out infinite; }
        .reindeer-bob-2 { animation: reindeerGallop 1.2s ease-in-out infinite 0.25s; }
        .reindeer-bob-3 { animation: reindeerGallop 1.2s ease-in-out infinite 0.5s; }
        .sleigh-bob { animation: sleighGentleBob 1.6s ease-in-out infinite; }
      `}</style>

      {/* Flight Wrapper moving across screen driven by requestAnimationFrame */}
      <div
        ref={flightRef}
        className="absolute top-4 sm:top-7 left-0 flex items-center will-change-transform"
        style={{ transform: "translate3d(-400px, 0, 0)", opacity: 0 }}
      >
        {/* SVG Illustration of Santa Sleigh & Reindeer */}
        <svg
          viewBox="0 0 420 120"
          className="w-[270px] sm:w-[360px] md:w-[410px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="goldRunner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE194" />
              <stop offset="50%" stopColor="#FFD166" />
              <stop offset="100%" stopColor="#D4A373" />
            </linearGradient>

            <linearGradient id="sleighRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF233C" />
              <stop offset="50%" stopColor="#D90429" />
              <stop offset="100%" stopColor="#780016" />
            </linearGradient>

            <linearGradient id="reindeerFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C98A4B" />
              <stop offset="100%" stopColor="#7F4F24" />
            </linearGradient>

            {/* Rudolph Nose Radial Glow (GPU and CPU efficient, replaces dual drop-shadows) */}
            <radialGradient id="rudolphNoseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE5EC" />
              <stop offset="40%" stopColor="#FF0033" />
              <stop offset="100%" stopColor="#D90429" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ============================================================ */}
          {/* MAGICAL STARDUST TRAIL (Behind the sleigh on the left)       */}
          {/* ============================================================ */}
          <g className="stardust-trail" opacity="0.8">
            <circle cx="10" cy="72" r="1.8" fill="#FFE194" opacity="0.6" />
            <circle cx="25" cy="65" r="2.2" fill="#FFD166" opacity="0.8" />
            <circle cx="38" cy="80" r="1.6" fill="#FFF" opacity="0.7" />
            <circle cx="48" cy="70" r="2.0" fill="#FFE194" opacity="0.8" />
            <circle cx="60" cy="76" r="2.5" fill="#FFD166" opacity="0.9" />
            <circle cx="72" cy="66" r="1.8" fill="#FFF" opacity="0.8" />

            {/* Sparkle Stars */}
            <path d="M 28 62 L 30 65 L 33 65 L 30 67 L 31 70 L 28 68 L 25 70 L 26 67 L 23 65 L 26 65 Z" fill="#FFD166" opacity="0.85" />
            <path d="M 52 74 L 53 76 L 55 76 L 53 77 L 54 79 L 52 78 L 50 79 L 51 77 L 49 76 L 51 76 Z" fill="#FFE194" opacity="0.75" />
            <path d="M 78 68 L 79 70 L 81 70 L 79 71 L 80 73 L 78 72 L 76 73 L 77 71 L 75 70 L 77 70 Z" fill="#FFF" opacity="0.85" />
          </g>

          {/* ============================================================ */}
          {/* THE CHRISTMAS SLEIGH & SANTA                                */}
          {/* ============================================================ */}
          <g className="sleigh-bob">
            {/* Gift Bag inside Sleigh */}
            <g id="gift-bag">
              <ellipse cx="108" cy="62" rx="19" ry="16" fill="#A86E38" stroke="#68411C" strokeWidth="1.2" />
              <ellipse cx="107" cy="50" rx="9" ry="4" fill="#FFD166" />
              <rect x="98" y="44" width="8" height="8" rx="1.5" fill="#2A9D8F" stroke="#1D6D64" strokeWidth="0.8" />
              <line x1="102" y1="44" x2="102" y2="52" stroke="#FFD166" strokeWidth="0.8" />
              <rect x="108" y="42" width="9" height="10" rx="1.5" fill="#EF233C" stroke="#780016" strokeWidth="0.8" />
              <line x1="112.5" y1="42" x2="112.5" y2="52" stroke="#FFE194" strokeWidth="0.8" />
              <path d="M 118 46 C 118 41, 124 41, 124 45 L 122 55" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 118 46 C 118 41, 124 41, 124 45 L 122 55" stroke="#D90429" strokeWidth="2.4" strokeDasharray="2.5 2.5" strokeLinecap="round" />
            </g>

            {/* Santa Claus */}
            <g id="santa-claus">
              <path d="M 126 62 Q 134 50 144 60 L 146 76 L 122 76 Z" fill="url(#sleighRed)" />
              <path d="M 121 75 C 127 73, 142 73, 147 75" stroke="#F8F9FA" strokeWidth="3" strokeLinecap="round" />
              <rect x="124" y="68" width="22" height="4" fill="#1A1A1A" rx="0.5" />
              <rect x="132" y="67" width="6" height="6" fill="#FFD166" stroke="#C59B27" strokeWidth="0.8" rx="0.8" />

              {/* Santa Head & Hat */}
              <circle cx="138" cy="46" r="6" fill="#F8D5C2" />
              <circle cx="140" cy="47" r="1.5" fill="#EF476F" opacity="0.7" />
              <path d="M 134 46 C 133 55, 145 57, 145 49 C 146 54, 140 56, 137 53 Z" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="0.5" />
              <path d="M 137 48 C 139 50, 143 50, 144 48" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 134 43 Q 139 34 148 40 L 140 43 Z" fill="#D90429" />
              <ellipse cx="137" cy="43" rx="5" ry="2" fill="#F8F9FA" />
              <circle cx="149" cy="41" r="2.2" fill="#F8F9FA" />
              
              {/* Santa Arm */}
              <path d="M 136 60 Q 146 62 153 62" stroke="#D90429" strokeWidth="4" strokeLinecap="round" />
              <circle cx="152" cy="62" r="2.5" fill="#F8F9FA" />
              <circle cx="154" cy="62" r="2" fill="#2A9D8F" />
            </g>

            {/* Sleigh Carriage Body */}
            <g id="sleigh-body">
              <path 
                d="M 88 64 C 84 72, 88 80, 96 82 L 152 82 C 160 82, 166 76, 168 70 C 165 74, 156 75, 150 75 L 102 75 C 92 75, 89 69, 88 64 Z" 
                fill="url(#sleighRed)" 
                stroke="#780016" 
                strokeWidth="1.2" 
              />
              <path 
                d="M 86 63 C 83 75, 89 82, 100 82 L 154 82 C 164 82, 171 74, 172 67" 
                stroke="url(#goldRunner)" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
              <path d="M 172 67 C 173 63, 170 61, 167 63" stroke="url(#goldRunner)" strokeWidth="1.8" strokeLinecap="round" />
              <path 
                d="M 82 92 L 160 92 C 172 92, 180 86, 182 78 C 182 74, 178 73, 176 76" 
                stroke="url(#goldRunner)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              <line x1="102" y1="82" x2="100" y2="92" stroke="url(#goldRunner)" strokeWidth="2" />
              <line x1="140" y1="82" x2="142" y2="92" stroke="url(#goldRunner)" strokeWidth="2" />
            </g>
          </g>

          {/* ============================================================ */}
          {/* GOLDEN REINS                                                 */}
          {/* ============================================================ */}
          <path 
            d="M 155 62 Q 195 68 235 60 Q 280 66 325 56 Q 360 62 390 52" 
            stroke="#FFD166" 
            strokeWidth="1.4" 
            strokeDasharray="3 1" 
            opacity="0.9"
            fill="none" 
          />

          {/* ============================================================ */}
          {/* REINDEER 1 (Rear Reindeer - Dasher)                          */}
          {/* ============================================================ */}
          <g className="reindeer-bob-1" transform="translate(205, 12)">
            <path d="M 12 55 L 6 70" stroke="#7F4F24" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 30 55 L 36 68" stroke="#7F4F24" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="22" cy="48" rx="14" ry="8" fill="url(#reindeerFur)" />
            <path d="M 8 45 L 4 43" stroke="#F8F9FA" strokeWidth="2" strokeLinecap="round" />
            <path d="M 28 46 L 36 34 L 42 36 L 34 50 Z" fill="url(#reindeerFur)" />
            <ellipse cx="38" cy="35" rx="5" ry="3.5" fill="url(#reindeerFur)" />
            <path d="M 34 32 L 31 28" stroke="#7F4F24" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 36 32 L 36 22 L 32 18 M 36 26 L 40 22" stroke="#E6CCB2" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 32 44 L 35 48" stroke="#D90429" strokeWidth="2" strokeLinecap="round" />
            <circle cx="34" cy="49" r="1.6" fill="#FFD166" />
          </g>

          {/* ============================================================ */}
          {/* REINDEER 2 (Middle Reindeer - Prancer)                       */}
          {/* ============================================================ */}
          <g className="reindeer-bob-2" transform="translate(275, 8)">
            <path d="M 12 55 L 7 69" stroke="#7F4F24" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 30 55 L 38 66" stroke="#7F4F24" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="22" cy="48" rx="14" ry="8" fill="url(#reindeerFur)" />
            <path d="M 8 45 L 4 43" stroke="#F8F9FA" strokeWidth="2" strokeLinecap="round" />
            <path d="M 28 46 L 36 34 L 42 36 L 34 50 Z" fill="url(#reindeerFur)" />
            <ellipse cx="38" cy="35" rx="5" ry="3.5" fill="url(#reindeerFur)" />
            <path d="M 36 32 L 36 21 L 31 17 M 36 25 L 41 21" stroke="#E6CCB2" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 32 44 L 35 48" stroke="#D90429" strokeWidth="2" strokeLinecap="round" />
            <circle cx="34" cy="49" r="1.6" fill="#FFD166" />
          </g>

          {/* ============================================================ */}
          {/* REINDEER 3 (Lead Reindeer - Rudolph with Glowing Red Nose!)  */}
          {/* ============================================================ */}
          <g className="reindeer-bob-3" transform="translate(345, 4)">
            <path d="M 12 55 L 8 70" stroke="#7F4F24" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 30 55 L 40 65" stroke="#7F4F24" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="22" cy="48" rx="15" ry="8.5" fill="url(#reindeerFur)" />
            <path d="M 7 45 L 3 43" stroke="#F8F9FA" strokeWidth="2" strokeLinecap="round" />
            <path d="M 28 46 L 37 32 L 44 34 L 34 49 Z" fill="url(#reindeerFur)" />
            <ellipse cx="39" cy="33" rx="5.5" ry="4" fill="url(#reindeerFur)" />
            <path d="M 37 30 L 38 18 L 33 14 M 38 23 L 44 19 M 38 18 L 41 12" stroke="#FFE8D6" strokeWidth="2" strokeLinecap="round" />
            <path d="M 33 43 L 36 47" stroke="#D90429" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="35" cy="48" r="1.8" fill="#FFD166" />

            {/* Fast GPU Radial Glow for Rudolph's Nose */}
            <circle cx="44.5" cy="33.5" r="7" fill="url(#rudolphNoseGlow)" opacity="0.85" />
            <circle cx="44.5" cy="33.5" r="3.2" fill="#FF0033" />
            <circle cx="43.8" cy="32.8" r="1.1" fill="#FFE5EC" />
          </g>
        </svg>
      </div>
    </div>
  );
}

