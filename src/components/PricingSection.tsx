import { Check, Sparkles, Star, ShieldCheck, Heart, Truck } from "lucide-react";

interface PricingSectionProps {
  onStartWizard: (plan: "free" | "pro") => void;
  onOpenLogistics: () => void;
}

export default function PricingSection({ onStartWizard, onOpenLogistics }: PricingSectionProps) {
  return (
    <section id="planos" className="pt-24 pb-32 sm:pb-40 bg-[#0B132B]/60 border-t border-[#FFD166]/15 px-4 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3.5 py-1 rounded-full border border-[#FFD166]/30">
            Transparência Absoluta
          </span>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-white">
            Planos & Preços
          </h2>
          <p className="text-sm sm:text-base text-[#EDF2F4]/75 max-w-xl mx-auto">
            Experimente gratuitamente sem compromisso ou libere a experiência mágica completa para transformar o Natal do seu filho em uma lembrança eterna.
          </p>
        </div>

        {/* 2-Column Pricing Grid (Mandated only 2 plans) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto mb-16">
          
          {/* PLANO GRATUITO */}
          <div className="bg-[#0B132B] border border-white/20 hover:border-white/40 rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 shadow-xl relative z-10">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EDF2F4]/60 block mb-1">
                    Para Começar
                  </span>
                  <h3 className="font-cinzel text-2xl font-bold text-white">
                    Plano Gratuito
                  </h3>
                </div>
                <span className="bg-emerald-950 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  100% Grátis
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#EDF2F4]/70 mb-6 leading-relaxed">
                Permite ao usuário criar gratuitamente uma experiência básica e experimentar o produto antes de qualquer compra.
              </p>

              <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="font-cinzel text-4xl sm:text-5xl font-black text-white">
                    R$ 0
                  </span>
                </div>
                <span className="text-[11px] text-[#EDF2F4]/50 mt-1 block">
                  Sem necessidade de cartão • Acesso imediato
                </span>
              </div>

              {/* Free Features list */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-[#EDF2F4]/80 mb-8">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Criação de 1 carta personalizada</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Nome da criança, idade e cidade integrados</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Informações e conquistas fornecidas pelos pais</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Referência carinhosa ao pedido de Natal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Carta digital com visual natalino elegante</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Prévia da carta na tela</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Link para visualização e compartilhamento</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onStartWizard("free")}
              className="w-full bg-[#1C2541] hover:bg-[#2A385B] text-white font-bold py-3.5 px-6 rounded-2xl border border-white/20 transition-all text-sm cursor-pointer mt-6 shadow-md"
              id="pricing-free-btn"
            >
              Criar Minha Carta Grátis
            </button>
          </div>

          {/* PLANO PRO - MANDATED HIGHLIGHT */}
          <div className="bg-gradient-to-b from-[#1C2541] via-[#0B132B] to-[#060B19] border-2 border-[#FFD166] rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative magical-shadow transform md:-translate-y-3">
            
            {/* Top Recommended Tag */}
            <div className="absolute -top-4 right-8 bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full border border-[#FFD166] shadow-md flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-[#FFD166] text-[#FFD166]" />
              <span>Opção Recomendada</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FFD166] block mb-1">
                    Experiência Completa & Emocionante
                  </span>
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                    Experiência Mágica PRO
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#EDF2F4]/80 mb-6 leading-relaxed">
                Tudo o que seu filho precisa para viver a magia pura: carta aprofundada, áudio com a voz do Papai Noel e PDF de luxo para impressão.
              </p>

              <div className="mb-8 pb-6 border-b border-[#FFD166]/30">
                <div className="flex items-baseline gap-2">
                  <span className="font-cinzel text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE194] via-[#FFD166] to-[#FFB703]">
                    R$ 39,99
                  </span>
                  <span className="text-xs text-[#EDF2F4]/50 line-through">
                    R$ 79,90
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                  Pagamento único • Processado via Asaas (Pix ou Cartão)
                </span>
              </div>

              {/* Pro Features list */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-white mb-8">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>Tudo do plano gratuito</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>Carta premium totalmente personalizada</strong> com maior profundidade emocional</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>PDF ilustrado em alta qualidade</strong> pronto para impressão tamanho A4</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>Áudio personalizado</strong> com voz temática e calorosa de Papai Noel</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>Página exclusiva da criança</strong> com animação surpresa de abertura de carta</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>Compartilhamento por WhatsApp</strong> fácil para familiares</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span><strong>Experiência sem marca d’água</strong> e acabamento de luxo</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#EDF2F4]/80">
                  <div className="w-4 h-4 rounded-full bg-[#FFD166]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#FFD166]" />
                  </div>
                  <span>Estrutura preparada para geração de vídeo personalizado do Papai Noel</span>
                </li>
              </ul>
            </div>

            {/* Mandated Pro CTA */}
            <button
              onClick={() => onStartWizard("pro")}
              className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 px-6 rounded-2xl border border-[#FFD166] shadow-lg flex items-center justify-center gap-2 text-base transition-all transform hover:scale-[1.02] cursor-pointer gold-glow"
              id="pricing-pro-btn"
            >
              <Sparkles className="w-4 h-4 text-[#FFD166]" />
              <span>✨ Criar minha experiência PRO</span>
            </button>
          </div>

        </div>

        {/* Optional Addon for Physical International Postage */}
        <div className="max-w-4xl mx-auto bg-[#060B19]/80 border border-[#FFD166]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D90429]/20 text-[#FFD166] flex items-center justify-center border border-[#FFD166]/30 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#FFD166] uppercase tracking-wider block mb-0.5">
                Opcional para quem quer tocar a magia com as próprias mãos
              </span>
              <h4 className="font-cinzel text-lg font-bold text-white">
                Envio Físico Postal com Selo de Cera Autêntico
              </h4>
              <p className="text-xs text-[#EDF2F4]/70 mt-1 max-w-xl">
                Você pode solicitar o envio postal internacional da carta em pergaminho oficial 180g, com lacre de cera vermelha fundida artesanalmente e carimbo do Polo Norte.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogistics}
            className="shrink-0 bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/40 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Ver Detalhes do Envio Postal
          </button>
        </div>

      </div>
    </section>
  );
}
