import { useState, useEffect } from "react";
import { Letter } from "../types";
import { trackEvent } from "../services/analytics";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SantaAudioPlayer from "./SantaAudioPlayer";
import SecretMessageCard from "./SecretMessageCard";
import ChildReactionCard from "./ChildReactionCard";
import VideoPipelineModal from "./VideoPipelineModal";
import CandyHuntGame from "./CandyHuntGame";
import { 
  Printer, 
  Share2, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink, 
  Stamp, 
  Check, 
  Copy, 
  Video, 
  Mail, 
  Heart,
  Gift,
  Download,
  Loader2,
  Gamepad2,
  Moon,
  Sun,
  Image as ImageIcon
} from "lucide-react";

interface LetterViewProps {
  letter: Letter;
  onBackToDashboard: () => void;
  onOpenPaywall: () => void;
  onOpenChildPage: (letter: Letter) => void;
  onOpenLogistics: () => void;
}

export default function LetterView({
  letter,
  onBackToDashboard,
  onOpenPaywall,
  onOpenChildPage,
  onOpenLogistics,
}: LetterViewProps) {
  const isPro = letter.plan === "pro";
  const [isRevealed, setIsRevealed] = useState(false);
  const [isOpeningEnvelope, setIsOpeningEnvelope] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showCandyGame, setShowCandyGame] = useState(false);

  useEffect(() => {
    if (!isPro) {
      trackEvent("pro_viewed", { letterId: letter.id });
    }
  }, [isPro, letter.id]);

  // Envelope Reveal Action with Smooth Unsealing Animation
  const handleRevealLetter = () => {
    setIsOpeningEnvelope(true);
    trackEvent("letter_opened", { letterId: letter.id, plan: letter.plan });
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#FFD166", "#EF233C", "#06D6A0", "#FFFFFF", "#FFB703"],
    });

    // Unsealing transition
    setTimeout(() => {
      setIsRevealed(true);
      setIsOpeningEnvelope(false);
    }, 600);
  };

  // WhatsApp Share with mandatory emotional copy
  const handleShareWhatsApp = () => {
    trackEvent("whatsapp_shared", { letterId: letter.id });
    const publicUrl = `${window.location.origin}/natal/${letter.token}`;
    const text = encodeURIComponent(
      `🎅 O Papai Noel deixou uma mensagem especial para uma criança muito querida. Veja a surpresa: ${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Copy Public Link
  const handleCopyLink = () => {
    trackEvent("link_copied", { letterId: letter.id });
    const publicUrl = `${window.location.origin}/natal/${letter.token}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Download official letter as PDF using jspdf and html2canvas
  const handleDownloadPDF = async () => {
    const letterElement = document.getElementById("printable-letter");
    if (!letterElement) return;

    setIsGeneratingPDF(true);
    try {
      trackEvent("pdf_generation_started", { letterId: letter.id });

      // If reading mode is active, temporarily remove class to ensure pristine print colors
      const wasInReadingMode = letterElement.classList.contains("parchment-reading-mode");
      if (wasInReadingMode) {
        letterElement.classList.remove("parchment-reading-mode");
      }

      const canvas = await html2canvas(letterElement, {
        scale: 2, // 2x scale for crisp parchment and sharp text
        useCORS: true,
        logging: false,
        backgroundColor: "#FCF9F2",
      });

      if (wasInReadingMode) {
        letterElement.classList.add("parchment-reading-mode");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxContentWidth = pageWidth - margin * 2;
      const maxContentHeight = pageHeight - margin * 2;

      let renderWidth = maxContentWidth;
      let renderHeight = (canvas.height * renderWidth) / canvas.width;

      if (renderHeight > maxContentHeight) {
        renderHeight = maxContentHeight;
        renderWidth = (canvas.width * renderHeight) / canvas.height;
      }

      const posX = margin + (maxContentWidth - renderWidth) / 2;
      const posY = margin + (maxContentHeight - renderHeight) / 2;

      pdf.addImage(imgData, "JPEG", posX, posY, renderWidth, renderHeight, undefined, "FAST");

      const safeName = (letter.childName || "Crianca")
        .trim()
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚãõÃÕâêîôûÂÊÎÔÛçÇ_-]/g, "_");

      pdf.save(`Carta_Oficial_Papai_Noel_${safeName}.pdf`);

      trackEvent("pdf_downloaded", { letterId: letter.id, method: "jspdf_html2canvas" });

      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#FFD166", "#EF233C", "#06D6A0", "#FFFFFF", "#FFB703"],
      });
    } catch (err) {
      console.error("Erro ao gerar PDF com html2canvas e jspdf:", err);
      // Fallback to browser print if needed
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Download official letter as high-resolution PNG image for quick WhatsApp sharing
  const handleDownloadPNG = async () => {
    const letterElement = document.getElementById("printable-letter");
    if (!letterElement) return;

    setIsGeneratingPNG(true);
    try {
      trackEvent("png_generation_started", { letterId: letter.id });

      // If reading mode is active, temporarily remove class to ensure crisp authentic parchment export
      const wasInReadingMode = letterElement.classList.contains("parchment-reading-mode");
      if (wasInReadingMode) {
        letterElement.classList.remove("parchment-reading-mode");
      }

      // High-resolution scale for sharp mobile retina screens & WhatsApp sharing
      const canvas = await html2canvas(letterElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#FCF9F2",
      });

      if (wasInReadingMode) {
        letterElement.classList.add("parchment-reading-mode");
      }

      const imgData = canvas.toDataURL("image/png");

      const safeName = (letter.childName || "Crianca")
        .trim()
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚãõÃÕâêîôûÂÊÎÔÛçÇ_-]/g, "_");

      const downloadLink = document.createElement("a");
      downloadLink.download = `Carta_Oficial_Papai_Noel_${safeName}.png`;
      downloadLink.href = imgData;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      trackEvent("png_downloaded", { letterId: letter.id, method: "html2canvas_png" });

      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#25D366", "#FFD166", "#EF233C", "#FFFFFF", "#06D6A0"],
      });
    } catch (err) {
      console.error("Erro ao gerar imagem PNG:", err);
    } finally {
      setIsGeneratingPNG(false);
    }
  };

  // High Quality A4 PDF Print
  const handlePrintPDF = () => {
    if (!isPro) {
      onOpenPaywall();
      return;
    }
    trackEvent("pdf_downloaded", { letterId: letter.id });
    window.print();
  };

  const handleOpenVideo = () => {
    trackEvent("video_started", { letterId: letter.id });
    setVideoModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      {!isRevealed ? (
        /* MOMENTO DE REVELAÇÃO DA CARTA (Closed Envelope) */
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
          <div className="relative w-28 h-28 mb-6">
            <div
              className={`w-28 h-28 bg-gradient-to-br from-[#1C2541] via-[#0B132B] to-[#1C2541] rounded-3xl flex items-center justify-center border-2 border-[#FFD166] shadow-2xl transition-all duration-500 ${
                isOpeningEnvelope
                  ? "scale-125 rotate-6 shadow-[0_0_40px_rgba(255,209,102,0.6)]"
                  : "animate-bounce"
              }`}
            >
              <Mail
                className={`w-14 h-14 text-[#FFD166] transition-transform duration-500 ${
                  isOpeningEnvelope ? "scale-110" : ""
                }`}
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-[#D90429] text-white rounded-full p-2 border border-[#FFD166] shadow-lg">
              <Sparkles className="w-4 h-4 text-[#FFD166]" />
            </div>
          </div>

          <span className="text-xs font-cinzel font-bold text-[#FFD166] tracking-widest uppercase bg-[#0B132B] px-4 py-1.5 rounded-full border border-[#FFD166]/30 inline-block mb-3">
            Expresso Polar Oficial • 2026
          </span>

          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mb-2">
            ✉️ Uma mensagem especial chegou do Polo Norte
          </h2>

          <p className="text-sm text-[#EDF2F4]/75 max-w-md mx-auto mb-4">
            O trenó do Papai Noel acaba de entregar a carta personalizada de <strong>{letter.childName}</strong>. Clique abaixo para abrir o envelope mágico!
          </p>

          {/* Selo com Foto Anexada ao Envelope Fechado */}
          {letter.photoUrl && (
            <div className="mb-6 inline-flex items-center gap-2.5 bg-[#060B19]/80 border border-[#FFD166]/50 rounded-full py-1.5 px-4 shadow-lg text-xs text-[#FFD166] animate-in fade-in">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#FFD166] shrink-0 bg-neutral-900">
                <img
                  src={letter.photoUrl}
                  alt={letter.childName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold">
                {isPro ? "⭐ Selo Oficial: Retrato da Criança Anexado" : "📷 Retrato da Criança no Arquivo Polar"}
              </span>
            </div>
          )}

          <button
            onClick={handleRevealLetter}
            disabled={isOpeningEnvelope}
            className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 px-10 rounded-full shadow-2xl border-2 border-[#FFD166] text-lg sm:text-xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer gold-glow disabled:opacity-80"
            id="letter-open-envelope-btn"
          >
            <Sparkles className={`w-5 h-5 text-[#FFD166] ${isOpeningEnvelope ? "animate-spin" : ""}`} />
            <span>{isOpeningEnvelope ? "✨ ABRINDO ENVELOPE..." : "✨ ABRIR MINHA CARTA"}</span>
          </button>
        </div>
      ) : (
        /* REVEALED LETTER EXPERIENCE */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Action Nav Bar (hidden in print) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onBackToDashboard}
              className="text-xs text-[#EDF2F4]/70 hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Painel</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Botão de Alternância de Modo Leitura (Conforto Visual) */}
              <button
                onClick={() => setIsReadingMode((prev) => !prev)}
                className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
                  isReadingMode
                    ? "bg-[#FFD166] text-[#060B19] border-[#FFD166] shadow-[0_0_12px_rgba(255,209,102,0.4)]"
                    : "bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4]/85 hover:text-[#FFD166] border-[#FFD166]/30"
                }`}
                title={
                  isReadingMode
                    ? "Voltar ao pergaminho clássico claro"
                    : "Ativar modo de leitura com contraste suave para ambientes escuros"
                }
                id="toggle-reading-mode-top-btn"
              >
                {isReadingMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#060B19]" />
                    <span>Modo Clássico</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#FFD166]" />
                    <span>Modo Leitura</span>
                  </>
                )}
              </button>

              {/* Baixar como Imagem PNG (Ideal para WhatsApp) */}
              <button
                onClick={handleDownloadPNG}
                disabled={isGeneratingPNG}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-white font-bold px-3.5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-md border border-[#25D366]/60 hover:border-[#25D366] transition-all transform hover:scale-105 cursor-pointer disabled:opacity-60"
                title="Salvar como imagem PNG em alta resolução para enviar pelo WhatsApp"
                id="download-png-top-btn"
              >
                {isGeneratingPNG ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#25D366]" />
                    <span>Gerando Imagem...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Baixar Imagem (PNG)</span>
                    <span className="bg-[#25D366]/20 text-[#25D366] text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline">
                      WhatsApp
                    </span>
                  </>
                )}
              </button>

              {/* Baixar como PDF button using jspdf + html2canvas */}
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-md border border-[#FFD166] transition-all transform hover:scale-105 cursor-pointer disabled:opacity-60"
                title="Salvar a carta oficial como documento PDF usando jsPDF e html2canvas"
                id="download-pdf-btn"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD166]" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#FFD166]" />
                    <span>Baixar como PDF</span>
                  </>
                )}
              </button>

              {/* Mini-jogo Caça aos Doces button */}
              <button
                onClick={() => {
                  setShowCandyGame((prev) => !prev);
                  if (!showCandyGame) {
                    trackEvent("candy_game_toggled", { letterId: letter.id });
                  }
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
                  showCandyGame
                    ? "bg-[#D90429] text-white border-[#FFD166] shadow-[0_0_12px_rgba(255,209,102,0.4)]"
                    : "bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border-[#FFD166]/40"
                }`}
                title="Mini-jogo Caça aos Doces de Natal para a criança"
                id="candy-hunt-btn"
              >
                <span>🍬</span>
                <span>Caça aos Doces</span>
                {showCandyGame && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </button>

              {isPro ? (
                <button
                  onClick={handlePrintPDF}
                  className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/40 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Imprimir em folha A4"
                  id="pro-print-pdf-top-btn"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir A4</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    trackEvent("checkout_started", { source: "top_bar_btn" });
                    onOpenPaywall();
                  }}
                  className="bg-gradient-to-r from-[#FFD166] to-[#FFB703] text-[#060B19] font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Liberar Áudio & Vídeo (PRO)</span>
                </button>
              )}

              <button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => onOpenChildPage(letter)}
                className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Página da Criança</span>
              </button>
            </div>
          </div>

          {/* AUDIO PLAYER BAR (Section 6) */}
          <div className="no-print">
            <SantaAudioPlayer
              letterId={letter.id}
              letterContent={letter.content}
              childName={letter.childName}
              isPro={isPro}
              onUpgradeToPro={() => {
                trackEvent("checkout_started", { source: "audio_player" });
                onOpenPaywall();
              }}
            />
          </div>

          {/* VIDEO PERSONALIZADO AREA (Section 7) */}
          <div className="no-print bg-[#0B132B] border border-white/15 hover:border-[#FFD166]/40 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div
                className="w-12 h-12 rounded-2xl bg-[#D90429]/30 text-[#FFD166] flex items-center justify-center border border-[#FFD166]/40 shrink-0 cursor-pointer"
                onClick={handleOpenVideo}
              >
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                    🎬 O Papai Noel preparou um vídeo especialmente para você
                  </h4>
                  <span className="bg-[#D90429] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#FFD166]/40">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-[#EDF2F4]/70 mt-0.5">
                  Assista aos bastidores e veja os 3 passos de produção da mensagem animada do Polo Norte.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenVideo}
              className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/40 font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-105"
            >
              <span>▶ Assistir à mensagem</span>
            </button>
          </div>

          {/* MENSAGEM SECRETA DO PAPAI NOEL (Section 8) */}
          <div className="no-print">
            <SecretMessageCard
              letterId={letter.id}
              childName={letter.childName}
              achievements={letter.achievements}
              parentNotes={letter.parentNotes}
              initialSecret={letter.secretMessage}
              isPro={isPro}
              onUpgradeToPro={() => {
                trackEvent("checkout_started", { source: "secret_message" });
                onOpenPaywall();
              }}
            />
          </div>

          {/* MINI-JOGO CAÇA AOS DOCES (Banner e Container Interativo) */}
          <div className="no-print space-y-4">
            {!showCandyGame && (
              <div className="bg-gradient-to-r from-[#1C2541]/90 via-[#0B132B]/90 to-[#1C2541]/90 border border-[#FFD166]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#EF233C] border border-[#FFD166] flex items-center justify-center text-2xl shadow-md shrink-0 animate-bounce">
                    🍬
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                        Mini-Jogo: Caça aos Doces de Natal
                      </h4>
                      <span className="bg-[#D90429] text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border border-[#FFD166]/40">
                        Diversão para {letter.childName}
                      </span>
                    </div>
                    <p className="text-xs text-[#EDF2F4]/70 mt-0.5">
                      Os duendes esconderam doces mágicos pela tela! Toque neles para somar pontos e comemorar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCandyGame(true);
                    trackEvent("candy_game_started", { letterId: letter.id, source: "banner" });
                  }}
                  className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold text-xs px-5 py-2.5 rounded-full border border-[#FFD166] shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-105"
                  id="start-candy-game-banner-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                  <span>🎮 Jogar Caça aos Doces</span>
                </button>
              </div>
            )}

            <CandyHuntGame
              childName={letter.childName}
              isOpen={showCandyGame}
              onClose={() => setShowCandyGame(false)}
            />
          </div>

          {/* THE OFFICIAL PRINTABLE PARCHMENT LETTER */}
          <div
            id="printable-letter"
            className={`relative parchment-bg text-[#1C2541] rounded-3xl p-6 sm:p-14 border-4 border-[#FFD166] magical-shadow transition-colors duration-300 ${
              isReadingMode ? "parchment-reading-mode" : ""
            }`}
          >
            {/* Wax Seal */}
            <div className="absolute -top-6 -right-3 sm:-right-5 wax-seal w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border-2 border-[#FFD166] text-[#FFD166] shadow-xl">
              <span className="font-cinzel text-[8px] sm:text-[9px] font-black uppercase text-center leading-tight">
                POLO<br/>NORTE
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold">OFICIAL</span>
            </div>

            {/* Header Ribbon, Child's Portrait (when present) & Postal Stamp */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#1C2541]/15 pb-6 mb-8 gap-4">
              <div className="flex items-center gap-4">
                {letter.photoUrl && (
                  <div className="relative shrink-0">
                    <div className="bg-[#FFFDF9] p-1.5 rounded-xl shadow-md border-2 border-[#C49A45] transform -rotate-2 hover:rotate-0 transition-transform">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#C49A45]/40 relative bg-amber-50">
                        <img
                          src={letter.photoUrl}
                          alt={`Retrato de ${letter.childName}`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                        {isPro && (
                          <div className="absolute -bottom-1 -right-1 bg-[#D90429] text-[#FFD166] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#FFD166] shadow">
                            PRO
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-[9px] font-serif font-bold text-[#1C2541] block leading-none truncate max-w-[64px] sm:max-w-[80px]">
                          {letter.childName}
                        </span>
                        <span className="text-[7px] font-mono text-[#9B021A] block uppercase leading-none mt-0.5">
                          {isPro ? "Oficial" : "Prévia"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-cinzel text-xs font-black tracking-widest text-[#9B021A] uppercase block">
                    CORRESPONDÊNCIA OFICIAL DO POLO NORTE
                  </span>
                  <span className="text-xs text-[#1C2541]/70 font-serif">
                    Destinatário Especial: <strong>{letter.childName}</strong> ({letter.age} anos) • {letter.city}
                  </span>
                  {letter.photoUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#9B021A] font-semibold mt-1">
                      ✓ Retrato autenticado no Livro do Polo Norte
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="border border-dashed border-[#1C2541]/30 px-3 py-1.5 rounded-lg text-right">
                  <span className="text-[9px] font-mono text-[#1C2541]/60 block">REGISTRO POLAR</span>
                  <span className="font-mono text-xs font-bold text-[#9B021A]">{letter.token.toUpperCase()}</span>
                </div>
                <Stamp className="w-8 h-8 text-[#9B021A]/40 shrink-0" />
              </div>
            </div>

            {/* Letter Body */}
            <div className="font-serif text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line text-[#1C2541] space-y-4">
              {letter.content}
            </div>

            {/* Footer Signature & Royal Seal */}
            <div className="mt-12 pt-8 border-t border-[#1C2541]/20 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-cinzel uppercase tracking-wider text-[#1C2541]/60 block">
                  Certificado de Autenticidade & Livro Dourado
                </span>
                <span className="text-xs font-bold text-[#9B021A] font-cinzel">
                  Expresso Polar 2026 • Carta Mágica
                </span>
                <span className="text-[10px] text-[#1C2541]/50 block mt-0.5">
                  Emitido em {letter.date} para {letter.childName}
                </span>
              </div>

              <div className="text-center sm:text-right">
                <span className="font-handwriting text-4xl sm:text-5xl text-[#9B021A] font-bold block">
                  Papai Noel
                </span>
                <span className="text-[10px] text-[#1C2541]/60 block font-serif italic">
                  Oficina Central de Brinquedos • Polo Norte
                </span>
              </div>
            </div>

            {/* Watermark notice for Free users (Removed on Pro) */}
            {!isPro && (
              <div className="mt-6 pt-3 text-center border-t border-dashed border-[#1C2541]/20 no-print">
                <span className="text-xs text-[#9B021A] font-semibold">
                  Versão Gratuita de Degustação • Remova a marca d'água e desbloqueie o PDF para impressão no Plano PRO.
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions below letter */}
          <div className="no-print flex flex-wrap items-center justify-center gap-3 pt-1">
            {/* Baixar Imagem PNG button (WhatsApp) */}
            <button
              onClick={handleDownloadPNG}
              disabled={isGeneratingPNG}
              className="bg-[#1C2541] hover:bg-[#2A385B] text-white font-bold px-5 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg border-2 border-[#25D366]/80 hover:border-[#25D366] transition-transform hover:scale-105 cursor-pointer disabled:opacity-60"
              id="download-png-bottom-btn"
              title="Baixar carta como imagem PNG em alta resolução para enviar pelo WhatsApp"
            >
              {isGeneratingPNG ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#25D366]" />
                  <span>Gerando Imagem PNG...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-[#25D366]" />
                  <span>Baixar Imagem (PNG)</span>
                  <span className="bg-[#25D366]/25 text-[#25D366] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    WhatsApp
                  </span>
                </>
              )}
            </button>

            {/* Baixar Carta como PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-6 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg border-2 border-[#FFD166] transition-transform hover:scale-105 cursor-pointer disabled:opacity-60"
              id="download-pdf-bottom-btn"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFD166]" />
                  <span>Gerando Documento PDF Oficial...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#FFD166]" />
                  <span>Baixar Carta como PDF</span>
                </>
              )}
            </button>

            {/* Alternância de Modo Leitura */}
            <button
              onClick={() => setIsReadingMode((prev) => !prev)}
              className={`px-5 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer border-2 ${
                isReadingMode
                  ? "bg-[#FFD166] text-[#060B19] border-[#FFD166] shadow-[0_0_12px_rgba(255,209,102,0.4)]"
                  : "bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4] border-white/20"
              }`}
              id="toggle-reading-mode-bottom-btn"
            >
              {isReadingMode ? (
                <>
                  <Sun className="w-4 h-4 text-[#060B19]" />
                  <span>Modo Clássico Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#FFD166]" />
                  <span>Modo Leitura Noturna</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setShowCandyGame(true);
                trackEvent("candy_game_started", { letterId: letter.id, source: "bottom_btn" });
              }}
              className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/40 font-bold px-5 py-3 rounded-full text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              id="candy-game-bottom-btn"
            >
              <span>🍬</span>
              <span>Jogar Caça aos Doces</span>
            </button>
          </div>

          {/* REAÇÃO DA CRIANÇA (Section 10) */}
          <div className="no-print">
            <ChildReactionCard
              letterId={letter.id}
              childName={letter.childName}
              initialReaction={letter.childReaction}
            />
          </div>

          {/* MANDATED PRO UPGRADE CALLOUT (Section 4 - Natural Conversion) */}
          {!isPro && (
            <div className="no-print bg-gradient-to-r from-[#1C2541] via-[#0B132B] to-[#1C2541] border-2 border-[#FFD166] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
              <span className="bg-[#D90429] text-white text-[11px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#FFD166]/60 inline-block">
                ⭐ Experiência Completa do Polo Norte
              </span>

              <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white leading-tight">
                Quer transformar essa carta em uma experiência inesquecível?
              </h3>

              <p className="font-serif italic text-sm sm:text-base text-[#FFD166] max-w-lg mx-auto">
                “Imagine a reação dela ao ouvir o próprio nome na voz do Papai Noel.”
              </p>

              {/* Mandated List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left text-xs sm:text-sm text-white/90 bg-[#060B19]/70 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span>🎁</span>
                  <span>PDF ilustrado para imprimir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎅</span>
                  <span>Áudio personalizado do Papai Noel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎬</span>
                  <span>Vídeo personalizado do Papai Noel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Página exclusiva da criança</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <span>🚫</span>
                  <span>Experiência sem marca d’água</span>
                </div>
              </div>

              <div className="flex items-baseline justify-center gap-2 pt-1">
                <span className="font-cinzel text-3xl sm:text-4xl font-black text-[#FFD166]">
                  R$ 39,99
                </span>
                <span className="text-xs text-[#EDF2F4]/50">pagamento único vitalício</span>
              </div>

              <button
                onClick={() => {
                  trackEvent("checkout_started", { source: "conversion_banner" });
                  onOpenPaywall();
                }}
                className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 px-8 rounded-full shadow-lg border-2 border-[#FFD166] text-base cursor-pointer gold-glow transition-transform hover:scale-105 active:scale-95"
                id="pro-conversion-cta-btn"
              >
                ✨ Quero viver essa experiência
              </button>
            </div>
          )}

          {/* COMPARTILHAMENTO (Section 9) */}
          <div className="no-print bg-[#0B132B] border border-white/10 rounded-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 font-cinzel text-base font-bold text-white">
              <Heart className="w-5 h-5 text-[#EF233C] fill-[#EF233C]" />
              <span>Compartilhe esta magia</span>
            </div>

            <p className="text-xs text-[#EDF2F4]/70 max-w-md mx-auto">
              Envie o link exclusivo para os avós, padrinhos e familiares verem a carinha de alegria ao abrir a cartinha!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-105"
                id="share-whatsapp-btn"
              >
                <Share2 className="w-4 h-4" />
                <span>📱 Compartilhar no WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-white font-semibold px-4 py-2.5 rounded-full text-xs flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
                id="share-copy-link-btn"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copiado!" : "🔗 Copiar link"}</span>
              </button>
            </div>

            <div className="max-w-lg mx-auto bg-[#060B19] p-3 rounded-xl border border-white/5 text-[11px] text-[#EDF2F4]/60 font-mono break-all text-center">
              {window.location.origin}/natal/{letter.token}
            </div>
          </div>

        </div>
      )}

      {/* Video Pipeline Status Modal */}
      <VideoPipelineModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        childName={letter.childName}
        letterId={letter.id}
        photoUrl={letter.photoUrl}
        plan={letter.plan}
      />

    </div>
  );
}
