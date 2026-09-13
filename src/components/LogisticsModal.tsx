import type React from "react";
import { useState } from "react";
import { X, Truck, MapPin, Clock, ShieldCheck, Check, Sparkles, Search } from "lucide-react";
import { calculateShippingAPI } from "../services/api";

interface LogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOrder: () => void;
}

export default function LogisticsModal({
  isOpen,
  onClose,
  onStartOrder,
}: LogisticsModalProps) {
  const [zipCode, setZipCode] = useState("01310-100");
  const [country, setCountry] = useState("Brasil");
  const [isLoading, setIsLoading] = useState(false);
  const [shippingResult, setShippingResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await calculateShippingAPI(zipCode, country);
      setShippingResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B132B] border border-[#FFD166]/40 rounded-3xl w-full max-w-xl p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EDF2F4]/60 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 bg-[#1C2541] border border-[#FFD166]/30 px-3.5 py-1 rounded-full text-xs text-[#FFD166]">
            <Truck className="w-3.5 h-3.5" />
            <span>Serviço Postal Aéreo Oficial</span>
          </div>
          <h3 className="font-cinzel text-2xl font-bold text-white">
            Simulador de Frete & Envio Postal
          </h3>
          <p className="text-xs text-[#EDF2F4]/75 max-w-md mx-auto">
            Receba a carta em papel linho nobre com lacre de cera vermelha artesanal e carimbo postal do Polo Norte.
          </p>
        </div>

        {/* Shipping Simulator Form */}
        <form onSubmit={handleSimulate} className="bg-[#060B19] p-4 rounded-2xl border border-white/10 space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">País de Destino</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3 py-2 text-white"
              >
                <option value="Brasil">Brasil (Sedex / Carta Registrada)</option>
                <option value="Portugal">Portugal (Correios CTT)</option>
                <option value="Estados Unidos">Estados Unidos (USPS)</option>
                <option value="Internacional">Outro País (Prioritário)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">CEP ou Código Postal</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="01310-100"
                  className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#D90429] hover:bg-[#EF233C] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Calcular</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Results */}
        {shippingResult && (
          <div className="bg-[#1C2541]/70 border border-[#FFD166]/40 rounded-2xl p-5 mb-6 space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-cinzel text-white font-bold text-sm">Opção Postal Selecionada</span>
              <span className="text-emerald-400 font-bold text-sm">R$ {shippingResult.cost?.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[#EDF2F4]/80">
              <div><strong className="text-white">Modalidade:</strong> {shippingResult.service}</div>
              <div><strong className="text-white">Prazo Estimado:</strong> {shippingResult.estimatedDays}</div>
              <div><strong className="text-white">Embalagem:</strong> {shippingResult.packaging}</div>
              <div><strong className="text-white">Rastreamento:</strong> Incluído (Polo Norte Express)</div>
            </div>
            <div className="pt-2 text-[11px] text-[#FFD166]">
              ✨ Garantia de postagem prioritária para chegar antes da véspera de Natal!
            </div>
          </div>
        )}

        {/* Features of the Physical Package */}
        <div className="space-y-2 mb-6 text-xs text-[#EDF2F4]/80">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FFD166]" />
            <span>Papel nobre estilo pergaminho de linho 180g (toque macio e envelhecido)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FFD166]" />
            <span>Selo de cera de abelha vermelha com brasão metálico do Polo Norte</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FFD166]" />
            <span>Envelope endereçado com caligrafia clássica especial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FFD166]" />
            <span>Código de rastreamento interativo para a criança acompanhar a viagem</span>
          </div>
        </div>

        {/* Action button */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onStartOrder();
            }}
            className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] text-white font-bold py-3.5 rounded-2xl shadow-lg border border-[#FFD166] text-sm cursor-pointer gold-glow"
          >
            <span>Iniciar Carta com Envio Físico Postal</span>
          </button>
          <div className="text-center text-[11px] text-[#EDF2F4]/50">
            Você também pode optar pelo envio físico ao concluir a carta digital.
          </div>
        </div>

      </div>
    </div>
  );
}
