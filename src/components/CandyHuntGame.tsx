import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, X, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface CandyItem {
  id: string;
  emoji: string;
  name: string;
  points: number;
  x: number; // percentage 5 - 85
  y: number; // percentage 10 - 80
  scale: number;
  rotation: number;
}

const CANDY_TYPES = [
  { emoji: "🍭", name: "Pirulito de Hortelã", points: 10 },
  { emoji: "🍬", name: "Bala Mágica do Polo Norte", points: 10 },
  { emoji: "🍫", name: "Chocolate dos Duendes", points: 15 },
  { emoji: "🍪", name: "Biscoito de Gengibre", points: 20 },
  { emoji: "🧁", name: "Cupcake Nevado", points: 15 },
  { emoji: "🍩", name: "Rosquinha de Natal", points: 10 },
  { emoji: "🍓", name: "Frutinha Silvestre Polar", points: 25 },
];

interface CandyHuntGameProps {
  childName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandyHuntGame({ childName, isOpen, onClose }: CandyHuntGameProps) {
  const [score, setScore] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [candies, setCandies] = useState<CandyItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const nextPointId = useRef(0);

  // Gentle procedural audio chime using Web Audio API
  const playChime = useCallback((frequency = 660) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio might be blocked by browser policy until interaction
    }
  }, [soundEnabled]);

  // Spawn a batch of candies
  const spawnCandies = useCallback((count = 5) => {
    const newCandies: CandyItem[] = [];
    for (let i = 0; i < count; i++) {
      const type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      newCandies.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
        emoji: type.emoji,
        name: type.name,
        points: type.points,
        x: Math.floor(Math.random() * 75) + 10,
        y: Math.floor(Math.random() * 65) + 15,
        scale: 0.9 + Math.random() * 0.4,
        rotation: Math.floor(Math.random() * 40) - 20,
      });
    }
    setCandies(newCandies);
  }, []);

  // Initialize or reset game
  const handleStartGame = useCallback(() => {
    setScore(0);
    setCollectedCount(0);
    setIsCompleted(false);
    spawnCandies(5);
  }, [spawnCandies]);

  useEffect(() => {
    if (isOpen) {
      handleStartGame();
    } else {
      setCandies([]);
    }
  }, [isOpen, handleStartGame]);

  // Handle candy click
  const handleCollectCandy = (candy: CandyItem) => {
    playChime(580 + (collectedCount % 5) * 120);

    // Show floating point popup
    const pId = ++nextPointId.current;
    setFloatingPoints((prev) => [
      ...prev,
      { id: pId, x: candy.x, y: candy.y, text: `+${candy.points}` },
    ]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((p) => p.id !== pId));
    }, 800);

    const newScore = score + candy.points;
    const newCount = collectedCount + 1;
    setScore(newScore);
    setCollectedCount(newCount);

    // Remove collected candy and spawn a replacement
    setCandies((prev) => {
      const filtered = prev.filter((c) => c.id !== candy.id);
      const type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      const replacement: CandyItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        emoji: type.emoji,
        name: type.name,
        points: type.points,
        x: Math.floor(Math.random() * 75) + 10,
        y: Math.floor(Math.random() * 65) + 15,
        scale: 0.9 + Math.random() * 0.4,
        rotation: Math.floor(Math.random() * 40) - 20,
      };
      return [...filtered, replacement];
    });

    // Check completion threshold (e.g. 10 candies collected)
    if (newCount >= 10 && !isCompleted) {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#FFD166", "#EF233C", "#06D6A0", "#FFFFFF", "#FFB703"],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative my-8 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden transition-all">
      {/* Background festive snow sparkles */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#FFD166]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#D90429]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D90429] to-[#EF233C] border border-[#FFD166] flex items-center justify-center text-xl shadow-md">
            🍬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>Caça aos Doces de Natal</span>
                <span className="bg-[#D90429] text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border border-[#FFD166]/40">
                  Mini-Jogo
                </span>
              </h3>
            </div>
            <p className="text-xs text-[#EDF2F4]/70">
              {childName ? `Ajude ${childName} a pegar` : "Clique nos"} doces mágicos espalhados pelos duendes!
            </p>
          </div>
        </div>

        {/* Stats and Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Score Badge */}
          <div className="bg-[#060B19]/80 border border-[#FFD166]/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
            <Trophy className="w-4 h-4 text-[#FFD166]" />
            <span className="text-xs text-[#EDF2F4]/70 font-semibold">Pontos:</span>
            <span className="font-cinzel text-sm sm:text-base font-bold text-[#FFD166] font-mono">
              {score}
            </span>
          </div>

          {/* Candies Count Badge */}
          <div className="bg-[#060B19]/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-white flex items-center gap-1.5">
            <span>🍬</span>
            <span className="font-bold text-emerald-400">{collectedCount}</span>
            <span className="text-white/40">/ 10</span>
          </div>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4]/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
            aria-label="Controle de áudio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-white/40" />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleStartGame}
            className="p-2 rounded-xl bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/30 transition-colors cursor-pointer"
            title="Reiniciar brincadeira"
            aria-label="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close Mini Game Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Fechar mini-jogo"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Playground Area with interactive candies */}
      <div 
        id="candy-hunt-playground"
        className="relative h-64 sm:h-80 w-full bg-[#060B19]/60 border border-white/10 rounded-2xl overflow-hidden cursor-crosshair select-none"
      >
        {/* Subtle decorative Polar backdrop */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-8xl font-cinzel font-bold text-white">POLO NORTE</span>
        </div>

        {/* Floating Candy Elements */}
        {candies.map((candy) => (
          <button
            key={candy.id}
            type="button"
            onClick={() => handleCollectCandy(candy)}
            style={{
              left: `${candy.x}%`,
              top: `${candy.y}%`,
              transform: `scale(${candy.scale}) rotate(${candy.rotation}deg)`,
              transition: "transform 0.15s ease-out, top 0.4s ease, left 0.4s ease",
            }}
            className="absolute p-2 -m-2 rounded-full cursor-pointer hover:scale-125 active:scale-95 transition-transform drop-shadow-[0_4px_10px_rgba(255,209,102,0.35)] animate-bounce"
            title={`Pegar ${candy.name} (+${candy.points} pts)`}
            aria-label={`Pegar ${candy.name}`}
          >
            <span className="text-3xl sm:text-4xl block filter drop-shadow-md">
              {candy.emoji}
            </span>
          </button>
        ))}

        {/* Floating "+Points" visual popups */}
        {floatingPoints.map((fp) => (
          <div
            key={fp.id}
            style={{ left: `${fp.x}%`, top: `${fp.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none font-cinzel font-black text-sm sm:text-base text-[#FFD166] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-fade-out-up"
          >
            {fp.text}
          </div>
        ))}

        {/* Completion Banner (When child collects 10 candies) */}
        {isCompleted && (
          <div className="absolute inset-0 bg-[#060B19]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#D90429] border-2 border-[#FFD166] flex items-center justify-center text-3xl shadow-xl mb-3 animate-bounce">
              🏆
            </div>
            <h4 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              Ho Ho Ho! Incrível, {childName || "Amiguinho(a)"}!
            </h4>
            <p className="text-xs sm:text-sm text-[#FFD166] mt-1 max-w-sm">
              Você encontrou todos os doces mágicos do Polo Norte e marcou{" "}
              <strong>{score} pontos</strong>! Os duendes estão muito orgulhosos!
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleStartGame}
                className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold text-xs px-5 py-2.5 rounded-full border border-[#FFD166] shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-white/15 cursor-pointer"
              >
                Voltar à Carta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Hint Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#EDF2F4]/60 px-1">
        <span>💡 Dica: Toque ou clique rápido em cada doce antes que ele mude de lugar!</span>
        <span className="text-[#FFD166] font-semibold hidden sm:inline">Meta: Colete 10 doces mágicos</span>
      </div>
    </div>
  );
}
