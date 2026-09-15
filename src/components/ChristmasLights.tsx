import React from "react";

export default function ChristmasLights() {
  // Array of 28 evenly spaced bulbs across the top edge
  const bulbColors = [
    { main: "#EF233C", glow: "#FF0033", delay: "0s" },      // Ruby Red
    { main: "#FFD166", glow: "#FFE194", delay: "0.4s" },    // Warm Gold
    { main: "#2A9D8F", glow: "#52B788", delay: "0.8s" },    // Pine Green
    { main: "#48CAE4", glow: "#00B4D8", delay: "1.2s" },    // Ice Blue
    { main: "#FF758F", glow: "#FF4D6D", delay: "0.6s" },    // Rose Red
    { main: "#FFB703", glow: "#FFD166", delay: "1.0s" },    // Amber
    { main: "#06D6A0", glow: "#70E000", delay: "0.2s" },    // Emerald
  ];

  const totalBulbs = 24;

  return (
    <div 
      aria-hidden="true"
      className="fixed top-0 inset-x-0 h-8 sm:h-10 pointer-events-none z-30 select-none overflow-hidden"
      id="festive-christmas-lights"
    >
      <style>{`
        @keyframes twinkleBulb {
          0%, 100% {
            opacity: 0.95;
            filter: drop-shadow(0 2px 8px var(--bulb-glow)) brightness(1.2);
          }
          50% {
            opacity: 0.5;
            filter: drop-shadow(0 1px 3px var(--bulb-glow)) brightness(0.85);
          }
        }

        .xmas-bulb {
          animation: twinkleBulb 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      {/* Repeating Garland Wire and Bulbs */}
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox={`0 0 ${totalBulbs * 40} 36`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Wire gradient */}
          <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1C2541" />
            <stop offset="50%" stopColor="#2A385B" />
            <stop offset="100%" stopColor="#1C2541" />
          </linearGradient>
        </defs>

        {/* Draped festive green-gold electrical wire */}
        {Array.from({ length: totalBulbs }).map((_, idx) => {
          const xStart = idx * 40;
          const xEnd = (idx + 1) * 40;
          const xMid = xStart + 20;
          return (
            <path
              key={`wire-${idx}`}
              d={`M ${xStart} 0 Q ${xMid} 10 ${xEnd} 0`}
              stroke="#1b4332"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          );
        })}

        {/* Glowing Bulbs hung at the lowest point of each draped arc */}
        {Array.from({ length: totalBulbs }).map((_, idx) => {
          const colorObj = bulbColors[idx % bulbColors.length];
          const xPos = idx * 40 + 20;
          const yPos = 8.5;

          return (
            <g 
              key={`bulb-${idx}`}
              className="xmas-bulb"
              style={{ 
                // @ts-ignore
                "--bulb-glow": colorObj.glow,
                animationDelay: colorObj.delay,
              }}
            >
              {/* Little green socket cap */}
              <rect
                x={xPos - 2.5}
                y={yPos}
                width="5"
                height="3.5"
                rx="1"
                fill="#2d6a4f"
                stroke="#1b4332"
                strokeWidth="0.8"
              />

              {/* Glowing glass bulb */}
              <ellipse
                cx={xPos}
                cy={yPos + 8}
                rx="3.8"
                ry="5.5"
                fill={colorObj.main}
              />

              {/* Inner bright hot spot reflection */}
              <ellipse
                cx={xPos - 1.2}
                cy={yPos + 6}
                rx="1.2"
                ry="2.2"
                fill="#FFFFFF"
                opacity="0.75"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
