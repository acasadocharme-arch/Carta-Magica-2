import { useState, useEffect } from "react";
import { getAdminMetricsAPI, fetchLettersAPI, ASAAS_CHECKOUT_URL } from "../services/api";
import { AdminMetrics, Letter } from "../types";
import { 
  BarChart3, 
  DollarSign, 
  Mail, 
  Truck, 
  Users, 
  Database, 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw,
  CheckCircle2,
  Clock,
  Code,
  Gauge,
  Sparkles,
  ShieldCheck,
  Copy,
  Check
} from "lucide-react";

interface AdminPanelProps {
  onBack: () => void;
  onViewLetter: (letter: Letter) => void;
}

export default function AdminPanel({ onBack, onViewLetter }: AdminPanelProps) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSqlBlueprint, setShowSqlBlueprint] = useState(false);
  const [sqlBlueprint, setSqlBlueprint] = useState<string>("");
  const [copiedAsaasLink, setCopiedAsaasLink] = useState(false);

  // Sleigh speed state in seconds
  const [sleighSpeed, setSleighSpeed] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("santa_sleigh_speed");
      if (saved) {
        const val = Number(saved);
        if (!isNaN(val) && val >= 6 && val <= 60) return val;
      }
    }
    return 26;
  });

  const handleSpeedChange = (newSpeed: number) => {
    setSleighSpeed(newSpeed);
    localStorage.setItem("santa_sleigh_speed", String(newSpeed));
    window.dispatchEvent(new CustomEvent("sleigh-speed-change", { detail: { speed: newSpeed } }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, l] = await Promise.all([
        getAdminMetricsAPI(),
        fetchLettersAPI()
      ]);
      setMetrics(m);
      setLetters(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadSupabaseBlueprint = async () => {
    try {
      const res = await fetch("/api/supabase-blueprint");
      const data = await res.json();
      setSqlBlueprint(data.schema || "");
      setShowSqlBlueprint(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-[#EDF2F4]/70 hover:text-white flex items-center gap-1.5 mb-2 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o site</span>
          </button>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span>Centro de Operações do Polo Norte</span>
            <span className="bg-[#D90429] text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase">
              Admin
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSupabaseBlueprint}
            className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] border border-[#FFD166]/30 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Ver Schema Supabase</span>
          </button>

          <button
            onClick={loadData}
            className="bg-[#0B132B] hover:bg-[#1C2541] text-white border border-white/10 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#0B132B] border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#EDF2F4]/60 text-xs">
              <span>Total de Cartas Criadas</span>
              <Mail className="w-4 h-4 text-[#FFD166]" />
            </div>
            <div className="font-cinzel text-3xl font-bold text-white">
              {metrics.totalLettersGenerated}
            </div>
            <div className="text-[11px] text-emerald-400">
              +{metrics.todayLetters} hoje na fábrica
            </div>
          </div>

          <div className="bg-[#0B132B] border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#EDF2F4]/60 text-xs">
              <span>Taxa de Conversão PRO</span>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-cinzel text-3xl font-bold text-white">
              {metrics.proConversionRate}%
            </div>
            <div className="text-[11px] text-[#EDF2F4]/60">
              {metrics.proLetters} assinaturas Pro
            </div>
          </div>

          <div className="bg-[#0B132B] border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#EDF2F4]/60 text-xs">
              <span>Faturamento Total</span>
              <DollarSign className="w-4 h-4 text-[#FFD166]" />
            </div>
            <div className="font-cinzel text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFE194] to-[#FFD166]">
              R$ {metrics.totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#EDF2F4]/60">
              Ticket médio R$ 42,80
            </div>
          </div>

          <div className="bg-[#0B132B] border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#EDF2F4]/60 text-xs">
              <span>Envios Postais Físicos</span>
              <Truck className="w-4 h-4 text-[#D90429]" />
            </div>
            <div className="font-cinzel text-3xl font-bold text-white">
              {metrics.physicalDispatches}
            </div>
            <div className="text-[11px] text-emerald-400">
              Remessas com selo de cera
            </div>
          </div>

        </div>
      )}

      {/* Sleigh Flight Speed Controller Card */}
      <div className="bg-[#0B132B] border border-[#FFD166]/20 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D90429]/20 border border-[#D90429]/50 flex items-center justify-center text-[#FFD166]">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                <span>Velocidade de Voo do Trenó do Papai Noel</span>
                <span className="text-[11px] font-sans font-semibold bg-[#1C2541] text-[#FFD166] px-2.5 py-0.5 rounded-full border border-white/10">
                  Tela Inicial
                </span>
              </h3>
              <p className="text-xs text-[#EDF2F4]/70">
                Ajuste deslizante para regular a velocidade com que o trenó e as renas cruzam o céu noturno da aplicação.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#1C2541] border border-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166] animate-pulse" />
              <span className="text-xs text-white font-bold font-mono">
                {sleighSpeed}s de travessia
              </span>
              <span className="text-[10px] text-[#FFD166] font-medium hidden sm:inline">
                ({sleighSpeed <= 14 ? "⚡ Rápido" : sleighSpeed <= 28 ? "✨ Equilibrado" : "🌙 Suave"})
              </span>
            </div>

            {sleighSpeed !== 26 && (
              <button
                onClick={() => handleSpeedChange(26)}
                className="text-xs text-[#EDF2F4]/60 hover:text-white underline cursor-pointer"
                title="Voltar ao tempo padrão de 26 segundos"
              >
                Restaurar Padrão
              </button>
            )}
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="8"
            max="45"
            step="1"
            value={sleighSpeed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-[#1C2541] rounded-lg appearance-none cursor-pointer accent-[#EF233C]"
            id="admin-sleigh-speed-slider"
            aria-label="Ajustar velocidade de voo do trenó"
          />
          <div className="flex justify-between text-[11px] text-[#EDF2F4]/50 px-1 font-mono">
            <span>8s (Mais Rápido)</span>
            <span className="text-[#FFD166]">26s (Padrão Recomendado)</span>
            <span>45s (Voo Suave & Contemplativo)</span>
          </div>
        </div>
      </div>

      {/* Active Asaas Payment Gateway Status Card */}
      <div className="bg-[#0B132B] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Gateway de Pagamento Asaas
                </h3>
                <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo & Conectado
                </span>
              </div>
              <p className="text-xs text-[#EDF2F4]/70">
                Cobrança oficial com suporte a Pix Instantâneo e Cartão de Crédito.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                navigator.clipboard.writeText(ASAAS_CHECKOUT_URL);
                setCopiedAsaasLink(true);
                setTimeout(() => setCopiedAsaasLink(false), 2500);
              }}
              className="bg-[#1C2541] hover:bg-[#2A385B] text-white border border-white/10 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedAsaasLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link Asaas</span>
                </>
              )}
            </button>

            <a
              href={ASAAS_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Abrir Página Asaas</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="bg-[#060B19] rounded-2xl p-3 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[#EDF2F4]/60">URL do Checkout Asaas:</span>
          <span className="text-[#FFD166] break-all">{ASAAS_CHECKOUT_URL}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0B132B] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-cinzel text-lg font-bold text-white">
              Pedidos Recentes de Experiências
            </h3>
            <p className="text-xs text-[#EDF2F4]/60">
              Gerencie cartas, status de pagamento e remessas dos correios.
            </p>
          </div>
          <span className="text-xs text-[#FFD166] font-mono font-semibold">
            {metrics?.recentOrders.length || 0} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#EDF2F4]/50 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">ID / Data</th>
                <th className="py-3 px-4">Criança / Cidade</th>
                <th className="py-3 px-4">Plano</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logística Postal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#EDF2F4]/80">
              {metrics?.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-white block font-bold">{order.id}</span>
                    <span className="text-[10px] text-[#EDF2F4]/40">{order.createdAt}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-semibold block">{order.childName}</span>
                    <span className="text-[10px] text-[#EDF2F4]/50">{order.city}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.plan === "pro"
                        ? "bg-[#D90429]/30 text-[#FFD166] border border-[#FFD166]/40"
                        : "bg-white/10 text-white"
                    }`}>
                      {order.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    R$ {order.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      order.status === "paid"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-950 text-amber-300"
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {order.status === "paid" ? "Aprovado" : order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {order.trackingCode ? (
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-[#FFD166] block">
                          {order.trackingCode}
                        </span>
                        <span className="text-[9px] text-emerald-400 capitalize block">
                          • {order.shippingStatus || "Em trânsito"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#EDF2F4]/40">Apenas Digital</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Letters List with Direct Preview */}
      <div className="bg-[#0B132B] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-cinzel text-lg font-bold text-white">
          Todas as Cartas Criadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {letters.map((letter) => (
            <div
              key={letter.id}
              className="bg-[#060B19] border border-white/10 hover:border-[#FFD166]/50 rounded-2xl p-4 flex justify-between items-center transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{letter.childName}</span>
                  <span className="text-xs text-[#EDF2F4]/50">({letter.age} anos, {letter.city})</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    letter.plan === "pro" ? "bg-[#D90429] text-white" : "bg-white/10 text-[#FFD166]"
                  }`}>
                    {letter.plan}
                  </span>
                </div>
                <p className="text-xs text-[#EDF2F4]/70 line-clamp-1 mt-1 font-serif italic">
                  "{letter.content.slice(0, 80)}..."
                </p>
                <span className="text-[10px] text-[#EDF2F4]/40 font-mono mt-1 block">
                  Token: {letter.token} • {letter.date}
                </span>
              </div>

              <button
                onClick={() => onViewLetter(letter)}
                className="bg-[#1C2541] hover:bg-[#2A385B] text-[#FFD166] text-xs font-bold px-3 py-2 rounded-xl border border-[#FFD166]/30 flex items-center gap-1 cursor-pointer shrink-0 ml-3"
              >
                <span>Ver Carta</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Supabase Schema Modal */}
      {showSqlBlueprint && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-[#FFD166]/50 rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[#FFD166] font-cinzel font-bold">
                <Database className="w-5 h-5" />
                <span>Blueprint SQL do Supabase (Pronto para Execução)</span>
              </div>
              <button
                onClick={() => setShowSqlBlueprint(false)}
                className="text-[#EDF2F4]/60 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-[#EDF2F4]/70 mb-3">
              Estrutura de tabelas PostgreSQL com Row Level Security (RLS) para persistência em nuvem durável:
            </p>

            <pre className="bg-[#060B19] p-4 rounded-xl border border-white/10 text-emerald-400 font-mono text-[11px] overflow-auto flex-1 leading-relaxed">
              {sqlBlueprint}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
