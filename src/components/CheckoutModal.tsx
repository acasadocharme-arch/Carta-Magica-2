import type React from "react";
import { useState } from "react";
import { Letter, ShippingAddress } from "../types";
import { processCheckoutAPI } from "../services/api";
import { 
  X, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Truck, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  letter: Letter | null;
  onClose: () => void;
  onSuccess: (upgradedLetterId: string) => void;
}

export default function CheckoutModal({
  isOpen,
  letter,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("pix");
  const [includePhysical, setIncludePhysical] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Address form for physical postage
  const [address, setAddress] = useState<ShippingAddress>({
    recipientName: letter ? `Aos cuidados dos pais de ${letter.childName}` : "",
    street: "",
    number: "",
    complement: "",
    city: letter?.city || "",
    state: "",
    zipCode: "",
    country: "Brasil"
  });

  if (!isOpen || !letter) return null;

  const basePrice = 39.99;
  const shippingPrice = includePhysical ? 29.90 : 0;
  const totalPrice = Number((basePrice + shippingPrice).toFixed(2));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await processCheckoutAPI({
        letterId: letter.id,
        childName: letter.childName,
        includePhysicalDispatch: includePhysical,
        address: includePhysical ? address : undefined
      });

      if (response && response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(false);
          onSuccess(letter.id);
        }, 1800);
      }
    } catch (err) {
      alert("Erro ao processar pagamento. Tente novamente.");
      setIsProcessing(false);
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

        {isSuccess ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-white">
              Pagamento Confirmado com Sucesso!
            </h3>
            <p className="text-sm text-[#EDF2F4]/80 max-w-sm mx-auto">
              A <strong>Experiência Mágica PRO</strong> para <strong>{letter.childName}</strong> já está 100% liberada com áudio e PDF.
            </p>
            <div className="text-xs text-[#FFD166] animate-pulse">
              Redirecionando para a carta oficial... ✨
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFD166] uppercase tracking-wider mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Ambiente Seguro 256-bit</span>
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                Finalizar Experiência PRO
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                Destinatário: <strong className="text-white">{letter.childName} ({letter.city})</strong>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("pix")}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "pix"
                    ? "bg-[#1C2541] border-[#FFD166] text-white ring-1 ring-[#FFD166]"
                    : "bg-[#060B19] border-white/10 text-[#EDF2F4]/70 hover:border-white/20"
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Pix Instantâneo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "card"
                    ? "bg-[#1C2541] border-[#FFD166] text-white ring-1 ring-[#FFD166]"
                    : "bg-[#060B19] border-white/10 text-[#EDF2F4]/70 hover:border-white/20"
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#FFD166]" />
                <span>Cartão de Crédito</span>
              </button>
            </div>

            {paymentMethod === "card" ? (
              <div className="space-y-3 bg-[#060B19] p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <label className="block text-[#EDF2F4]/80 mb-1 font-semibold uppercase">Número do Cartão</label>
                  <input
                    type="text"
                    required
                    placeholder="•••• •••• •••• 4242"
                    className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#EDF2F4]/80 mb-1 font-semibold uppercase">Validade</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#EDF2F4]/80 mb-1 font-semibold uppercase">CVC</label>
                    <input
                      type="text"
                      required
                      placeholder="•••"
                      className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#060B19] p-4 rounded-2xl border border-emerald-500/30 text-center space-y-2">
                <div className="inline-block bg-white p-2 rounded-xl">
                  <div className="w-32 h-32 bg-emerald-950/20 flex flex-col items-center justify-center text-emerald-950 font-mono text-[10px] text-center font-bold">
                    <QrCode className="w-16 h-16 text-[#060B19] mb-1" />
                    <span>PIX COPIA E COLA</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-300 font-semibold">
                  Aprovação em segundos e liberação instantânea.
                </p>
              </div>
            )}

            {/* Optional Physical Dispatch Addon */}
            <div className="bg-[#1C2541]/70 border border-[#FFD166]/30 rounded-2xl p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePhysical}
                  onChange={(e) => setIncludePhysical(e.target.checked)}
                  className="w-4 h-4 rounded mt-1 accent-[#D90429] cursor-pointer"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Truck className="w-3.5 h-3.5 text-[#FFD166]" />
                    <span>Adicionar Envio Físico Postal pelos Correios (+ R$ 29,90)</span>
                  </div>
                  <p className="text-[#EDF2F4]/70 mt-0.5 leading-snug">
                    Receba em casa a carta impressa em papel linho 180g, com selo de cera vermelha autêntico lacrado à mão e código de rastreamento do Polo Norte Express.
                  </p>
                </div>
              </label>

              {includePhysical && (
                <div className="pt-3 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">Destinatário</label>
                      <input
                        type="text"
                        required
                        value={address.recipientName}
                        onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                        placeholder="Nome do responsável"
                        className="w-full bg-[#060B19] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">CEP / Código Postal</label>
                      <input
                        type="text"
                        required
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        placeholder="01310-100"
                        className="w-full bg-[#060B19] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">Cidade / Estado</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="São Paulo, SP"
                        className="w-full bg-[#060B19] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[#EDF2F4]/80 mb-1 font-semibold">Rua e Número</label>
                      <input
                        type="text"
                        required
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="Av. Paulista, 1000, Apto 42"
                        className="w-full bg-[#060B19] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total breakdown */}
            <div className="bg-[#060B19] p-4 rounded-2xl border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#EDF2F4]/80">
                <span>Experiência Mágica PRO (Áudio + PDF A4 + Página da Criança)</span>
                <span>R$ 39,99</span>
              </div>
              {includePhysical && (
                <div className="flex justify-between text-[#FFD166]">
                  <span>Envio Postal Físico com Selo de Cera do Polo Norte</span>
                  <span>R$ 29,90</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-bold text-white text-sm">
                <span>Total a Pagar:</span>
                <span className="text-[#FFD166] text-xl font-cinzel">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 rounded-2xl shadow-lg border border-[#FFD166] flex items-center justify-center gap-2 text-sm sm:text-base transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer gold-glow"
              id="confirm-checkout-btn"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirmando Pagamento Seguro...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span>Pagar R$ {totalPrice.toFixed(2)} & Liberar Magia</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-[#EDF2F4]/50 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantia de 7 dias ou seu dinheiro de volta • Suporte natalino ativo</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
