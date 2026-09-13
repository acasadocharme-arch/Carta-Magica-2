import { X, Sparkles, Check, Star, ShieldCheck } from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export default function PaywallModal({
  isOpen,
  onClose,
  onProceedToCheckout,
}: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#1C2541] via-[#0B132B] to-[#060B19] border-2 border-[#FFD166] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative magical-shadow overflow-hidden text-center">
        
        {/* Decorative soft glows */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D90429]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#FFD166]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EDF2F4]/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Tag */}
        <span className="inline-flex items-center gap-1.5 bg-[#D90429] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#FFD166]/60 mb-3 shadow-md">
          <Star className="w-3.5 h-3.5 fill-[#FFD166] text-[#FFD166]" />
          <span>Oferta Exclusiva de Natal</span>
        </span>

        {/* Mandated Headline */}
        <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
          Quer transformar esta carta em uma experiência inesquecível?
        </h3>

        <p className="text-xs sm:text-sm text-[#EDF2F4]/75 mb-6 max-w-sm mx-auto">
          Dê vida às palavras do Papai Noel com áudio narrado e arquivo nobre pronto para impressão.
        </p>

        {/* Mandated Benefits checklist */}
        <div className="text-left bg-[#060B19]/85 p-4 sm:p-5 rounded-2xl border border-white/10 mb-6 space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-white">
            <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
            <span><strong>PDF ilustrado em alta resolução</strong> pronto para imprimir em folha A4</span>
          </div>
          <div className="flex items-center gap-2.5 text-white">
            <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
            <span><strong>Áudio personalizado</strong> com voz temática e calorosa de Papai Noel</span>
          </div>
          <div className="flex items-center gap-2.5 text-white">
            <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
            <span><strong>Página exclusiva da criança</strong> com animação surpresa de abertura</span>
          </div>
          <div className="flex items-center gap-2.5 text-white">
            <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
            <span><strong>Experiência sem marca d’água</strong> com carimbos de luxo do Polo Norte</span>
          </div>
          <div className="flex items-center gap-2.5 text-white">
            <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
            <span>Estrutura preparada para vídeo personalizado do Papai Noel</span>
          </div>
        </div>

        {/* Mandated Price */}
        <div className="mb-6">
          <span className="text-xs text-[#EDF2F4]/50 line-through">De R$ 79,90</span>
          <div className="text-3xl sm:text-4xl font-cinzel font-black text-white">
            Por apenas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE194] via-[#FFD166] to-[#FFB703]">
              R$ 39,99
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Pagamento único • Acesso vitalício para toda a família
          </span>
        </div>

        {/* Mandated CTA */}
        <button
          onClick={onProceedToCheckout}
          className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 px-6 rounded-2xl border border-[#FFD166] shadow-lg flex items-center justify-center gap-2 text-base transition-all transform hover:scale-[1.02] cursor-pointer gold-glow"
          id="paywall-unlock-btn"
        >
          <Sparkles className="w-5 h-5 text-[#FFD166]" />
          <span>✨ Liberar Experiência Mágica PRO</span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#EDF2F4]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Checkout criptografado 256-bit • Liberação imediata</span>
        </div>

        <button
          onClick={onClose}
          className="mt-3 text-xs text-[#EDF2F4]/50 hover:text-white underline cursor-pointer"
        >
          Continuar na versão básica gratuita
        </button>

      </div>
    </div>
  );
}
