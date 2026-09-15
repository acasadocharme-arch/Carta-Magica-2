import { useState, useEffect, useRef, type TouchEvent } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Testimonial {
  id: number;
  author: string;
  relation: string;
  city: string;
  content: string;
  badge: string;
  initials: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    author: "Mariana Silveira",
    relation: "Mãe do Theo (5 anos)",
    city: "São Paulo, SP",
    content:
      "A expressão dele quando o Papai Noel mencionou as aulas de natação e o cachorrinho Toby não tem preço. Ele ficou com os olhinhos brilhando! Imprimimos e já guardamos na caixinha de memórias da família.",
    badge: "Experiência Completa PRO",
    initials: "MS",
    rating: 5,
  },
  {
    id: 2,
    author: "Rodrigo Peixoto",
    relation: "Pai da Valentina (7 anos)",
    city: "Curitiba, PR",
    content:
      "Tinha receio de ser um texto genérico, mas a personalização foi emocionante. A opção de baixar como imagem em alta resolução facilitou muito enviar pelo WhatsApp para os avós no mesmo instante.",
    badge: "Carta & WhatsApp",
    initials: "RP",
    rating: 5,
  },
  {
    id: 3,
    author: "Camila & Gustavo",
    relation: "Pais do Lucas (4 anos)",
    city: "Belo Horizonte, MG",
    content:
      "Foi o momento mais lindo da nossa noite. O selo oficial do Polo Norte e o cuidado visual na impressão deram uma sensação de encanto real. Recomendo de olhos fechados a todos os pais.",
    badge: "Carta Impressa A4",
    initials: "CG",
    rating: 5,
  },
  {
    id: 4,
    author: "Juliana Meirelles",
    relation: "Mãe da Helena (6 anos)",
    city: "Porto Alegre, RS",
    content:
      "Ouvir a Helena dizer 'Mamãe, o Papai Noel sabe mesmo de tudo!' foi indescritível. A sensibilidade das palavras e a facilidade de gerar a carta superaram qualquer expectativa.",
    badge: "Família Verificada",
    initials: "JM",
    rating: 5,
  },
  {
    id: 5,
    author: "Fábio Nogueira",
    relation: "Pai do Benício (3 anos)",
    city: "Rio de Janeiro, RJ",
    content:
      "O áudio personalizado foi o ápice. Ver meu filho conversando com o Papai Noel foi pura magia natalina. A nitidez na impressão e no PNG para celular é impecável.",
    badge: "Áudio & Vídeo Oficial",
    initials: "FN",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Discrete auto-advance carousel (pauses on user hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section 
      className="py-20 px-4 relative z-10 overflow-hidden" 
      id="depoimentos"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FFD166]/10 border border-[#FFD166]/30 px-3.5 py-1 rounded-full text-xs font-semibold text-[#FFD166]">
            <span>✨</span>
            <span>Histórias Reais</span>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide">
            O Que Dizem as Famílias
          </h2>

          <p className="text-sm text-[#EDF2F4]/70 max-w-xl mx-auto font-sans">
            Momentos de afeto e surpresa vivenciados por milhares de lares em todo o país.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative bg-[#0B132B]/85 backdrop-blur-md border border-[#FFD166]/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Subtle Background Quote Watermark */}
          <div className="absolute top-6 right-8 opacity-5 pointer-events-none">
            <Quote className="w-28 h-28 text-[#FFD166]" />
          </div>

          {/* Testimonial Content with AnimatePresence */}
          <div className="min-h-[220px] sm:min-h-[190px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Rating & Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#FFD166] text-[#FFD166]"
                      />
                    ))}
                  </div>

                  <span className="text-[11px] font-semibold bg-[#1C2541] text-[#FFD166] border border-[#FFD166]/30 px-2.5 py-0.5 rounded-full">
                    {current.badge}
                  </span>
                </div>

                {/* Quote Body */}
                <blockquote className="text-base sm:text-lg text-[#EDF2F4] font-serif leading-relaxed italic">
                  "{current.content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-2 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D90429] to-[#EF233C] text-white flex items-center justify-center font-bold text-xs border border-[#FFD166]/50 shrink-0">
                    {current.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-cinzel text-sm font-bold text-white truncate">
                        {current.author}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verificado" />
                    </div>
                    <p className="text-xs text-[#EDF2F4]/60 truncate">
                      {current.relation} • {current.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Footer */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/5">
            {/* Dots Indicator */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Indicadores de depoimento">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? "w-7 bg-[#FFD166]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Ir para depoimento ${idx + 1}`}
                  aria-selected={currentIndex === idx}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4] hover:text-[#FFD166] border border-white/10 hover:border-[#FFD166]/40 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4] hover:text-[#FFD166] border border-white/10 hover:border-[#FFD166]/40 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
