import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Volume1, Play, Pause, Sparkles } from "lucide-react";
import { speakSantaMessage } from "../services/api";
import { trackEvent } from "../services/analytics";

interface SantaAudioPlayerProps {
  letterId: string;
  letterContent: string;
  childName: string;
  isPro: boolean;
  onUpgradeToPro?: () => void;
}

export default function SantaAudioPlayer({
  letterId,
  letterContent,
  childName,
  isPro,
  onUpgradeToPro,
}: SantaAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stopper, setStopper] = useState<{ stop: () => void } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Approximate duration: ~130 words per minute
  const wordCount = letterContent.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(25, Math.round((wordCount / 130) * 60));

  useEffect(() => {
    return () => {
      if (stopper) stopper.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopper]);

  const handleTogglePlay = () => {
    if (!isPro) {
      if (onUpgradeToPro) onUpgradeToPro();
      return;
    }

    if (isPlaying) {
      if (stopper) stopper.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      return;
    }

    trackEvent("audio_played", { letterId, childName });

    setProgress(0);
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, Math.round((elapsed / estimatedSeconds) * 100));
      setProgress(pct);
      if (pct >= 100 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 500);

    const activeStopper = speakSantaMessage(
      letterContent,
      () => setIsPlaying(true),
      () => {
        setIsPlaying(false);
        setProgress(100);
        if (timerRef.current) clearInterval(timerRef.current);
      },
      () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    );

    setStopper(activeStopper);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Modulate browser synth if supported
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const currentSecs = Math.round((progress / 100) * estimatedSeconds);

  return (
    <div className="bg-[#0B132B] border border-[#FFD166]/40 rounded-2xl p-4 sm:p-5 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-3.5 text-center sm:text-left w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#D90429]/30 text-[#FFD166] flex items-center justify-center border border-[#FFD166]/40 shrink-0">
            <Volume2 className={`w-6 h-6 ${isPlaying ? "animate-bounce" : "animate-pulse"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                Voz Oficial do Papai Noel 🎅
              </h4>
              {isPro ? (
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Liberado PRO
                </span>
              ) : (
                <span className="bg-[#1C2541] text-[#FFD166] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FFD166]/30">
                  Exclusivo PRO
                </span>
              )}
            </div>
            <p className="text-xs text-[#EDF2F4]/70 mt-0.5">
              {isPro
                ? "Sintetizador temático grave e caloroso calibrado para a leitura oficial."
                : "Libere o áudio narrado com a voz do Noel chamando seu filho pelo nome!"}
            </p>
          </div>
        </div>

        {/* Right: Main Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {isPro ? (
            <button
              onClick={handleTogglePlay}
              className="bg-gradient-to-r from-[#FFD166] to-[#FFB703] hover:from-[#FFE194] hover:to-[#FFD166] text-[#060B19] font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
              id="santa-audio-play-btn"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-[#060B19]" />
                  <span>Pausar Áudio</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#060B19]" />
                  <span>Ouvir Mensagem do Noel</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onUpgradeToPro}
              className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer border border-[#FFD166]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Desbloquear Áudio (R$ 39,99)</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Controls Bar (Active when PRO) */}
      {isPro && (
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          {/* Audio progress bar */}
          <div className="flex-1 w-full flex items-center gap-2 text-[11px] text-[#EDF2F4]/60 font-mono">
            <span>{formatTime(currentSecs)}</span>
            <div className="flex-1 bg-[#1C2541] h-2 rounded-full overflow-hidden relative cursor-pointer">
              <div
                className="bg-gradient-to-r from-[#FFD166] to-[#EF233C] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{formatTime(estimatedSeconds)}</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleMute}
              className="text-[#EDF2F4]/70 hover:text-[#FFD166] p-1 transition-colors"
              title={isMuted ? "Desmutar" : "Mutar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#EF233C]" /> : <Volume1 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1.5 bg-[#1C2541] rounded-lg appearance-none cursor-pointer accent-[#FFD166]"
              title="Controle de volume"
            />
          </div>
        </div>
      )}
    </div>
  );
}
