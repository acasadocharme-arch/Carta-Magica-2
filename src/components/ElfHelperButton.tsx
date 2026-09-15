import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, X, Check, Wand2 } from "lucide-react";
import { fetchElfSuggestionsAPI } from "../services/api";

interface ElfHelperButtonProps {
  fieldName: "achievements" | "learningMilestone" | "favoriteActivity" | "specialMention" | "giftRequest" | "parentNotes";
  fieldLabel: string;
  childName?: string;
  age?: number;
  city?: string;
  currentValue?: string;
  onSelectSuggestion: (text: string) => void;
}

export default function ElfHelperButton({
  fieldName,
  fieldLabel,
  childName = "",
  age,
  city = "",
  currentValue = "",
  onSelectSuggestion,
}: ElfHelperButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const loadSuggestions = async () => {
    setLoading(true);
    setAppliedIndex(null);
    try {
      const results = await fetchElfSuggestionsAPI({
        field: fieldName,
        childName,
        age,
        city,
      });
      if (results && results.length > 0) {
        setSuggestions(results);
      }
    } catch (err) {
      console.error("Failed to load elf suggestions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && suggestions.length === 0) {
      loadSuggestions();
    }
  };

  const handleApply = (text: string, index: number) => {
    onSelectSuggestion(text);
    setAppliedIndex(index);
    setTimeout(() => {
      setAppliedIndex(null);
      setIsOpen(false);
    }, 700);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Mandated "Ajuda do Elfo" Button */}
      <button
        type="button"
        onClick={handleToggle}
        id={`elf-helper-btn-${fieldName}`}
        aria-expanded={isOpen}
        title="Ver sugestões mágicas geradas por IA para este campo"
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm ${
          isOpen
            ? "bg-[#D90429] text-white border border-[#FFD166] shadow-[0_0_10px_rgba(255,209,102,0.35)]"
            : "bg-[#1C2541]/90 hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/35 hover:border-[#FFD166]/70 hover:shadow-[0_0_8px_rgba(255,209,102,0.2)]"
        }`}
      >
        <span className="text-xs group-hover:scale-110 transition-transform">🧝</span>
        <span className="font-semibold tracking-wide">Ajuda do Elfo</span>
        <Sparkles className="w-3 h-3 text-[#FFD166] animate-pulse" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={`Sugestões do Elfo para ${fieldLabel}`}
          className="absolute right-0 top-full mt-2 w-72 sm:w-88 max-w-[90vw] bg-[#0B132B] border-2 border-[#FFD166]/60 rounded-2xl shadow-2xl p-4 z-40 text-left animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          style={{ boxShadow: "0 10px 30px -5px rgba(0,0,0,0.8), 0 0 15px rgba(255,209,102,0.2)" }}
        >
          {/* Popover Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D90429]/25 border border-[#FFD166]/40 flex items-center justify-center text-sm shadow-inner">
                🧝
              </div>
              <div>
                <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  <span>Oficina do Elfo</span>
                  <span className="bg-[#1C2541] text-[#FFD166] text-[9px] font-sans px-1.5 py-0.5 rounded border border-[#FFD166]/30">
                    IA Noel
                  </span>
                </h4>
                <p className="text-[10px] text-[#EDF2F4]/70">
                  {childName
                    ? `Ideias personalizadas para ${childName}${age ? ` (${age} anos)` : ""}`
                    : "Ideias mágicas para inspirar seu texto"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#EDF2F4]/50 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar popover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Popover Content */}
          {loading ? (
            <div className="py-6 px-2 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full border-2 border-[#FFD166]/30 border-t-[#FFD166] animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-xs">✨</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#FFD166]">
                  Consultando os duendes mágicos...
                </p>
                <p className="text-[10px] text-[#EDF2F4]/60 mt-0.5">
                  Criando sugestões afetuosas com inteligência artificial
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-[#EDF2F4]/60 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Clique para usar no campo:</span>
                <span className="text-[#FFD166]">4 sugestões</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {suggestions.map((suggestion, idx) => {
                  const isApplied = appliedIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApply(suggestion, idx)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start justify-between gap-2 group ${
                        isApplied
                          ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                          : "bg-[#060B19]/90 hover:bg-[#1C2541] border-white/10 hover:border-[#FFD166]/60 text-[#EDF2F4]/90 hover:text-white"
                      }`}
                    >
                      <span className="flex-1 leading-snug">
                        {suggestion}
                      </span>
                      <span className="shrink-0 mt-0.5">
                        {isApplied ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-1.5 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            Aplicado
                          </span>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[#FFD166] bg-[#FFD166]/10 px-1.5 py-0.5 rounded border border-[#FFD166]/30 transition-opacity">
                            Usar
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Popover Footer with Regenerate Button */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={loadSuggestions}
                  disabled={loading}
                  className="text-[10px] font-bold text-[#FFD166] hover:text-[#FFE194] flex items-center gap-1.5 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  <span>Gerar outras ideias com IA</span>
                </button>

                <span className="text-[9px] text-[#EDF2F4]/45">
                  Você pode editar depois
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
