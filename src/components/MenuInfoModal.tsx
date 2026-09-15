import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Eye,
  CreditCard,
  Truck,
  HelpCircle,
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Heart,
  ChevronDown,
  Mail,
  MapPin,
  Clock,
  Search,
  Gift,
  Wand2,
  MessageSquareText,
  Share2
} from "lucide-react";
import { speakSantaMessage, calculateShippingAPI } from "../services/api";

export type MenuTab = "como-funciona" | "exemplo" | "planos" | "rastreio" | "faq";

interface MenuInfoModalProps {
  isOpen: boolean;
  activeTab: MenuTab | null;
  onClose: () => void;
  onSelectTab: (tab: MenuTab) => void;
  onStartWizard: (plan?: "free" | "pro") => void;
}

export default function MenuInfoModal({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
  onStartWizard,
}: MenuInfoModalProps) {
  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Audio player state for sample tab
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioStopper, setAudioStopper] = useState<{ stop: () => void } | null>(null);
  const [samplePlan, setSamplePlan] = useState<"pro" | "free">("pro");

  // FAQ open index state
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  // Shipping calculator state for logistics tab
  const [shippingZip, setShippingZip] = useState("01310-100");
  const [shippingCountry, setShippingCountry] = useState("Brasil");
  const [isSimulatingShipping, setIsSimulatingShipping] = useState(false);
  const [shippingData, setShippingData] = useState<{
    service: string;
    cost: number;
    estimatedDays: string;
    packaging: string;
    trackingAvailable: boolean;
  } | null>(null);

  // Stop audio on tab change or modal close
  useEffect(() => {
    if (!isOpen && audioStopper) {
      audioStopper.stop();
      setIsPlayingAudio(false);
    }
  }, [isOpen, audioStopper]);

  if (!isOpen || !activeTab) return null;

  // Sample letter texts
  const sampleProText = `Ho Ho Ho! Olá, meu querido Lucas!

Daqui do alto da montanha gelada do Polo Norte, onde as luzes da Aurora Boreal dançam no céu estrelado, olhei através do meu grande telescópio de cristal dourado e avistei você aí em São Paulo!

Você nem imagina o quanto os duendes artesãos e a Mamãe Noel vibraram quando souberam da sua grande coragem neste ano: aprender a andar de bicicleta sem rodinhas e cuidar do gatinho Pipoca com tanto carinho! É preciso ter um coração muito valente e gentil. Pequenos gestos de amor fazem a verdadeira magia do Natal brilhar.

O Rudolph, com seu nariz vermelho brilhante, já conferiu na lista oficial o seu pedido: o dinossauro robô que acende os olhos. Ele e todas as oito renas estão treinando voos mágicos nas noites frias para garantir que o trenó chegue veloz e suave sobre a sua casa.

Seus pais têm um orgulho gigantesco de você e me contaram o quanto te amam. Continue sendo esse menino carinhoso, curioso e corajoso.

Com todo o meu amor e pó de estrelas,
Com carinho, Papai Noel 🎅`;

  const sampleFreeText = `Ho Ho Ho! Olá, meu querido Lucas!

Aqui do Polo Norte, fiquei muito feliz em saber que você completou 6 anos e mora na linda cidade de São Paulo!

Os duendes me contaram que você aprendeu a andar de bicicleta sem rodinhas e foi uma criança muito amorosa este ano. Parabéns pela dedicação!

Já li sua cartinha sobre o seu desejo: o dinossauro robô. Estamos na oficina preparando os presentes de todas as crianças com muito carinho.

Continue sendo obediente, gentil e alegre com seus pais e amigos!

Com carinho, Papai Noel 🎅`;

  const activeSampleText = samplePlan === "pro" ? sampleProText : sampleFreeText;

  const handleToggleAudio = () => {
    if (isPlayingAudio && audioStopper) {
      audioStopper.stop();
      setIsPlayingAudio(false);
      return;
    }

    const stopper = speakSantaMessage(
      activeSampleText,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
    setAudioStopper(stopper);
  };

  const handleSimulateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingShipping(true);
    try {
      const res = await calculateShippingAPI(shippingZip, shippingCountry);
      setShippingData(res);
    } catch {
      setShippingData({
        service: shippingCountry === "Brasil" ? "Carta Registrada Polar Aérea" : "Expresso Internacional Polar",
        cost: 29.90,
        estimatedDays: shippingCountry === "Brasil" ? "3 a 5 dias úteis" : "5 a 8 dias úteis",
        packaging: "Envelope Linho 180g com Lacre de Cera Vermelha",
        trackingAvailable: true,
      });
    } finally {
      setIsSimulatingShipping(false);
    }
  };

  const navTabs: { id: MenuTab; label: string; icon: React.ElementType }[] = [
    { id: "como-funciona", label: "Como Funciona", icon: BookOpen },
    { id: "exemplo", label: "Ver Exemplo", icon: Eye },
    { id: "planos", label: "Planos & Preços", icon: CreditCard },
    { id: "rastreio", label: "Rastreio Postal", icon: Truck },
    { id: "faq", label: "Dúvidas FAQ", icon: HelpCircle },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0B132B] border border-[#FFD166]/40 rounded-3xl w-full max-w-4xl p-5 sm:p-8 relative shadow-2xl my-auto max-h-[90vh] flex flex-col text-[#EDF2F4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls: Navigation Pills & Close Button */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 shrink-0">
          {/* Scrollable Tab bar for quick switching between topics */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isPlayingAudio && audioStopper) audioStopper.stop();
                    onSelectTab(t.id);
                  }}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white shadow-md border border-[#FFD166]/50"
                      : "bg-[#1C2541]/80 hover:bg-[#1C2541] text-[#EDF2F4]/70 hover:text-white border border-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FFD166]" : ""}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (isPlayingAudio && audioStopper) audioStopper.stop();
              onClose();
            }}
            className="p-1.5 text-[#EDF2F4]/60 hover:text-white rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Fechar janela"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: COMO FUNCIONA */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "como-funciona" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3.5 py-1 rounded-full border border-[#FFD166]/30 inline-block">
                  Experiência Passo a Passo
                </span>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Como Funciona a Carta Mágica
                </h3>
                <p className="text-xs sm:text-sm text-[#EDF2F4]/75">
                  Uma jornada simples, rápida e emocionante criada para conectar pais e filhos na época mais especial do ano.
                </p>
              </div>

              {/* 5 Steps Grid */}
              <div className="space-y-3">
                <div className="bg-[#1C2541]/50 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D90429] text-white flex items-center justify-center font-cinzel font-bold text-sm shrink-0 border border-[#FFD166]/40">
                    1
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-white mb-1">
                      Preencha os dados da criança
                    </h4>
                    <p className="text-xs text-[#EDF2F4]/75 leading-relaxed">
                      Informe nome, idade e cidade em um formulário seguro e intuitivo que leva menos de 2 minutos. Você também pode anexar uma foto (com sanitização e remoção automática de metadados para total privacidade).
                    </p>
                  </div>
                </div>

                <div className="bg-[#1C2541]/50 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D90429] text-white flex items-center justify-center font-cinzel font-bold text-sm shrink-0 border border-[#FFD166]/40">
                    2
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-white mb-1">
                      Personalize a experiência
                    </h4>
                    <p className="text-xs text-[#EDF2F4]/75 leading-relaxed">
                      Conte as conquistas marcantes do ano (como aprender a andar de bicicleta, ler o primeiro livro ou cuidar de um animalzinho), o pedido de Natal e uma frase carinhosa dos pais para o Papai Noel citar na mensagem.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1C2541]/50 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D90429] text-white flex items-center justify-center font-cinzel font-bold text-sm shrink-0 border border-[#FFD166]/40">
                    3
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-white mb-1">
                      Geração instantânea da carta
                    </h4>
                    <p className="text-xs text-[#EDF2F4]/75 leading-relaxed">
                      Nossa tecnologia combina o espírito de Natal com os detalhes reais do seu filho, tecendo uma carta calorosa, única e tocante com a chancela oficial do Polo Norte.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1C2541]/50 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D90429] text-white flex items-center justify-center font-cinzel font-bold text-sm shrink-0 border border-[#FFD166]/40">
                    4
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-white mb-1">
                      Visualização mágica na tela
                    </h4>
                    <p className="text-xs text-[#EDF2F4]/75 leading-relaxed">
                      A carta chega em um envelope lacrado com carimbo postal. Ao clicar, uma animação com confetes deslacra a correspondência em pergaminho clássico, pronta para ser lida e ouvida junto com a criança.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1C2541]/50 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D90429] text-white flex items-center justify-center font-cinzel font-bold text-sm shrink-0 border border-[#FFD166]/40">
                    5
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-white mb-1">
                      Compartilhe com a família
                    </h4>
                    <p className="text-xs text-[#EDF2F4]/75 leading-relaxed">
                      Envie facilmente o link interativo pelo WhatsApp para avós, padrinhos e tios vivenciarem o momento, ou baixe o PDF de alta resolução para imprimir e colocar embaixo do pinheirinho.
                    </p>
                  </div>
                </div>
              </div>

              {/* Diferença Grátis vs PRO */}
              <div className="bg-[#060B19] border border-[#FFD166]/30 rounded-2xl p-5 space-y-4">
                <div className="text-center">
                  <h4 className="font-cinzel text-lg font-bold text-[#FFD166]">
                    Qual a diferença entre o Plano Gratuito e o Plano PRO?
                  </h4>
                  <p className="text-xs text-[#EDF2F4]/70">
                    Transparência total para você escolher a melhor lembrança para seu filho.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#0B132B] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-white">Plano Gratuito</span>
                      <span className="text-emerald-400 font-bold">R$ 0</span>
                    </div>
                    <ul className="space-y-1.5 text-[#EDF2F4]/70">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>1 carta personalizada com dados básicos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Cartão digital na tela com tema natalino</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Link para visualização online</span>
                      </li>
                      <li className="flex items-center gap-2 text-[#EDF2F4]/40">
                        <span className="w-3.5 h-3.5 text-center text-red-400 font-bold shrink-0">✕</span>
                        <span>Sem arquivo PDF de alta definição</span>
                      </li>
                      <li className="flex items-center gap-2 text-[#EDF2F4]/40">
                        <span className="w-3.5 h-3.5 text-center text-red-400 font-bold shrink-0">✕</span>
                        <span>Sem narração em áudio do Papai Noel</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-[#1C2541] to-[#0B132B] p-4 rounded-xl border border-[#FFD166]/40 space-y-2 relative">
                    <div className="flex items-center justify-between pb-2 border-b border-white/15">
                      <span className="font-bold text-[#FFD166] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Plano PRO
                      </span>
                      <span className="text-[#FFD166] font-bold">R$ 39,99</span>
                    </div>
                    <ul className="space-y-1.5 text-[#EDF2F4]/90">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
                        <span>Carta estendida, rica em detalhes e poesia</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
                        <span>PDF A4 em alta qualidade pronto para impressão</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
                        <span>Áudio com voz emocionante do Papai Noel</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
                        <span>Página exclusiva da criança sem marca d'água</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
                        <span>Compartilhamento direto e vídeo quando disponível</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onStartWizard("free");
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-3 px-6 rounded-full shadow-lg border border-[#FFD166]/40 text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span>Criar Minha Carta Grátis Agora</span>
                </button>
                <button
                  onClick={() => onSelectTab("planos")}
                  className="w-full sm:w-auto bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] py-3 px-6 rounded-full border border-[#FFD166]/30 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Ver Todos os Planos & Preços
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: VER EXEMPLO */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "exemplo" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3.5 py-1 rounded-full border border-[#FFD166]/30">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Amostra Demonstrativa • Criança Fictícia</span>
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Exemplo Real da Carta Mágica
                </h3>
                <p className="text-xs sm:text-sm text-[#EDF2F4]/75">
                  Veja abaixo uma demonstração de como a carta é estruturada. Os dados apresentados pertencem a uma criança fictícia para fins de demonstração.
                </p>
              </div>

              {/* Version Selector Tabs & Audio Trigger */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#060B19] p-2.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isPlayingAudio && audioStopper) audioStopper.stop();
                      setSamplePlan("pro");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      samplePlan === "pro"
                        ? "bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white shadow"
                        : "text-[#EDF2F4]/70 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                    <span>Exemplo PRO (Completo)</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isPlayingAudio && audioStopper) audioStopper.stop();
                      setSamplePlan("free");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      samplePlan === "free"
                        ? "bg-[#1C2541] text-[#FFD166] border border-[#FFD166]/30"
                        : "text-[#EDF2F4]/70 hover:text-white"
                    }`}
                  >
                    <span>Exemplo Grátis</span>
                  </button>
                </div>

                <button
                  onClick={handleToggleAudio}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isPlayingAudio
                      ? "bg-[#D90429] text-white border-white animate-pulse"
                      : "bg-[#1C2541] text-[#FFD166] border-[#FFD166]/40 hover:bg-[#2A385B]"
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Parar Voz do Noel</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Ouvir Voz do Noel</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Parchment Sheet */}
              <div className="bg-[#FFFDF9] text-[#1C2541] rounded-2xl p-6 sm:p-8 border-4 border-[#C49A45] shadow-2xl relative overflow-hidden">
                {/* Watermark badge */}
                <div className="absolute top-2 right-2 bg-[#D90429]/10 text-[#9B021A] text-[9px] font-bold px-2 py-0.5 rounded border border-[#9B021A]/20 uppercase tracking-wider">
                  Exemplo de Demonstração
                </div>

                {/* Letter Header Ribbon */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#1C2541]/15 pb-4 mb-6 gap-3">
                  <div>
                    <span className="font-cinzel text-xs font-black tracking-widest text-[#9B021A] uppercase block">
                      CORRESPONDÊNCIA OFICIAL DO POLO NORTE
                    </span>
                    <span className="text-xs text-[#1C2541]/80 font-serif">
                      Destinatário Fictício: <strong>Lucas Silva</strong> (6 anos) • São Paulo, SP
                    </span>
                  </div>
                  <div className="bg-[#C49A45]/20 text-[#845E1B] font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-[#C49A45]/40">
                    REGISTRO: NP-DEMO-2026
                  </div>
                </div>

                {/* Letter Body Text */}
                <div className="font-serif text-sm sm:text-base leading-relaxed text-[#1C2541]/90 whitespace-pre-line space-y-4">
                  {activeSampleText}
                </div>

                {/* Signature & Seal Footer */}
                <div className="mt-8 pt-6 border-t-2 border-[#1C2541]/15 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-cinzel font-bold text-sm text-[#9B021A]">
                      Papai Noel & Duendes do Polo Norte
                    </div>
                    <div className="text-[10px] text-[#1C2541]/60 font-serif italic">
                      Chancelado nas Oficinas Glaciais de Brinquedos
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#F6ECE0] px-3 py-1.5 rounded-full border border-[#C49A45]/50">
                    <span className="text-base">🎅</span>
                    <span className="text-[10px] font-bold font-cinzel text-[#9B021A]">
                      LACRE DE CERA REAL HOMOLOGADO
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    if (isPlayingAudio && audioStopper) audioStopper.stop();
                    onClose();
                    onStartWizard("free");
                  }}
                  className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-3 px-8 rounded-full shadow-lg border border-[#FFD166]/40 text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span>Criar Carta Personalizada para Meu Filho</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: PLANOS & PREÇOS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "planos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3.5 py-1 rounded-full border border-[#FFD166]/30">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Preços Transparentes</span>
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Planos & Preços da Carta Mágica
                </h3>
                <p className="text-xs sm:text-sm text-[#EDF2F4]/75">
                  Sem taxas ocultas ou cobranças recorrentes. Crie gratuitamente ou libere a experiência mágica completa.
                </p>
              </div>

              {/* Exact 2 Plans Specified */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* PLANO GRÁTIS */}
                <div className="bg-[#0B132B] border border-white/15 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#EDF2F4]/60 block">
                          Para Começar
                        </span>
                        <h4 className="font-cinzel text-xl font-bold text-white">
                          GRÁTIS
                        </h4>
                      </div>
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        100% Grátis
                      </span>
                    </div>

                    <div className="mb-6 pb-4 border-b border-white/10">
                      <div className="font-cinzel text-3xl sm:text-4xl font-black text-white">
                        R$ 0
                      </div>
                      <span className="text-[10px] text-[#EDF2F4]/50 block mt-0.5">
                        Sem necessidade de cartão de crédito
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#EDF2F4]/80 mb-6">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>1 carta personalizada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Cartão digital</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Visual de Natal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Prévia da carta</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Link para compartilhamento</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onStartWizard("free");
                    }}
                    className="w-full bg-[#1C2541] hover:bg-[#2A385B] text-white font-bold py-3 rounded-2xl border border-white/10 text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Começar no Plano Grátis
                  </button>
                </div>

                {/* PLANO PRO */}
                <div className="bg-gradient-to-br from-[#1C2541] via-[#0B132B] to-[#1C2541] border-2 border-[#FFD166] rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative">
                  <div className="absolute -top-3 right-6 bg-[#D90429] text-[#FFD166] text-[10px] font-bold px-3 py-1 rounded-full border border-[#FFD166] shadow">
                    ⭐ MAIS POPULAR
                  </div>

                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD166] block">
                          Experiência Completa
                        </span>
                        <h4 className="font-cinzel text-xl font-bold text-white">
                          PRO
                        </h4>
                      </div>
                    </div>

                    <div className="mb-6 pb-4 border-b border-white/15">
                      <div className="flex items-baseline gap-1">
                        <span className="font-cinzel text-3xl sm:text-4xl font-black text-[#FFD166]">
                          R$ 39,99
                        </span>
                        <span className="text-xs text-[#EDF2F4]/60">único</span>
                      </div>
                      <span className="text-[10px] text-[#EDF2F4]/60 block mt-0.5">
                        Acesso vitalício à carta, PDF e áudio
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#EDF2F4]/90 mb-6">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span className="font-semibold text-white">Tudo do plano gratuito</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>Carta premium enriquecida e poética</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>PDF em alta qualidade para impressão</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>Áudio do Papai Noel narrando a carta</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>Vídeo personalizado quando disponível</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>Página exclusiva da criança</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>Compartilhamento pelo WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <span>Sem marca d'água</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onStartWizard("pro");
                    }}
                    className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-3.5 rounded-2xl border border-[#FFD166] text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFD166]" />
                    <span>Escolher o Plano PRO</span>
                  </button>
                </div>

              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[11px] text-[#EDF2F4]/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pagamento 100% Criptografado & Seguro
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#EF233C]" />
                  Garantia de Emoção em Família
                </span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: RASTREIO POSTAL */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "rastreio" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3.5 py-1 rounded-full border border-[#FFD166]/30">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Serviço Postal Oficial</span>
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Como Funciona o Rastreamento Postal
                </h3>
                <p className="text-xs sm:text-sm text-[#EDF2F4]/75">
                  Entenda as etapas da entrega física caso sua experiência inclua a correspondência impressa em pergaminho.
                </p>
              </div>

              {/* Clarification Notice */}
              <div className="bg-[#1C2541]/70 border border-[#FFD166]/40 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-bold text-[#FFD166] flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Carta Digital Instantânea vs. Correspondência Física Impressa</span>
                </div>
                <p className="text-[#EDF2F4]/80 leading-relaxed">
                  A versão digital da Carta Mágica fica pronta imediatamente na sua tela. O <strong>código de rastreamento postal</strong> aplica-se exclusivamente quando os pais optam pela confecção da carta física artesanal enviada pelos Correios.
                </p>
                <p className="text-[#EDF2F4]/60 text-[11px]">
                  * Por respeito à sua confiança, não geramos códigos falsos ou fictícios: o rastreio oficial é gerado pelos Correios (Sedex / Carta Registrada) no exato instante em que o envelope é postado.
                </p>
              </div>

              {/* Postal Journey Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#060B19] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#D90429] text-[#FFD166] flex items-center justify-center text-xs font-bold font-cinzel">
                    1
                  </div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white">
                    Confecção Artesanal
                  </h4>
                  <p className="text-[11px] text-[#EDF2F4]/70 leading-relaxed">
                    Impressão em papel linho 180g de alta gramatura, carimbo oficial do Polo Norte e selo de cera vermelha lacrado à mão.
                  </p>
                </div>

                <div className="bg-[#060B19] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#D90429] text-[#FFD166] flex items-center justify-center text-xs font-bold font-cinzel">
                    2
                  </div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white">
                    Postagem & Rastreio
                  </h4>
                  <p className="text-[11px] text-[#EDF2F4]/70 leading-relaxed">
                    Despacho no centro de triagem postal. O código oficial dos Correios (ex: BR123456789XX) é enviado por e-mail para os pais.
                  </p>
                </div>

                <div className="bg-[#060B19] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#D90429] text-[#FFD166] flex items-center justify-center text-xs font-bold font-cinzel">
                    3
                  </div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white">
                    Entrega em Mãos
                  </h4>
                  <p className="text-[11px] text-[#EDF2F4]/70 leading-relaxed">
                    Acompanhe em tempo real a rota até o carteiro entregar na sua casa, pronto para ser colocado sob a árvore de Natal.
                  </p>
                </div>
              </div>

              {/* Integrated Shipping Estimator Simulator */}
              <div className="bg-[#060B19] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#FFD166]" />
                  <h4 className="font-cinzel text-sm font-bold text-white">
                    Simulador de Prazo e Frete Postal
                  </h4>
                </div>
                <p className="text-xs text-[#EDF2F4]/70">
                  Calcule a estimativa de entrega e custo para o seu CEP antes de solicitar a carta física.
                </p>

                <form onSubmit={handleSimulateShipping} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">País</label>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Brasil">Brasil (Correios)</option>
                      <option value="Portugal">Portugal (CTT)</option>
                      <option value="Estados Unidos">Estados Unidos (USPS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">CEP / Código Postal</label>
                    <input
                      type="text"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="00000-000"
                      className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSimulatingShipping}
                      className="w-full bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] font-bold py-2 px-4 rounded-xl border border-[#FFD166]/30 transition-colors cursor-pointer"
                    >
                      {isSimulatingShipping ? "Calculando..." : "Calcular Prazo"}
                    </button>
                  </div>
                </form>

                {shippingData && (
                  <div className="bg-[#0B132B] p-3 rounded-xl border border-[#FFD166]/30 mt-3 text-xs space-y-1 animate-in fade-in">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>{shippingData.service}</span>
                      <span className="text-emerald-400">R$ {shippingData.cost.toFixed(2)}</span>
                    </div>
                    <div className="text-[#EDF2F4]/70 flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#FFD166]" />
                      <span>Prazo estimado: {shippingData.estimatedDays}</span>
                    </div>
                    <div className="text-[#EDF2F4]/70 flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{shippingData.packaging} (Rastreamento Oficial Incluso)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onStartWizard("pro");
                  }}
                  className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-3 px-8 rounded-full shadow-lg border border-[#FFD166]/40 text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span>Criar Carta com Opção Postal</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: DÚVIDAS FAQ (ACORDEÃO) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "faq" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#FFD166] bg-[#1C2541] px-3.5 py-1 rounded-full border border-[#FFD166]/30">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Central de Ajuda</span>
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Dúvidas Frequentes (FAQ)
                </h3>
                <p className="text-xs sm:text-sm text-[#EDF2F4]/75">
                  Clique em qualquer pergunta para ver a resposta detalhada instantaneamente sem sair da página.
                </p>
              </div>

              {/* Accordion List */}
              <div className="space-y-2.5">
                {[
                  {
                    q: "Como o Papai Noel sabe os detalhes e conquistas do meu filho?",
                    a: "Você preenche um formulário rápido (em menos de 2 minutos) contando os pontos marcantes do ano dele: conquistas, aprendizados, o presente desejado e até uma frase especial dos pais. Nossa inteligência artificial costura tudo isso com lirismo natalino, transmitindo a sensação de que o Papai Noel realmente acompanhou cada passo dele do Polo Norte."
                  },
                  {
                    q: "É seguro para os dados da criança? (LGPD / Privacidade)",
                    a: "Totalmente seguro! Aplicamos com rigor o princípio da minimização de dados e LGPD Art. 14. Jamais solicitamos endereço residencial completo, escola ou documentos civis. Apenas o nome, idade e cidade básica são utilizados para o texto afetuoso. Se você optar por enviar uma foto, os metadados de localização (EXIF/GPS) são removidos diretamente no seu navegador antes do envio."
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
                    q: "Existe opção de entrega física pelos Correios?",
                    a: "Sim! Para famílias que desejam que a criança receba uma carta física pelos correios, oferecemos a opção de envio postal em pergaminho nobre 180g, com selo de cera vermelha lacrado à mão e carimbo do Polo Norte com código de rastreamento oficial dos Correios."
                  },
                  {
                    q: "Como funciona a estrutura de vídeo do Papai Noel?",
                    a: "A plataforma Carta Mágica já possui toda a arquitetura e estados de processamento preparados para integração de vídeo avatar com IA. O recurso é liberado em fases para garantir altíssima fidelidade e emoção."
                  },
                  {
                    q: "Posso criar e abrir a carta pelo celular?",
                    a: "Sim, 100%! Todo o sistema foi desenhado de forma responsiva, permitindo criar, ouvir a narração e compartilhar com a família diretamente pelo smartphone."
                  }
                ].map((item, idx) => {
                  const isOpen = faqOpenIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#1C2541]/40 border border-white/10 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                        className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-white hover:text-[#FFD166] transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#FFD166] shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 text-xs text-[#EDF2F4]/80 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Banner */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onStartWizard("free");
                  }}
                  className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-3 px-8 rounded-full shadow-lg border border-[#FFD166]/40 text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span>Tudo Claro! Criar Minha Carta Agora</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#EDF2F4]/60 shrink-0">
          <span className="flex items-center gap-1">
            <span>🎅 Polo Norte Express</span>
            <span className="hidden sm:inline">• Experiência Natalina Oficial</span>
          </span>
          <button
            onClick={() => {
              if (isPlayingAudio && audioStopper) audioStopper.stop();
              onClose();
            }}
            className="text-[#EDF2F4]/80 hover:text-white font-semibold cursor-pointer underline underline-offset-2"
          >
            Fechar janela
          </button>
        </div>

      </div>
    </div>
  );
}
