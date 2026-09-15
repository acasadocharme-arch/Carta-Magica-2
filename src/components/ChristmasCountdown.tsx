import { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";

export default function ChristmasCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isChristmasDay: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isChristmasDay: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const currentYear = now.getFullYear();

      // Christmas is Dec 25, 00:00:00
      let christmasDate = new Date(currentYear, 11, 25, 0, 0, 0);

      // If Christmas has already passed this year, count down to next year's Christmas
      if (now.getTime() > christmasDate.getTime() + 24 * 60 * 60 * 1000) {
        christmasDate = new Date(currentYear + 1, 11, 25, 0, 0, 0);
      }

      const diff = christmasDate.getTime() - now.getTime();

      // Check if today is Christmas Day
      if (diff <= 0 && diff > -24 * 60 * 60 * 1000) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isChristmasDay: true,
        });
        return;
      }

      const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
      const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60));
      const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isChristmasDay: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft.isChristmasDay) {
    return (
      <div 
        aria-label="Hoje é Natal!"
        className="inline-flex items-center gap-2 bg-[#D90429]/90 border border-[#FFD166]/50 rounded-2xl px-4 py-2 text-xs text-white backdrop-blur-md shadow-lg"
      >
        <Sparkles className="w-4 h-4 text-[#FFD166] animate-pulse" />
        <span className="font-cinzel font-bold text-sm tracking-wide text-[#FFE194]">
          🎅 Feliz Natal! O trenó do Papai Noel chegou!
        </span>
      </div>
    );
  }

  return (
    <aside 
      aria-label="Contagem regressiva para 25 de Dezembro"
      className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 bg-[#0B132B]/85 border border-[#FFD166]/35 rounded-2xl px-3.5 sm:px-4 py-2 text-xs text-[#EDF2F4] backdrop-blur-md shadow-lg select-none mx-auto lg:mx-0"
    >
      <div className="flex items-center gap-1.5 text-[#FFD166]">
        <Clock className="w-3.5 h-3.5 text-[#FFD166] animate-pulse shrink-0" />
        <span className="font-medium tracking-wide uppercase text-[10px] sm:text-[11px]">
          Faltam para o Natal (25 de Dez):
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 font-cinzel font-bold text-white tracking-wider">
        {/* Days */}
        <div className="flex items-center bg-[#1C2541]/90 px-2 py-0.5 rounded-lg border border-white/10 shadow-inner">
          <span className="text-xs sm:text-sm text-white">{timeLeft.days}</span>
          <span className="text-[9px] text-[#FFD166] font-sans ml-1 font-semibold">dias</span>
        </div>

        <span className="text-[#FFD166]/70 font-bold text-xs">:</span>

        {/* Hours */}
        <div className="flex items-center bg-[#1C2541]/90 px-2 py-0.5 rounded-lg border border-white/10 shadow-inner">
          <span className="text-xs sm:text-sm text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-[9px] text-[#FFD166] font-sans ml-1 font-semibold">h</span>
        </div>

        <span className="text-[#FFD166]/70 font-bold text-xs">:</span>

        {/* Minutes */}
        <div className="flex items-center bg-[#1C2541]/90 px-2 py-0.5 rounded-lg border border-white/10 shadow-inner">
          <span className="text-xs sm:text-sm text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="text-[9px] text-[#FFD166] font-sans ml-1 font-semibold">m</span>
        </div>

        <span className="text-[#FFD166]/70 font-bold text-xs">:</span>

        {/* Seconds */}
        <div className="flex items-center bg-[#D90429]/90 px-2 py-0.5 rounded-lg border border-[#EF233C]/50 shadow-inner">
          <span className="text-xs sm:text-sm text-[#FFE194]">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="text-[9px] text-white/90 font-sans ml-1 font-semibold">s</span>
        </div>
      </div>
    </aside>
  );
}
