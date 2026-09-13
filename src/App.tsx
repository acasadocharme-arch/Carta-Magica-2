import { useState, useEffect } from "react";
import SnowCanvas from "./components/SnowCanvas";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import HowItWorks from "./components/HowItWorks";
import SampleLetterPreview from "./components/SampleLetterPreview";
import PricingSection from "./components/PricingSection";
import FAQSection from "./components/FAQSection";
import FinalCTA from "./components/FinalCTA";
import CreationWizard from "./components/CreationWizard";
import LetterView from "./components/LetterView";
import ChildPublicView from "./components/ChildPublicView";
import AdminPanel from "./components/AdminPanel";
import PaywallModal from "./components/PaywallModal";
import CheckoutModal from "./components/CheckoutModal";
import LogisticsModal from "./components/LogisticsModal";
import { AudioPlayer } from "./components/AudioPlayer";
import { Letter, PlanType } from "./types";
import { fetchLetterByTokenAPI } from "./services/api";
import { initUTMTracking, trackEvent } from "./services/analytics";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "wizard" | "letter" | "child" | "admin">("landing");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free");
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);

  // Modals
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);

  // Handle URL paths and UTM initialization on mount
  useEffect(() => {
    initUTMTracking();
    trackEvent("landing_view");

    const path = window.location.pathname;
    if (path.startsWith("/natal/")) {
      const token = path.replace("/natal/", "").trim();
      if (token) {
        fetchLetterByTokenAPI(token).then((letter) => {
          if (letter) {
            setCurrentLetter(letter);
            setCurrentView("child");
          }
        });
      }
    } else if (path === "/admin") {
      setCurrentView("admin");
    }
  }, []);

  const handleStartWizard = (plan: PlanType = "free") => {
    trackEvent("start_letter", { plan });
    setSelectedPlan(plan);
    setCurrentView("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLetterGenerated = (letter: Letter) => {
    setCurrentLetter(letter);
    setCurrentView("letter");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenPaywall = () => {
    setIsPaywallOpen(true);
  };

  const handleProceedToCheckout = () => {
    trackEvent("checkout_started", { letterId: currentLetter?.id });
    setIsPaywallOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (upgradedLetterId: string) => {
    trackEvent("purchase_completed", { letterId: upgradedLetterId, amount: 39.99 });
    setIsCheckoutOpen(false);
    if (currentLetter && currentLetter.id === upgradedLetterId) {
      setCurrentLetter({ ...currentLetter, plan: "pro" });
    }
  };

  const scrollToSection = (id: string) => {
    if (currentView !== "landing") {
      setCurrentView("landing");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#060B19] text-[#EDF2F4] relative selection:bg-[#D90429] selection:text-white flex flex-col justify-between overflow-x-hidden w-full">
      
      {/* Subtle Interactive Falling Snow Canvas */}
      <SnowCanvas />

      {/* Header Navigation Bar */}
      <Navbar
        onNavigate={(v) => setCurrentView(v as any)}
        onStartWizard={() => handleStartWizard("free")}
        onOpenLogistics={() => setIsLogisticsOpen(true)}
        onOpenAdmin={() => setCurrentView("admin")}
        currentView={currentView}
      />

      {/* Main View Switcher */}
      <main className="flex-1 z-10 w-full overflow-x-hidden">
        {currentView === "landing" && (
          <div className="animate-in fade-in duration-300">
            <LandingHero
              onStartWizard={handleStartWizard}
              onScrollTo={scrollToSection}
              onViewSample={() => scrollToSection("amostra")}
            />
            <HowItWorks
              onStartWizard={() => handleStartWizard("free")}
              onOpenLogistics={() => setIsLogisticsOpen(true)}
            />
            <SampleLetterPreview
              onStartWizard={handleStartWizard}
            />
            <PricingSection
              onStartWizard={handleStartWizard}
              onOpenLogistics={() => setIsLogisticsOpen(true)}
            />
            <FAQSection />
            <FinalCTA
              onStartWizard={handleStartWizard}
            />
          </div>
        )}

        {currentView === "wizard" && (
          <CreationWizard
            initialPlan={selectedPlan}
            onCancel={() => setCurrentView("landing")}
            onLetterGenerated={handleLetterGenerated}
          />
        )}

        {currentView === "letter" && currentLetter && (
          <LetterView
            letter={currentLetter}
            onBackToDashboard={() => setCurrentView("landing")}
            onOpenPaywall={handleOpenPaywall}
            onOpenChildPage={(l) => {
              setCurrentLetter(l);
              setCurrentView("child");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenLogistics={() => setIsLogisticsOpen(true)}
          />
        )}

        {currentView === "child" && currentLetter && (
          <ChildPublicView
            letter={currentLetter}
            onGoHome={() => setCurrentView("landing")}
            onCreateFreeLetter={() => handleStartWizard("free")}
          />
        )}

        {currentView === "admin" && (
          <AdminPanel
            onBack={() => setCurrentView("landing")}
            onViewLetter={(l) => {
              setCurrentLetter(l);
              setCurrentView("letter");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-[#03060E] border-t border-white/10 py-12 px-4 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#EDF2F4]/60">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D90429] flex items-center justify-center text-white font-black text-sm border border-[#FFD166]/60">
              🎅
            </div>
            <div>
              <span className="font-cinzel text-sm font-bold text-white block">
                CARTA MÁGICA
              </span>
              <span>Experiências Personalizadas de Natal © 2026</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => scrollToSection("como-funciona")} className="hover:text-white cursor-pointer">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection("planos")} className="hover:text-white cursor-pointer">
              Planos & Preços
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-white cursor-pointer">
              Dúvidas
            </button>
            <button onClick={() => setIsLogisticsOpen(true)} className="hover:text-white cursor-pointer">
              Envio Postal Físico
            </button>
            <button onClick={() => setCurrentView("admin")} className="hover:text-[#FFD166] text-[11px] font-mono cursor-pointer">
              Área Admin
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacidade infantil protegida por design</span>
          </div>

        </div>
      </footer>

      {/* Discrete Ambient Christmas Audio Player */}
      <AudioPlayer />

      {/* MODALS */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        letter={currentLetter}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <LogisticsModal
        isOpen={isLogisticsOpen}
        onClose={() => setIsLogisticsOpen(false)}
        onStartOrder={() => handleStartWizard("pro")}
      />

    </div>
  );
}
