import { useState } from "react";
import { UserProfile } from "../types";
import { 
  Sparkles, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  Truck, 
  LayoutDashboard, 
  LogOut, 
  MailOpen
} from "lucide-react";

interface NavbarProps {
  currentUser?: UserProfile | null;
  onNavigate: (view: string) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onStartWizard: (plan?: "free" | "pro") => void;
  onOpenLogistics: () => void;
  onOpenAdmin?: () => void;
  currentView?: string;
}

export default function Navbar({
  currentUser = null,
  onNavigate,
  onOpenAuth = () => {},
  onLogout = () => {},
  onStartWizard,
  onOpenLogistics,
  onOpenAdmin,
  currentView = "landing",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#060B19]/90 backdrop-blur-md border-b border-[#FFD166]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <button
          onClick={() => handleNavClick("landing")}
          className="flex items-center space-x-3 text-left group"
          id="navbar-logo-btn"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D90429] to-[#780016] flex items-center justify-center shadow-lg border border-[#FFD166]/60 group-hover:scale-105 transition-transform">
            <MailOpen className="w-5 h-5 text-[#FFD166]" />
          </div>
          <div>
            <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFE194] via-[#FFD166] to-[#FFB703] block leading-none">
              CARTA MÁGICA
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#EDF2F4]/60 uppercase font-semibold">
              Polo Norte Express
            </span>
          </div>
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-7 text-sm font-medium text-[#EDF2F4]/80">
          <button
            onClick={() => handleNavClick("landing")}
            className="hover:text-[#FFD166] transition-colors py-1 cursor-pointer"
          >
            Início
          </button>
          <button
            onClick={() => handleNavClick("landing", "como-funciona")}
            className="hover:text-[#FFD166] transition-colors py-1 cursor-pointer"
          >
            Como Funciona
          </button>
          <button
            onClick={() => handleNavClick("landing", "amostra")}
            className="hover:text-[#FFD166] transition-colors py-1 cursor-pointer"
          >
            Exemplo
          </button>
          <button
            onClick={() => handleNavClick("landing", "planos")}
            className="hover:text-[#FFD166] transition-colors py-1 cursor-pointer"
          >
            Planos
          </button>
          <button
            onClick={onOpenLogistics}
            className="hover:text-[#FFD166] transition-colors py-1 cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-[#FFD166]" />
            <span>Rastreio Postal</span>
          </button>
          <button
            onClick={() => handleNavClick("landing", "faq")}
            className="hover:text-[#FFD166] transition-colors py-1 cursor-pointer"
          >
            Dúvidas
          </button>
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-[#FFD166]/80 hover:text-[#FFD166] text-xs font-mono transition-colors py-1 cursor-pointer flex items-center gap-1 bg-[#1C2541]/60 px-2.5 py-1 rounded-lg border border-[#FFD166]/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>
          )}
        </div>

        {/* Right CTA / Auth controls */}
        <div className="hidden sm:flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate("dashboard")}
                className="flex items-center gap-1.5 bg-[#1C2541]/90 hover:bg-[#2A385B] text-xs font-semibold text-[#FFD166] px-3.5 py-2 rounded-full border border-[#FFD166]/30 transition-all shadow-sm"
                id="user-dashboard-nav-btn"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Minhas Cartas</span>
              </button>
              {currentUser.role === "admin" && (
                <button
                  onClick={() => onNavigate("admin")}
                  className="bg-emerald-950/80 hover:bg-emerald-900 text-[11px] font-bold text-emerald-300 px-2.5 py-2 rounded-full border border-emerald-500/30 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={onLogout}
                title="Sair"
                className="p-2 text-[#EDF2F4]/60 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-[#EDF2F4] hover:text-[#FFD166] px-3 py-2 transition-colors flex items-center gap-1.5"
              id="open-auth-nav-btn"
            >
              <User className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}

          <button
            onClick={() => onStartWizard("free")}
            className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-4 sm:px-5 py-2.5 rounded-full shadow-lg border border-[#FFD166]/40 text-xs sm:text-sm flex items-center gap-2 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            id="start-wizard-nav-btn"
          >
            <Sparkles className="w-4 h-4 text-[#FFD166] animate-pulse" />
            <span>Criar Minha Carta Grátis</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={() => onStartWizard("free")}
            className="bg-[#D90429] text-white font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#FFD166]" />
            <span>Criar</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#EDF2F4] hover:text-[#FFD166]"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B132B] border-b border-[#FFD166]/20 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm text-[#EDF2F4]/90 pb-3 border-b border-white/10 font-medium">
            <button
              onClick={() => handleNavClick("landing")}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick("landing", "como-funciona")}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Como Funciona
            </button>
            <button
              onClick={() => handleNavClick("landing", "amostra")}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Ver Exemplo
            </button>
            <button
              onClick={() => handleNavClick("landing", "planos")}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Planos & Preços
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogistics();
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/5 flex items-center gap-1 text-[#FFD166]"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Rastreio Postal</span>
            </button>
            <button
              onClick={() => handleNavClick("landing", "faq")}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Dúvidas FAQ
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate("dashboard");
                  }}
                  className="w-full bg-[#1C2541] text-[#FFD166] font-semibold py-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Área do Cliente ({currentUser.email.split("@")[0]})</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-xs text-[#EDF2F4]/60 py-1.5 hover:text-white"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full bg-[#1C2541] text-[#EDF2F4] font-semibold py-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Entrar na Área do Cliente</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartWizard("free");
              }}
              className="w-full bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bold py-3 rounded-xl text-sm shadow-md text-center"
            >
              ✨ Criar Minha Carta Grátis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
