import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  SkipForward, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";
import { christmasAudio } from "../lib/christmasAudio";

export const AudioPlayer: React.FC = () => {
  const [audioState, setAudioState] = useState(() => christmasAudio.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsubscribe = christmasAudio.subscribe(() => {
      setAudioState(christmasAudio.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleTogglePlay = () => {
    christmasAudio.togglePlay();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    christmasAudio.setVolume(val);
  };

  const handleToggleMute = () => {
    christmasAudio.toggleMute();
  };

  const handleNextTrack = () => {
    christmasAudio.nextTrack();
  };

  const effectiveVolume = audioState.isMuted ? 0 : audioState.volume;

  const VolumeIcon = effectiveVolume === 0 
    ? VolumeX 
    : effectiveVolume < 0.5 
    ? Volume1 
    : Volume2;

  // Render ultra-compact floating badge when minimized to ensure zero interference with CTAs
  if (isMinimized) {
    return (
      <aside 
        aria-label="Player de Trilha Sonora Natalina"
        className="fixed bottom-4 left-4 z-30 select-none no-print"
        id="christmas-ambient-player"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="h-9 sm:h-10 px-3 rounded-full bg-[#0B132B]/95 hover:bg-[#1C2541] border border-[#FFD166]/60 text-[#FFD166] shadow-[0_6px_20px_rgba(0,0,0,0.6)] flex items-center gap-2 transition-all hover:scale-105 cursor-pointer backdrop-blur-md group"
          title="Abrir Player de Música Natalina"
          aria-label="Abrir Player de Música Natalina"
        >
          {audioState.isPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-[#FFD166] animate-pulse" />
              <span className="text-[11px] font-bold text-white hidden sm:inline">Música Ativa</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </>
          ) : (
            <>
              <Music className="w-4 h-4 text-[#FFD166]" />
              <span className="text-[11px] font-medium text-[#EDF2F4]/80 hidden sm:inline">Trilha Natalina</span>
            </>
          )}
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Player de Trilha Sonora Natalina"
      className="fixed bottom-4 left-4 z-30 select-none max-w-[calc(100vw-2rem)] no-print"
      id="christmas-ambient-player"
    >
      <div 
        className={`bg-[#0B132B]/95 backdrop-blur-md border border-[#FFD166]/40 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 ${
          isExpanded ? "p-3.5 sm:p-4 w-[290px] sm:w-[320px]" : "px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center gap-2.5 sm:gap-3"
        }`}
      >
        {!isExpanded ? (
          /* Compact Minimized Bar */
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${
                audioState.isPlaying
                  ? "bg-[#D90429] hover:bg-[#EF233C] text-white ring-2 ring-[#FFD166]/40"
                  : "bg-[#1C2541] hover:bg-[#FFD166] text-[#FFD166] hover:text-[#0B132B]"
              }`}
              title={audioState.isPlaying ? "Pausar música ambiente" : "Ouvir trilha natalina suave"}
              aria-label={audioState.isPlaying ? "Pausar" : "Tocar"}
            >
              {audioState.isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Track Info & Equalizer */}
            <div 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 cursor-pointer group truncate"
              title="Clique para abrir controles completos de áudio"
            >
              {/* Animated Mini Equalizer Bars when playing */}
              {audioState.isPlaying ? (
                <div className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5 shrink-0">
                  <span className="w-0.5 bg-[#FFD166] rounded-full animate-[pulse_0.7s_infinite] h-2" />
                  <span className="w-0.5 bg-[#FFD166] rounded-full animate-[pulse_0.5s_infinite] h-3.5" />
                  <span className="w-0.5 bg-[#FFD166] rounded-full animate-[pulse_0.8s_infinite] h-1.5" />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-[#FFD166]/70 group-hover:text-[#FFD166] transition-colors shrink-0" />
              )}

              <div className="flex flex-col text-left truncate">
                <span className="text-[11px] font-bold text-[#FFD166] tracking-wide leading-tight flex items-center gap-1 truncate">
                  {audioState.currentTrack.title}
                  {audioState.isPlaying && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  )}
                </span>
                <span className="text-[9px] text-[#EDF2F4]/60 group-hover:text-[#EDF2F4]/80 transition-colors">
                  {audioState.isPlaying ? "Música em loop" : "Toque para ouvir"}
                </span>
              </div>
            </div>

            {/* Quick Mute, Expand & Minimize Buttons */}
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <button
                onClick={handleToggleMute}
                className="p-1.5 text-[#EDF2F4]/70 hover:text-[#FFD166] rounded-lg transition-colors cursor-pointer"
                title={effectiveVolume === 0 ? "Desmutar som" : "Mutar som"}
                aria-label="Controle de mudo"
              >
                <VolumeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 text-[#EDF2F4]/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Expandir controles de áudio"
                aria-label="Expandir controles"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-[#EDF2F4]/40 hover:text-[#FFD166] rounded-lg transition-colors cursor-pointer"
                title="Minimizar player para não atrapalhar"
                aria-label="Minimizar player"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Detail Controls */
          <div className="space-y-3">
            {/* Header with Title & Collapse */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                <span className="font-cinzel text-[11px] font-bold text-[#FFD166] tracking-wider uppercase">
                  Trilha Sonora Natalina
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-[#EDF2F4]/50 hover:text-[#FFD166] p-1 rounded transition-colors cursor-pointer"
                  title="Minimizar player"
                  aria-label="Minimizar player"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-[#EDF2F4]/50 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Fechar painel expandido"
                  aria-label="Recolher"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current Track Banner */}
            <div className="bg-[#1C2541]/70 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${audioState.isPlaying ? "bg-[#D90429]/30 text-[#FFD166]" : "bg-black/20 text-[#EDF2F4]/40"}`}>
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {audioState.currentTrack.title}
                  </h4>
                  <p className="text-[10px] text-[#FFD166]/80 font-serif italic">
                    {audioState.currentTrack.subtitle}
                  </p>
                </div>
              </div>

              {/* Next Carol Toggle */}
              <button
                onClick={handleNextTrack}
                className="text-[#EDF2F4]/60 hover:text-[#FFD166] p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                title="Alternar para próxima música de Natal"
                aria-label="Próxima música"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Playback & Volume Controls */}
            <div className="space-y-2.5 pt-0.5">
              {/* Play / Pause Toggle Button */}
              <button
                onClick={handleTogglePlay}
                className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  audioState.isPlaying
                    ? "bg-[#1C2541] text-[#EDF2F4] hover:bg-[#253256] border border-white/10"
                    : "bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white border border-[#FFD166]/40"
                }`}
              >
                {audioState.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar Música Ambiente</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tocar Trilha Suave (Loop)</span>
                  </>
                )}
              </button>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2.5 bg-[#060B19]/70 px-2.5 py-1.5 rounded-xl border border-white/5">
                <button
                  onClick={handleToggleMute}
                  className="text-[#EDF2F4]/70 hover:text-[#FFD166] transition-colors cursor-pointer"
                  title={effectiveVolume === 0 ? "Desmutar" : "Mutar"}
                  aria-label="Alternar mudo"
                >
                  <VolumeIcon className="w-3.5 h-3.5 text-[#FFD166]" />
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={effectiveVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-[#1C2541] rounded-lg appearance-none cursor-pointer accent-[#FFD166]"
                  title={`Volume: ${Math.round(effectiveVolume * 100)}%`}
                  aria-label="Controle de volume"
                />

                <span className="text-[10px] font-mono text-[#EDF2F4]/70 w-7 text-right">
                  {Math.round(effectiveVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Subtext info */}
            <div className="text-center pt-0.5">
              <span className="text-[9px] text-[#EDF2F4]/50">
                ✨ Som instrumental relaxante para acompanhar a leitura
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
