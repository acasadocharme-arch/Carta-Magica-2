import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Como o Papai Noel sabe os detalhes e conquistas do meu filho?",
      a: "Você preenche um formulário rápido (em menos de 2 minutos) contando os pontos marcantes do ano dele: conquistas, aprendizados, o presente desejado e até uma frase especial dos pais. Nossa inteligência artificial costura tudo isso com lirismo natalino, transmitindo a sensação de que o Papai Noel realmente acompanhou cada passo dele do Polo Norte."
    },
    {
      q: "É seguro para os dados da criança?",
      a: "Totalmente seguro! Aplicamos com rigor o princípio da minimização de dados. Jamais solicitamos endereço residencial completo, escola, fotos obrigatórias ou documentos civis. Apenas o nome, idade e cidade básica são utilizados para o texto afetuoso. Além disso, a criação só é permitida mediante confirmação de um responsável adulto."
    },
    {
      q: "Qual a diferença entre a versão Gratuita e a Pro?",
      a: "No plano Gratuito (R$ 0), você pode gerar e ler a carta digital na tela sem pagar nada, além de compartilhar o link. No plano Pro (R$ 39,99), você recebe uma carta muito mais rica e aprofundada, áudio com voz emocionante do Papai Noel, arquivo PDF ilustrado de alta definição pronto para imprimir em A4, página com efeito surpresa e sem marca d'água."
    },
    {
      q: "Como recebo o PDF ilustrado e o Áudio?",
      a: "O acesso é imediato logo após a geração ou confirmação da Experiência Pro. Você pode ouvir o áudio diretamente pelo celular, tablet ou computador, e baixar o PDF em alta definição para imprimir na sua impressora caseira ou gráfica rápida."
    },
    {
      q: "Existe opção de entrega física pelos correios?",
      a: "Sim! Para famílias que desejam que a criança receba uma carta física pelo correio, oferecemos a opção de envio postal internacional em pergaminho nobre 180g, com selo de cera vermelha lacrado à mão e carimbo do Polo Norte com código de rastreamento."
    },
    {
      q: "Como funciona a estrutura de vídeo do Papai Noel?",
      a: "A plataforma Carta Mágica já possui toda a arquitetura e estados de processamento preparados para integração de vídeo avatar com IA. No momento, o recurso é sinalizado como 'Em Breve' para que os pais recebam a atualização assim que a renderização hiper-realista for liberada."
    }
  ];

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#FFD166] bg-[#1C2541] px-3 py-1 rounded-full border border-[#FFD166]/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-xs sm:text-sm text-[#EDF2F4]/70">
            Tudo o que você precisa saber para criar a surpresa de Natal perfeita.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0B132B] border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-white hover:text-[#FFD166] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#FFD166] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#EDF2F4]/80 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
