import { useState } from "react";
import { Lock, Sparkles, Heart } from "lucide-react";
import { getSecretMessageAPI } from "../services/api";
import confetti from "canvas-confetti";

interface SecretMessageCardProps {
  letterId: string;
  childName: string;
  achievements?: string;
  parentNotes?: string;
  initialSecret?: string;
  isPro: boolean;
  onUpgradeToPro?: () => void;
}

export default function SecretMessageCard({
  letterId,
  childName,
  achievements,
  parentNotes,
  initialSecret,
  isPro,
  onUpgradeToPro,
}: SecretMessageCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [secretText, setSecretText] = useState(initialSecret || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleReveal = async () => {
    if (!isPro) {
      if (onUpgradeToPro) onUpgradeToPro();
      return;
    }

    if (secretText) {
      setIsRevealed(true);
      return;
    }

    setIsLoading(true);
    try {
      const msg = await getSecretMessageAPI(letterId, childName, achievements, parentNotes);
      setSecretText(msg);
      setIsRevealed(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FFD166", "#EF233C", "#FFFFFF"],
      });
    } catch {
      setSecretText(`Psst... ${childName}! Os duendes me contaram em segredo que o seu abraço tem o poder de curar qualquer tristeza. Guarde esse segredo: você é o maior orgulho do Polo Norte! ✨`);
      setIsRevealed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1C2541] via-[#0B132B] to-[#1C2541] border-2 border-[#FFD166]/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background sparkle accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD166]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#D90429]/30 text-[#FFD166] flex items-center justify-center border border-[#FFD166]/40 shrink-0">
            {isRevealed ? <Sparkles className="w-6 h-6 text-[#FFD166] animate-spin" /> : <Lock className="w-6 h-6 text-[#FFD166]" />}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                🔐 Mensagem Secreta do Papai Noel
              </h4>
              <span className="bg-[#D90429] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FFD166]/40">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#EDF2F4]/70 mt-0.5">
              Um recado confidencial em sussurro que o Noel só revela para corações especiais.
            </p>
          </div>
        </div>

        <button
          onClick={handleReveal}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-[#FFD166] shrink-0"
        >
          {isLoading ? (
            <span>Consultando duendes...</span>
          ) : isRevealed ? (
            <>
              <Heart className="w-4 h-4 text-[#FFD166] fill-[#FFD166]" />
              <span>Segredo Revelado</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FFD166]" />
              <span>{isPro ? "Abrir Mensagem Secreta" : "Desbloquear no PRO"}</span>
            </>
          )}
        </button>
      </div>

      {/* Revealed Secret Box */}
      {isRevealed && secretText && (
        <div className="mt-5 pt-4 border-t border-[#FFD166]/30 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#060B19]/90 border border-[#FFD166]/60 rounded-xl p-4 sm:p-5 relative">
            <span className="text-[10px] font-cinzel text-[#FFD166] uppercase tracking-wider block mb-1">
              ✨ Confidencial do Polo Norte para {childName}:
            </span>
            <p className="font-serif italic text-sm sm:text-base text-white/95 leading-relaxed">
              "{secretText}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
