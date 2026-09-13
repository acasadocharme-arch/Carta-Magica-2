import { Sparkles, ArrowRight, Heart } from "lucide-react";

interface FinalCTAProps {
  onStartWizard: (plan?: "free" | "pro") => void;
}

export default function FinalCTA({ onStartWizard }: FinalCTAProps) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#D90429]/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-20 space-y-6">
        
        <div className="inline-flex items-center gap-2 bg-[#1C2541] border border-[#FFD166]/40 px-4 py-1.5 rounded-full text-xs text-[#FFD166]">
          <Heart className="w-3.5 h-3.5 text-[#EF233C]" />
          <span>A infância passa rápido, mas a magia fica para sempre</span>
        </div>

        {/* Mandated Headline */}
        <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-white leading-tight">
          Faça deste Natal uma lembrança para a vida toda.
        </h2>

        {/* Mandated Emotional Copy */}
        <div className="space-y-2 max-w-2xl mx-auto text-[#EDF2F4]/80 text-sm sm:text-base">
          <p className="font-medium text-[#FFD166]">
            Imagine a reação dele ao ouvir o próprio nome na voz do Papai Noel.
          </p>
          <p>
            Uma lembrança que pode ser guardada para sempre em áudio, na tela e em papel. Crie gratuitamente. Faça o upgrade somente se quiser a experiência completa.
          </p>
        </div>

        {/* Mandated Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onStartWizard("free")}
            className="w-full sm:w-auto bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-10 py-4 rounded-full shadow-lg border border-[#FFD166]/50 flex items-center justify-center gap-3 text-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer gold-glow"
            id="final-cta-btn"
          >
            <Sparkles className="w-5 h-5 text-[#FFD166]" />
            <span>Criar minha carta grátis</span>
            <ArrowRight className="w-4 h-4 text-[#FFD166]" />
          </button>
        </div>

        <p className="text-xs text-[#EDF2F4]/50">
          Leva apenas 2 minutos • Sem necessidade de dados bancários para começar.
        </p>

      </div>
    </section>
  );
}
