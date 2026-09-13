import { useState } from "react";
import { Letter } from "../types";
import { trackEvent } from "../services/analytics";
import confetti from "canvas-confetti";
import SantaAudioPlayer from "./SantaAudioPlayer";
import SecretMessageCard from "./SecretMessageCard";
import ChildReactionCard from "./ChildReactionCard";
import VideoPipelineModal from "./VideoPipelineModal";
import { 
  Gift, 
  Sparkles, 
  Share2, 
  Printer, 
  Stamp, 
  ArrowLeft,
  Video,
  Check,
  Copy,
  Heart,
  PlusCircle
} from "lucide-react";

interface ChildPublicViewProps {
  letter: Letter;
  onGoHome: () => void;
  onCreateFreeLetter?: () => void;
}

export default function ChildPublicView({
  letter,
  onGoHome,
  onCreateFreeLetter,
}: ChildPublicViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isPro = letter.plan === "pro";

  const handleReveal = () => {
    setIsRevealed(true);
    trackEvent("letter_opened", { letterId: letter.id, view: "child_page" });

    // Golden and crimson Christmas confetti explosion
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#FFD166", "#EF233C", "#06D6A0", "#FFFFFF", "#FFB703"],
    });
  };

  // WhatsApp Share with mandatory emotional copy
  const handleShareWhatsApp = () => {
    trackEvent("whatsapp_shared", { letterId: letter.id, view: "child_page" });
    const publicUrl = window.location.href;
    const text = encodeURIComponent(
      `🎅 O Papai Noel deixou uma mensagem especial para uma criança muito querida. Veja a surpresa: ${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    trackEvent("link_copied", { letterId: letter.id, view: "child_page" });
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintPDF = () => {
    trackEvent("pdf_downloaded", { letterId: letter.id, view: "child_page" });
    window.print();
  };

  const handleCreateNewLetter = () => {
    trackEvent("new_letter_from_shared_page", {
      fromLetterId: letter.id,
      fromToken: letter.token,
    });
    if (onCreateFreeLetter) {
      onCreateFreeLetter();
    } else {
      onGoHome();
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center px-4 py-8 sm:py-12">
      
      {!isRevealed ? (
        /* SURPRISE INTRO SCREEN (Unopened envelope / gift - Section 5) */
        <div className="max-w-md w-full mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Animated Magic Gift Box */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-[#D90429] via-[#EF233C] to-[#780016] rounded-3xl flex items-center justify-center border-3 border-[#FFD166] shadow-2xl animate-bounce">
              <Gift className="w-16 h-16 text-[#FFD166]" />
            </div>
            <div className="absolute -top-3 -right-3 bg-[#FFD166] text-[#060B19] rounded-full p-2 shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {letter.photoUrl && (
            <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-[#FFD166] shadow-md">
              <img src={letter.photoUrl} alt={letter.childName} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Mandated Headline */}
          <div className="space-y-2">
            <span className="text-xs font-cinzel font-bold text-[#FFD166] tracking-widest uppercase bg-[#1C2541] px-4 py-1 rounded-full border border-[#FFD166]/30 inline-block">
              Expresso Oficial do Polo Norte
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              🎅 O Papai Noel deixou uma mensagem para você!
            </h1>
            <p className="text-sm text-[#EDF2F4]/80 max-w-sm mx-auto">
              Diretamente da fábrica de brinquedos do Polo Norte para{" "}
              <strong className="text-[#FFD166] underline decoration-[#FFD166]/40">{letter.childName}</strong>{" "}
              em {letter.city}.
            </p>
          </div>

          {/* Mandated Button 'Abrir minha mensagem' */}
          <button
            onClick={handleReveal}
            className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 px-8 rounded-full shadow-2xl border-2 border-[#FFD166] text-lg sm:text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer gold-glow"
            id="child-reveal-btn"
          >
            <Sparkles className="w-6 h-6 text-[#FFD166] animate-spin" />
            <span>✨ Abrir minha mensagem</span>
          </button>

          <p className="text-xs text-[#EDF2F4]/55">
            Chame quem você mais ama para viver este momento especial juntos!
          </p>
        </div>
      ) : (
        /* REVEALED LETTER EXPERIENCE */
        <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* Top Guardian Bar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#0B132B]/90 p-4 rounded-2xl border border-white/10 shadow-lg">
            <button
              onClick={onGoHome}
              className="text-xs text-[#EDF2F4]/70 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao início</span>
            </button>

            {/* Direct WhatsApp Sharing Button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105"
                id="child-view-whatsapp-share-btn"
                title="Compartilhar no WhatsApp com a família"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>📱 Compartilhar no WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4] px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                title="Copiar link da página"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#FFD166]" />}
                <span>{copiedLink ? "Copiado!" : "🔗 Copiar Link"}</span>
              </button>

              {isPro && (
                <button
                  onClick={handlePrintPDF}
                  className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/40 px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Baixar em PDF ou Imprimir em folha A4"
                  id="child-print-pdf-btn"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>📄 Baixar minha carta em PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* AUDIO PLAYER (PRO FEATURE - Section 6) */}
          {isPro && (
            <div className="no-print">
              <SantaAudioPlayer
                letterId={letter.id}
                letterContent={letter.content}
                childName={letter.childName}
                isPro={true}
              />
            </div>
          )}

          {/* VIDEO PERSONALIZADO AREA (PRO FEATURE - Section 7) */}
          {isPro && (
            <div className="no-print bg-[#0B132B] border border-white/15 hover:border-[#FFD166]/40 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div
                  className="w-12 h-12 rounded-2xl bg-[#D90429]/30 text-[#FFD166] flex items-center justify-center border border-[#FFD166]/40 shrink-0 cursor-pointer"
                  onClick={() => {
                    trackEvent("video_started", { letterId: letter.id, view: "child_page" });
                    setVideoModalOpen(true);
                  }}
                >
                  <Video className="w-6 h-6 animate-pulse" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h4 className="font-cinzel text-sm font-bold text-white">
                      🎬 O Papai Noel preparou um vídeo especialmente para você
                    </h4>
                    <span className="bg-[#D90429] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#FFD166]/40">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-[#EDF2F4]/70 mt-0.5 max-w-lg">
                    Os duendes cinegrafistas do Polo Norte estão preparando a animação oficial chamando {letter.childName} pelo nome!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  trackEvent("video_started", { letterId: letter.id, view: "child_page" });
                  setVideoModalOpen(true);
                }}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/40 font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-105"
                id="child-video-watch-btn"
              >
                <span>▶ Assistir à mensagem</span>
              </button>
            </div>
          )}

          {/* MENSAGEM SECRETA DO PAPAI NOEL (PRO FEATURE - Section 8) */}
          {isPro && (
            <div className="no-print">
              <SecretMessageCard
                letterId={letter.id}
                childName={letter.childName}
                achievements={letter.achievements}
                parentNotes={letter.parentNotes}
                initialSecret={letter.secretMessage}
                isPro={true}
              />
            </div>
          )}

          {/* OFFICIAL HIGH-QUALITY PARCHMENT LETTER */}
          <div
            id="printable-letter"
            className="relative parchment-bg text-[#1C2541] rounded-3xl p-6 sm:p-14 border-4 border-[#FFD166] magical-shadow"
          >
            {/* Authentic Wax Seal */}
            <div className="absolute -top-6 -right-3 sm:-right-5 wax-seal w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border-2 border-[#FFD166] text-[#FFD166] shadow-xl">
              <span className="font-cinzel text-[8px] sm:text-[9px] font-black uppercase text-center leading-tight">
                POLO<br/>NORTE
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold">OFICIAL</span>
            </div>

            {/* Header with polar details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#1C2541]/15 pb-6 mb-8 gap-4">
              <div className="flex items-center gap-4">
                {letter.photoUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#9B021A] shrink-0 shadow-sm">
                    <img src={letter.photoUrl} alt={letter.childName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <span className="font-cinzel text-xs font-black tracking-widest text-[#9B021A] uppercase block">
                    VIA TRENÓ AÉREO DO POLO NORTE
                  </span>
                  <span className="text-xs text-[#1C2541]/75 font-serif">
                    Correspondência especial para: <strong>{letter.childName}</strong> ({letter.age} anos) • {letter.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="border border-dashed border-[#1C2541]/30 px-3 py-1.5 rounded-lg text-right">
                  <span className="text-[9px] font-mono text-[#1C2541]/60 block">SELO DE REGISTRO</span>
                  <span className="font-mono text-xs font-bold text-[#9B021A]">{letter.token.toUpperCase()}</span>
                </div>
                <Stamp className="w-8 h-8 text-[#9B021A]/40 shrink-0 hidden sm:block" />
              </div>
            </div>

            {/* Letter Content */}
            <div className="font-serif text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line text-[#1C2541] space-y-4">
              {letter.content}
            </div>

            {/* Footer with Santa's Signature */}
            <div className="mt-12 pt-8 border-t border-[#1C2541]/20 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <span className="text-[10px] font-cinzel uppercase tracking-wider text-[#1C2541]/60 block">
                  Certificado de Bondade & Amor do Polo Norte
                </span>
                <span className="text-xs font-bold text-[#9B021A] font-cinzel">
                  Expresso Polar Oficial 2026 • Carta Mágica
                </span>
                <span className="text-[10px] text-[#1C2541]/50 block mt-0.5">
                  Emitido para {letter.childName} em {letter.date}
                </span>
              </div>
              <div className="text-center sm:text-right">
                <span className="font-handwriting text-4xl sm:text-5xl text-[#9B021A] font-bold block">
                  Papai Noel
                </span>
                <span className="text-[10px] text-[#1C2541]/60 font-serif italic">
                  Oficina dos Duendes e Renas 🦌 • Polo Norte
                </span>
              </div>
            </div>

            {/* Watermark notice for Free users (Strictly removed on PRO) */}
            {!isPro && (
              <div className="mt-6 pt-3 text-center border-t border-dashed border-[#1C2541]/20 no-print">
                <span className="text-xs text-[#9B021A] font-semibold">
                  Versão Digital Gratuita de Degustação • Remova a marca d'água e desbloqueie o Áudio Narrado e o PDF A4 no Plano PRO por R$ 39,99.
                </span>
              </div>
            )}
          </div>

          {/* REAÇÃO DA CRIANÇA (Section 10) */}
          <div className="no-print">
            <ChildReactionCard
              letterId={letter.id}
              childName={letter.childName}
              initialReaction={letter.childReaction}
            />
          </div>

          {/* COMPARTILHAMENTO (Section 9) */}
          <div className="no-print bg-[#0B132B] border border-white/10 rounded-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 font-cinzel text-base font-bold text-white">
              <Heart className="w-5 h-5 text-[#EF233C] fill-[#EF233C]" />
              <span>Compartilhe esta magia</span>
            </div>

            <p className="text-xs text-[#EDF2F4]/70 max-w-md mx-auto">
              Mostre a mensagem do Papai Noel para a vovó, vovô, tios e padrinhos!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-105"
              >
                <Share2 className="w-4 h-4" />
                <span>📱 Compartilhar no WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-white font-semibold px-4 py-2.5 rounded-full text-xs flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copiado!" : "🔗 Copiar link"}</span>
              </button>
            </div>
          </div>

          {/* ESTRATÉGIA DE CRESCIMENTO VIRAL (Section 13) */}
          <div className="no-print bg-gradient-to-r from-[#1C2541] via-[#0B132B] to-[#1C2541] border-2 border-[#FFD166]/60 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <span className="bg-[#D90429] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#FFD166]/50 inline-block">
              Presente Especial de Natal
            </span>

            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              Quer criar uma surpresa assim para uma criança especial?
            </h3>

            <p className="text-xs sm:text-sm text-[#EDF2F4]/80 max-w-lg mx-auto">
              Neste Natal, o Papai Noel também pode chamar seu filho, neto ou sobrinho pelo nome em uma mensagem mágica personalizada com IA.
            </p>

            <button
              onClick={handleCreateNewLetter}
              className="bg-gradient-to-r from-[#FFD166] via-[#FFE194] to-[#FFD166] text-[#060B19] font-black py-3.5 px-8 rounded-full shadow-xl text-sm sm:text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform gold-glow inline-flex items-center gap-2"
              id="shared-page-create-free-btn"
            >
              <Sparkles className="w-4 h-4 text-[#D90429]" />
              <span>✨ Criar minha Carta Mágica grátis</span>
            </button>
          </div>

        </div>
      )}

      {/* Video Pipeline Modal */}
      <VideoPipelineModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        childName={letter.childName}
        letterId={letter.id}
      />

    </div>
  );
}
