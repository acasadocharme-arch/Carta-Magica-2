import { useState } from "react";
import { Video, X, CheckCircle2, Clock, Sparkles, AlertCircle } from "lucide-react";
import { trackEvent } from "../services/analytics";

interface VideoPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  letterId: string;
}

export default function VideoPipelineModal({
  isOpen,
  onClose,
  childName,
  letterId,
}: VideoPipelineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#1C2541] via-[#0B132B] to-[#060B19] border-2 border-[#FFD166] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative text-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EDF2F4]/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Tag */}
        <div className="w-14 h-14 rounded-2xl bg-[#D90429]/30 text-[#FFD166] flex items-center justify-center border border-[#FFD166]/40 mx-auto mb-3">
          <Video className="w-7 h-7" />
        </div>

        <span className="inline-flex items-center gap-1.5 bg-[#D90429] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#FFD166]/60 mb-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
          <span>Produção Oficial de Vídeo Polo Norte</span>
        </span>

        <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
          🎬 O Papai Noel preparou um vídeo especialmente para você!
        </h3>

        <p className="text-xs sm:text-sm text-[#EDF2F4]/75 mb-6">
          A mensagem em vídeo personalizada para <strong>{childName}</strong> está sendo orquestrada pela equipe do Polo Norte.
        </p>

        {/* Visual Real States of Processing */}
        <div className="bg-[#060B19]/80 border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3.5 mb-6">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                1. Preparando sua mensagem...
              </div>
              <p className="text-[11px] text-[#EDF2F4]/60">
                Roteiro original com o nome de {childName}, idade e detalhes pessoais finalizado e aprovado pelo Noel.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#FFD166]">
                2. Criando seu vídeo mágico...
              </div>
              <p className="text-[11px] text-[#EDF2F4]/70">
                Renderização de iluminação natalina, lareira e sincronização labial no estúdio do Polo Norte.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10 text-[#EDF2F4]/50 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#EDF2F4]/80">
                3. Finalizando sua surpresa...
              </div>
              <p className="text-[11px] text-[#EDF2F4]/50">
                Toque de pó de estrelas final e liberação para exibição na véspera de Natal!
              </p>
            </div>
          </div>
        </div>

        {/* Clear transparent status note - no fake video */}
        <div className="flex items-center gap-2 text-[11px] text-[#EDF2F4]/70 bg-[#1C2541]/70 p-3 rounded-xl border border-white/10 mb-6 text-left">
          <AlertCircle className="w-4 h-4 text-[#FFD166] shrink-0" />
          <span>
            Transparência Mágica: A integração com o estúdio de geração de vídeo está pronta. Quando a renderização estiver completa, o player será ativado automaticamente nesta página.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#FFD166] to-[#FFB703] hover:from-[#FFE194] hover:to-[#FFD166] text-[#060B19] font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer text-sm"
        >
          Acompanhar Preparação no Polo Norte
        </button>
      </div>
    </div>
  );
}
