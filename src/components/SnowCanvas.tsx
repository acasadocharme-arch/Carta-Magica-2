import { useEffect, useRef, useState } from "react";
import { Snowflake, X } from "lucide-react";

interface Flake {
  x: number;
  y: number;
  r: number;
  d: number;
  speed: number;
}

export default function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize intensity from localStorage or default to 45
  const [intensity, setIntensity] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snow_intensity");
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0 && val <= 140) return val;
      }
    }
    return 45;
  });

  const [isControlOpen, setIsControlOpen] = useState(false);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  // Persist preference to localStorage
  const handleIntensityChange = (val: number) => {
    const clamped = Math.max(0, Math.min(120, val));
    setIntensity(clamped);
    if (typeof window !== "undefined") {
      localStorage.setItem("snow_intensity", clamped.toString());
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let resizeRafId: number | null = null;
    let isRunning = false;
    let lastFrameTime = 0;

    // Detect mobile device for CPU-friendly particle budget
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        ("ontouchstart" in window && navigator.maxTouchPoints > 0));

    // Cap particles on mobile to avoid CPU/battery drain
    const MAX_FLAKES = isMobile ? 40 : 90;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Debounced/rAF-governed resize handler with passive listener
    const handleResize = () => {
      if (resizeRafId !== null) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Pre-allocate fixed flake pool for zero garbage collection overhead
    const flakes: Flake[] = Array.from({ length: MAX_FLAKES }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.8,
      d: Math.random() * 50,
      speed: Math.random() * 0.7 + 0.4,
    }));

    let angle = 0;

    const render = (timestamp: number) => {
      const currentCount = intensityRef.current;

      // If user turned off snow, clear canvas once and halt rAF to consume 0% CPU
      if (currentCount <= 0) {
        ctx.clearRect(0, 0, width, height);
        isRunning = false;
        animationFrameId = null;
        return;
      }

      // Frame rate limiter (~60 FPS max cap on 90Hz/120Hz mobile screens)
      if (timestamp - lastFrameTime < 16) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(237, 242, 244, 0.72)";
      ctx.beginPath();

      // Mobile scale factor to limit particle count on smaller screens
      const activeFlakes = Math.min(
        isMobile ? Math.floor(currentCount * 0.45) : currentCount,
        MAX_FLAKES
      );

      for (let i = 0; i < activeFlakes; i++) {
        const f = flakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      }
      ctx.fill();

      angle += 0.007;
      for (let i = 0; i < activeFlakes; i++) {
        const f = flakes[i];
        f.y += Math.cos(angle + f.d) + f.speed;
        f.x += Math.sin(angle) * 0.5;

        if (f.x > width + 5 || f.x < -5 || f.y > height) {
          f.x = Math.random() * width;
          f.y = -6;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (!isRunning && intensityRef.current > 0) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      isRunning = false;
    };

    // Pause animation when tab or mobile browser is in background
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    // Start initial loop
    startAnimation();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopAnimation();
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
    };
  }, [intensity]); // Re-evaluate if intensity transitions from 0 to > 0

  const getIntensityLabel = (val: number) => {
    if (val === 0) return "Neve Desligada";
    if (val < 30) return "Neve Serena";
    if (val < 65) return "Neve Clássica";
    return "Nevasca Mágica";
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-10"
      />

      {/* Discreet Floating Snow Intensity Control Widget */}
      <div 
        className="fixed bottom-4 right-4 z-40 select-none no-print font-sans"
        id="snow-intensity-control"
      >
        {!isControlOpen ? (
          <button
            onClick={() => setIsControlOpen(true)}
            className="flex items-center gap-1.5 bg-[#0B132B]/85 hover:bg-[#1C2541] text-[#EDF2F4]/75 hover:text-[#FFD166] border border-[#FFD166]/30 hover:border-[#FFD166]/70 px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md text-xs transition-all cursor-pointer group"
            title="Ajustar intensidade da neve mágica"
            aria-label="Controle de queda de neve"
          >
            <Snowflake className={`w-3.5 h-3.5 text-[#FFD166] ${intensity > 0 ? "animate-spin-slow" : "opacity-40"}`} />
            <span className="text-[10px] font-medium hidden sm:inline">
              {intensity === 0 ? "Neve (Off)" : `${intensity} flocos`}
            </span>
          </button>
        ) : (
          <div className="bg-[#0B132B]/95 backdrop-blur-md border border-[#FFD166]/40 rounded-2xl p-3 shadow-2xl w-64 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5 text-[#FFD166]" />
                <span className="text-[11px] font-bold text-[#FFD166] uppercase tracking-wider font-cinzel">
                  Queda de Neve
                </span>
              </div>
              <button
                onClick={() => setIsControlOpen(false)}
                className="text-[#EDF2F4]/50 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title="Fechar controle"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Status & Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#EDF2F4]/80 font-medium">
                  {getIntensityLabel(intensity)}
                </span>
                <span className="font-mono text-[#FFD166] font-bold">
                  {intensity} partículas
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={intensity}
                onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#1C2541] rounded-lg appearance-none cursor-pointer accent-[#FFD166]"
                aria-label="Slider de intensidade da neve"
              />
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
              <button
                onClick={() => handleIntensityChange(0)}
                className={`text-[9px] py-1 rounded transition-colors ${
                  intensity === 0 ? "bg-[#D90429] text-white font-bold" : "bg-white/5 text-[#EDF2F4]/60 hover:bg-white/10"
                }`}
              >
                Zero
              </button>
              <button
                onClick={() => handleIntensityChange(30)}
                className={`text-[9px] py-1 rounded transition-colors ${
                  intensity === 30 ? "bg-[#FFD166] text-[#060B19] font-bold" : "bg-white/5 text-[#EDF2F4]/60 hover:bg-white/10"
                }`}
              >
                Suave
              </button>
              <button
                onClick={() => handleIntensityChange(65)}
                className={`text-[9px] py-1 rounded transition-colors ${
                  intensity === 65 ? "bg-[#FFD166] text-[#060B19] font-bold" : "bg-white/5 text-[#EDF2F4]/60 hover:bg-white/10"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => handleIntensityChange(110)}
                className={`text-[9px] py-1 rounded transition-colors ${
                  intensity === 110 ? "bg-[#FFD166] text-[#060B19] font-bold" : "bg-white/5 text-[#EDF2F4]/60 hover:bg-white/10"
                }`}
              >
                Forte
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
