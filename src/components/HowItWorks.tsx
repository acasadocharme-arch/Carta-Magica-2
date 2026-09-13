import { MessageSquareText, Wand2, Gift, Truck } from "lucide-react";

interface HowItWorksProps {
  onStartWizard: () => void;
  onOpenLogistics: () => void;
}

export default function HowItWorks({ onStartWizard, onOpenLogistics }: HowItWorksProps) {
  const steps = [
    {
      num: "1",
      title: "Conte-nos sobre a criança",
      desc: "Em menos de 2 minutos, informe o nome, idade, cidade, o presente que ela pediu e as conquistas ou desafios superados no ano.",
      icon: MessageSquareText,
      tag: "Rápido no Celular"
    },
    {
      num: "2",
      title: "A IA cria uma mensagem especial do Papai Noel",
      desc: "Nossa tecnologia combina o espírito de Natal com os detalhes do seu filho, gerando uma carta calorosa, única e tocante.",
      icon: Wand2,
      tag: "Magia Inteligente"
    },
    {
      num: "3",
      title: "Entregue a surpresa e viva o momento",
      desc: "Compartilhe a página interativa de abertura, reproduza o áudio com a voz do Papai Noel ou imprima em formato de carta nobre A4.",
      icon: Gift,
      tag: "Momento Inesquecível"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-[#0B132B]/80 border-y border-[#FFD166]/15 px-4 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3 py-1 rounded-full border border-[#FFD166]/30">
            Simples, Emocionante & Confiável
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white">
            Como Funciona a Carta Mágica
          </h2>
          <p className="text-sm sm:text-base text-[#EDF2F4]/70 leading-relaxed">
            Criamos uma jornada sem fricção para que pais e mães possam preparar uma lembrança natalina profunda e genuína.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#1C2541]/50 border border-white/10 hover:border-[#FFD166]/50 rounded-3xl p-8 relative shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#9B021A] flex items-center justify-center text-white font-cinzel font-black text-2xl shadow-md border border-[#FFD166]/30">
                      {step.num}
                    </div>
                    <span className="text-[11px] font-semibold text-[#FFD166] bg-[#060B19]/80 px-2.5 py-1 rounded-full border border-white/5">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="font-cinzel text-xl font-bold text-white mb-3 group-hover:text-[#FFD166] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#EDF2F4]/70 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs text-[#FFD166]">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">100% Supervisionado por Você</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* International Postal Delivery Banner Card */}
        <div className="bg-gradient-to-r from-[#1C2541] via-[#2A385B] to-[#1C2541] rounded-3xl p-6 sm:p-8 border border-[#FFD166]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#D90429] flex items-center justify-center text-white shrink-0 border border-[#FFD166]/60 shadow-md mx-auto md:mx-0">
              <Truck className="w-7 h-7 text-[#FFD166]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFD166] uppercase tracking-wider mb-1">
                <span>Deseja receber a carta pelos correios?</span>
              </div>
              <h4 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                Envio Físico Internacional Direto do Polo Norte
              </h4>
              <p className="text-xs text-[#EDF2F4]/75 max-w-xl">
                Além da versão digital imediata, oferecemos a opção de impressão em papel linho 180g com selo de cera vermelha artesanal e carimbo postal com rastreamento para o Brasil e exterior.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenLogistics}
              className="bg-[#060B19] hover:bg-[#0B132B] text-[#FFD166] border border-[#FFD166]/40 text-xs font-bold px-4 py-3 rounded-full transition-colors cursor-pointer"
            >
              Simular Prazo & Frete
            </button>
            <button
              onClick={onStartWizard}
              className="bg-[#D90429] hover:bg-[#EF233C] text-white text-xs font-bold px-5 py-3 rounded-full shadow-md transition-colors cursor-pointer"
            >
              Criar Carta Agora
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
