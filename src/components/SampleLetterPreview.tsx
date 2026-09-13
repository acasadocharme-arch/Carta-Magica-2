import { useState } from "react";
import { Volume2, VolumeX, Sparkles, Printer, CheckCircle } from "lucide-react";
import { speakSantaMessage } from "../services/api";

interface SampleLetterPreviewProps {
  onStartWizard: (plan?: "free" | "pro") => void;
}

export default function SampleLetterPreview({ onStartWizard }: SampleLetterPreviewProps) {
  const [activeTab, setActiveTab] = useState<"pro" | "free">("pro");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioStopper, setAudioStopper] = useState<{ stop: () => void } | null>(null);

  const sampleProText = `Ho Ho Ho! Olá, meu querido Lucas!

Daqui do alto da montanha gelada do Polo Norte, onde a neve fofa cobre as pequenas cabanas de madeira e o céu reluz em tons de esmeralda com a Aurora Boreal, eu peguei minha pena mágica de ouro para escrever especialmente para você aí em São Paulo!

O Grande Livro Dourado das Boas Ações me mostrou algo que encheu meu coração de felicidade: aos 6 anos de idade, você teve a bravura de aprender a andar de bicicleta sem rodinhas e cuidou com tanto carinho do gatinho Pipoca! Que orgulho imenso, Lucas! Os duendes artesãos na fábrica de brinquedos e a Mamãe Noel aplaudiram quando contei a novidade. Pequenos gestos de coragem e amor fazem o mundo brilhar muito mais forte.

O Rudolph, com seu nariz vermelho cintilante, já conferiu na lista oficial o seu pedido: o dinossauro robô que acende os olhos. Ele e todas as oito renas estão treinando os voos mágicos nas noites frias para garantir que o trenó chegue veloz e suave sobre a sua casa.

Seus pais têm um orgulho gigantesco de você e me contaram o quanto te amam. Continue sendo esse menino gentil, curioso e corajoso.

Na noite mágica de Natal, estarei sobrevoando sua janela. Deixe uma cenourinha para as renas se puder!

Com todo o meu carinho e pó de estrelas,
Com carinho, Papai Noel 🎅`;

  const sampleFreeText = `Ho Ho Ho! Olá, meu querido Lucas!

Aqui do Polo Norte, observei que você completou 6 anos e que aí em São Paulo você aprendeu a andar de bicicleta sem rodinhas e foi muito carinhoso este ano! Que notícia maravilhosa para aquecer o coração deste velhinho.

Eu e os duendes lemos a sua cartinha sobre o seu pedido do dinossauro robô. Estamos trabalhando com muita alegria na oficina mágica preparando os presentes de todas as crianças especiais como você.

Continue sendo uma criança cheia de luz, alegria e amor para com sua família!

Com carinho, Papai Noel 🎅`;

  const currentText = activeTab === "pro" ? sampleProText : sampleFreeText;

  const handleToggleAudio = () => {
    if (isPlayingAudio && audioStopper) {
      audioStopper.stop();
      setIsPlayingAudio(false);
      return;
    }

    const stopper = speakSantaMessage(
      currentText,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
    setAudioStopper(stopper);
  };

  return (
    <section id="amostra" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3 py-1 rounded-full border border-[#FFD166]/30">
            Transparência & Qualidade Emocional
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white">
            Veja a Carta que seu Filho Receberá
          </h2>
          <p className="text-xs sm:text-sm text-[#EDF2F4]/70">
            Compare o acabamento detalhado do plano PRO com a versão gratuita e ouça a narração em áudio.
          </p>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-[#0B132B] p-2.5 rounded-2xl border border-white/10">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isPlayingAudio && audioStopper) audioStopper.stop();
                setActiveTab("pro");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "pro"
                  ? "bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white shadow-md border border-[#FFD166]/40"
                  : "text-[#EDF2F4]/70 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Experiência PRO (Recomendada)</span>
            </button>
            <button
              onClick={() => {
                if (isPlayingAudio && audioStopper) audioStopper.stop();
                setActiveTab("free");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "free"
                  ? "bg-[#1C2541] text-[#FFD166] border border-[#FFD166]/30"
                  : "text-[#EDF2F4]/70 hover:text-white"
              }`}
            >
              Versão Gratuita
            </button>
          </div>

          {/* Audio Action Button */}
          <button
            onClick={handleToggleAudio}
            className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] text-xs font-bold px-4 py-2 rounded-xl border border-[#FFD166]/40 flex items-center gap-2 transition-all cursor-pointer"
            id="sample-listen-audio-btn"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-[#EF233C]" />
                <span>Pausar Voz do Noel</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#FFD166]" />
                <span>Ouvir Voz do Papai Noel 🎅</span>
              </>
            )}
          </button>
        </div>

        {/* Parchment Letter Demonstration */}
        <div className="relative parchment-bg text-[#1C2541] rounded-3xl p-8 sm:p-14 border-4 border-[#FFD166] magical-shadow">
          
          {/* North Pole Wax Seal Stamp */}
          <div className="absolute -top-6 -right-4 wax-seal w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-[#FFD166] text-[#FFD166] shadow-lg">
            <span className="font-cinzel text-[8px] font-black uppercase text-center leading-tight">
              POLO<br/>NORTE
            </span>
            <span className="text-[10px] font-bold">OFICIAL</span>
          </div>

          {/* Header & Postage Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#1C2541]/15 pb-6 mb-6 gap-3">
            <div>
              <span className="font-cinzel text-xs font-black tracking-widest text-[#9B021A] uppercase block">
                VIA TRENÓ AÉREO • POLO NORTE
              </span>
              <span className="text-xs text-[#1C2541]/70 font-serif">
                Destinatário: Lucas • 6 anos • São Paulo, SP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#9B021A]/10 text-[#9B021A] font-bold px-3 py-1 rounded-full border border-[#9B021A]/20">
                {activeTab === "pro" ? "⭐ Formato Premium Pro" : "Formato Básico"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="font-serif text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line text-[#1C2541]">
            {currentText}
          </div>

          {/* Footer Signature */}
          <div className="mt-10 pt-6 border-t border-[#1C2541]/15 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-cinzel text-[#1C2541]/60 uppercase tracking-wider block">
                Carimbo de Autenticidade Polar
              </span>
              <span className="text-xs font-bold text-[#9B021A]">
                Chancela Oficial de Boas Ações
              </span>
            </div>
            <div className="text-center sm:text-right">
              <span className="font-handwriting text-3xl sm:text-4xl text-[#9B021A] font-bold block">
                Papai Noel
              </span>
              <span className="text-[10px] text-[#1C2541]/50">Oficina Central de Brinquedos</span>
            </div>
          </div>

        </div>

        {/* Benefits bar below preview */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#EDF2F4]/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Papel texturizado de alta qualidade</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-[#FFD166]" />
            <span>Pronto para imprimir em folha A4 no Pro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#FFD166]" />
            <span>Player de áudio exclusivo na página da criança</span>
          </div>
        </div>

        {/* CTA to start */}
        <div className="text-center mt-8">
          <button
            onClick={() => onStartWizard(activeTab)}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-md border border-[#FFD166]/40 cursor-pointer"
          >
            Personalizar a Carta do Meu Filho Agora
          </button>
        </div>

      </div>
    </section>
  );
}
