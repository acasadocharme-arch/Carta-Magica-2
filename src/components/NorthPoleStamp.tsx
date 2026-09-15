import React, { useId } from "react";
import { Sparkles, Compass, Star, Plane, Award, TreePine } from "lucide-react";

export type StampTheme = "mágico" | "emocionante" | "divertido" | "carinhoso" | "expresso_polar" | "oficial";
export type StampColor = "crimson" | "gold" | "navy" | "pine";

interface NorthPoleStampProps {
  year?: number | string;
  theme?: StampTheme;
  childName?: string;
  city?: string;
  token?: string;
  inkColor?: StampColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const THEME_DETAILS: Record<
  StampTheme,
  {
    title: string;
    sub: string;
    icon: typeof Sparkles;
    motto: string;
    code: string;
  }
> = {
  mágico: {
    title: "MAGIA POLAR",
    sub: "AURORA BOREAL",
    icon: Sparkles,
    motto: "PÓ DE ESTRELAS PURÍSSIMO",
    code: "MAG-90N",
  },
  emocionante: {
    title: "LIVRO DOURADO",
    sub: "CORAÇÃO GENTIL",
    icon: Award,
    motto: "APROVADO PELO PAPAI NOEL",
    code: "DOC-2026",
  },
  divertido: {
    title: "OFICINA DE BRINQUEDOS",
    sub: "DUENDES ARTESÃOS",
    icon: TreePine,
    motto: "TESTADO COM MUITA ALEGRIA",
    code: "ELF-TOY",
  },
  carinhoso: {
    title: "ABRAÇO DE NATAL",
    sub: "FAMÍLIA & AFETO",
    icon: Star,
    motto: "COM TODO O AMOR DO POLO",
    code: "LOVE-NP",
  },
  expresso_polar: {
    title: "EXPRESSO POLAR",
    sub: "ROTA AÉREA RÁPIDA",
    icon: Plane,
    motto: "TRENO REAL DAS 8 RENAS",
    code: "AIR-SLEIGH",
  },
  oficial: {
    title: "CORREIO REAL DO POLO",
    sub: "SERVIÇO AÉREO OFICIAL",
    icon: Compass,
    motto: "LATITUDE 90° 00' 00\" N",
    code: "NP-OFFICIAL",
  },
};

const COLOR_MAP: Record<StampColor, { border: string; text: string; bg: string; fill: string; hex: string }> = {
  crimson: {
    border: "border-[#9B021A]",
    text: "text-[#9B021A]",
    bg: "bg-[#9B021A]/5",
    fill: "#9B021A",
    hex: "#9B021A",
  },
  gold: {
    border: "border-[#B28228]",
    text: "text-[#9E731F]",
    bg: "bg-[#FFD166]/10",
    fill: "#B28228",
    hex: "#B28228",
  },
  navy: {
    border: "border-[#1C2541]",
    text: "text-[#1C2541]",
    bg: "bg-[#1C2541]/5",
    fill: "#1C2541",
    hex: "#1C2541",
  },
  pine: {
    border: "border-[#1B4D3E]",
    text: "text-[#1B4D3E]",
    bg: "bg-[#1B4D3E]/10",
    fill: "#1B4D3E",
    hex: "#1B4D3E",
  },
};

export const NorthPoleStamp: React.FC<NorthPoleStampProps> = ({
  year = 2026,
  theme = "oficial",
  childName,
  city,
  token,
  inkColor = "crimson",
  size = "md",
  className = "",
}) => {
  const filterId = useId().replace(/:/g, "_");
  const normalizedTheme: StampTheme = (theme && theme in THEME_DETAILS) ? (theme as StampTheme) : "oficial";
  const details = THEME_DETAILS[normalizedTheme];
  const color = COLOR_MAP[inkColor] || COLOR_MAP.crimson;
  const Icon = details.icon;

  const sizeClasses = {
    sm: "scale-85 origin-top-right",
    md: "scale-100",
    lg: "scale-110 sm:scale-125",
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none stamp-container ${sizeClasses} ${className}`}
      title={`Selo Postal Autenticado do Polo Norte (${year}) - ${details.title}`}
    >
      {/* SVG Filters for realistic vintage stamp ink bleed and weathered stamp edges */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={`stamp-ink-${filterId}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 1. Classic Perforated Postage Stamp */}
      <div 
        className="relative px-3 py-2 bg-[#FFFDF8] rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-[#CBB892] flex flex-col items-center justify-between"
        style={{
          width: "116px",
          height: "148px",
          filter: `url(#stamp-ink-${filterId})`,
          backgroundImage: `
            radial-gradient(circle at 0 0, transparent 4px, #FFFDF8 4px),
            radial-gradient(circle at 100% 0, transparent 4px, #FFFDF8 4px)
          `,
        }}
      >
        {/* Perforated stamp teeth simulation (scalloped border effect) */}
        <div className="absolute inset-x-0 -top-1 flex justify-around pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={`top-${i}`} className="w-2 h-1.5 bg-[#FCF9F2] rounded-b-full border-b border-black/10" />
          ))}
        </div>
        <div className="absolute inset-x-0 -bottom-1 flex justify-around pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={`bot-${i}`} className="w-2 h-1.5 bg-[#FCF9F2] rounded-t-full border-t border-black/10" />
          ))}
        </div>

        {/* Inner Engraved Border Frame */}
        <div className={`w-full h-full border-2 border-dashed ${color.border} p-1.5 flex flex-col justify-between items-center text-center`}>
          
          {/* Top Country / Origin Label */}
          <div className="w-full border-b border-[#1C2541]/20 pb-0.5">
            <span className={`text-[8px] font-cinzel font-black tracking-widest ${color.text} uppercase block leading-none`}>
              POLO NORTE
            </span>
            <span className="text-[6.5px] font-mono tracking-tighter text-[#1C2541]/70 block mt-0.5">
              CORREIO AÉREO • 90°N
            </span>
          </div>

          {/* Center Illustration Artwork */}
          <div className="my-1 flex flex-col items-center justify-center">
            <div className={`w-10 h-10 rounded-full border border-dashed ${color.border} flex items-center justify-center ${color.bg} mb-1 relative`}>
              <Icon className={`w-5 h-5 ${color.text}`} />
              <div className="absolute -top-1 -right-1 text-[7px] font-bold text-[#FFB703]">★</div>
            </div>
            <span className={`text-[7.5px] font-cinzel font-black tracking-tight ${color.text} uppercase leading-tight line-clamp-1`}>
              {details.title}
            </span>
            <span className="text-[6px] font-serif italic text-[#1C2541]/65 max-w-[85px] leading-tight">
              {details.sub}
            </span>
          </div>

          {/* Bottom Denomination & Year */}
          <div className="w-full border-t border-[#1C2541]/20 pt-0.5 flex items-center justify-between px-1">
            <span className="text-[8px] font-bold font-mono text-[#9B021A]">
              ★ {year}
            </span>
            <span className="text-[7.5px] font-mono font-bold text-[#1C2541]/80">
              1ª CLASSE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Circular Postmark Cancellation Stamp with Wavy Lines */}
      <div 
        className="flex items-center gap-1.5 -ml-4 pointer-events-none opacity-85"
        style={{ filter: `url(#stamp-ink-${filterId})` }}
      >
        {/* Double Circular Postmark */}
        <div className={`w-20 h-20 rounded-full border-2 ${color.border} border-double p-1 flex flex-col items-center justify-center text-center transform -rotate-12`}>
          <div className={`w-full h-full rounded-full border border-dashed ${color.border} flex flex-col items-center justify-center p-1 relative`}>
            <span className={`text-[6px] font-cinzel font-black tracking-wider ${color.text} uppercase leading-none`}>
              SERVIÇO POSTAL
            </span>
            <div className="my-0.5 flex items-center gap-0.5">
              <span className="text-[7px]">❄</span>
              <span className={`text-[8.5px] font-mono font-black ${color.text}`}>{year}</span>
              <span className="text-[7px]">❄</span>
            </div>
            <span className={`text-[5.5px] font-bold font-mono ${color.text} tracking-tight uppercase leading-none`}>
              {token ? token.slice(0, 8).toUpperCase() : "REG-POLAR"}
            </span>
            <span className="text-[5px] text-[#1C2541]/60 font-serif uppercase tracking-widest mt-0.5">
              OFICINA CENTRAL
            </span>
          </div>
        </div>

        {/* Vintage Postal Cancellation Wavy Ink Lines */}
        <svg className="w-14 sm:w-16 h-12 text-[#9B021A]" viewBox="0 0 100 70" fill="none" stroke={color.hex} strokeWidth="1.8" strokeLinecap="round">
          <path d="M 0 15 Q 25 5, 50 15 T 100 15" opacity="0.8" />
          <path d="M 0 35 Q 25 25, 50 35 T 100 35" opacity="0.85" />
          <path d="M 0 55 Q 25 45, 50 55 T 100 55" opacity="0.8" />
          <text x="35" y="38" fontSize="7" fontFamily="Cinzel" fill={color.hex} fontWeight="900" letterSpacing="1" stroke="none">
            POLO NORTE
          </text>
        </svg>
      </div>

    </div>
  );
};

export default NorthPoleStamp;
