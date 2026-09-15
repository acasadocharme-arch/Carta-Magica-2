import { useState, useEffect } from "react";
import { Sparkles, X, Heart, ArrowRight } from "lucide-react";

interface SantaWelcomeToastProps {
  onStartWizard?: (plan?: "free" | "pro") => void;
}

export default function SantaWelcomeToast({ onStartWizard }: SantaWelcomeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("santa_welcome_dismissed");
    if (isDismissed) return;

    // Trigger smoothly exactly 3 seconds after page loads
    const timer = setTimeout(() => {
      setIsRendered(true);
      // Small tick for CSS transition
      setTimeout(() => setIsVisible(true), 50);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("santa_welcome_dismissed", "true");
    setTimeout(() => setIsRendered(false), 400);
  };

  const handleAction = () => {
    handleDismiss();
    if (onStartWizard) {
      onStartWizard("free");
    }
  };

  if (!isRendered) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      id="santa-welcome-toast"
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[340px] sm:max-w-[380px] w-[calc(100vw-2rem)] transition-all duration-500 transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-6 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative bg-[#0B132B]/95 backdrop-blur-md border border-[#FFD166]/50 rounded-3xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(255,209,102,0.2)] text-[#EDF2F4] select-none">
        
        {/* Decorative Top Accent Tag */}
        <div className="absolute -top-3 left-6 bg-[#D90429] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#FFD166]/60 shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FFD166] animate-pulse" />
          <span>Polo Norte Oficial</span>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#EDF2F4]/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Fechar mensagem"
          aria-label="Fechar mensagem de boas-vindas do Papai Noel"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pt-1">
          {/* Festive Santa Badge / Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#780016] border-2 border-[#FFD166] flex items-center justify-center text-2xl shadow-md shrink-0 relative">
            <span>🎅</span>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </span>
          </div>

          {/* Content */}
          <div className="space-y-1.5 pr-4">
            <h4 className="font-cinzel text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>Ho ho ho! Bem-vindo!</span>
            </h4>
            <p className="text-xs text-[#EDF2F4]/80 leading-relaxed font-normal">
              Minha fábrica de duendes já está a todo vapor. Que tal prepararmos juntos uma carta mágica inesquecível para quem você ama?
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
          <button
            onClick={handleDismiss}
            className="text-xs text-[#EDF2F4]/60 hover:text-[#EDF2F4] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Agora não
          </button>
          
          <button
            onClick={handleAction}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#D90429] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-[#FFD166]/40 shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Criar Carta Grátis</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FFD166]" />
          </button>
        </div>

      </div>
    </div>
  );
}
