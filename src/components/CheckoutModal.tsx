import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Letter, ShippingAddress } from "../types";
import { ASAAS_CHECKOUT_URL } from "../services/api";
import {
  PaymentVisualState,
  PaymentErrorType,
  createAsaasPaymentViaEdgeFunction,
  checkOrderStatusInSupabase,
  monitorOrderPayment,
  saveExperienceToSupabase,
  createOrGetOrderInSupabase,
  getCachedOrderForLetter,
} from "../services/asaasPayment";
import { 
  X, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Truck, 
  Sparkles, 
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  RotateCcw
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
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [includePhysical, setIncludePhysical] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPixCode, setCopiedPixCode] = useState(false);

  // Estados visuais de pagamento:
  // "awaiting_payment" | "processing" | "approved" | "expired" | "refused"
  const [paymentState, setPaymentState] = useState<PaymentVisualState>("awaiting_payment");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<PaymentErrorType | null>(null);

  // Dados dinâmicos da cobrança do Asaas
  const [dynamicInvoiceUrl, setDynamicInvoiceUrl] = useState<string>(ASAAS_CHECKOUT_URL);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);
  const [experienceUuid, setExperienceUuid] = useState<string | null>(null);
  const [isLoadingPaymentData, setIsLoadingPaymentData] = useState<boolean>(false);

  // Formulário de envio postal físico
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

  const basePrice = 39.99;
  const shippingPrice = includePhysical ? 29.90 : 0;
  const totalPrice = Number((basePrice + shippingPrice).toFixed(2));

  // Referência para cancelamento do monitor
  const activeMonitorCleanup = useRef<(() => void) | null>(null);

  // Inicialização e recuperação de sessão
  const initPaymentFlow = async (forceNewCharge = false) => {
    if (!letter) return;
    setIsLoadingPaymentData(true);
    setErrorMessage(null);
    setErrorType(null);

    try {
      // 1. Sincronizar experiência com Supabase se necessário
      let expId = experienceUuid;
      if (!expId) {
        expId = await saveExperienceToSupabase(letter);
        if (expId) setExperienceUuid(expId);
      }

      // 2. Se não forçar nova cobrança, verificar cache local e status no Supabase
      if (!forceNewCharge) {
        const cached = getCachedOrderForLetter(letter.id);
        if (cached?.orderId) {
          const statusCheck = await checkOrderStatusInSupabase(cached.orderId);
          if (statusCheck.isPaid) {
            setPaymentState("approved");
            setIsLoadingPaymentData(false);
            setTimeout(() => {
              onSuccess(letter.id);
            }, 1800);
            return;
          }

          // Se estiver pendente com o mesmo tipo de envio, restaurar dados sem criar nova cobrança
          if (statusCheck.status === "pending" && cached.includePhysical === includePhysical) {
            setCurrentOrderId(cached.orderId);
            setCurrentOrderNumber(cached.orderNumber);
            if (cached.payment?.invoiceUrl) setDynamicInvoiceUrl(cached.payment.invoiceUrl);
            if (cached.payment?.pixQrCode) setPixQrCode(cached.payment.pixQrCode);
            if (cached.payment?.pixCopyPaste) setPixCopyPaste(cached.payment.pixCopyPaste);
            setPaymentState("awaiting_payment");
            setIsLoadingPaymentData(false);
            return;
          }
        }
      }

      // 3. Criar ou obter pedido no Supabase
      const orderInfo = await createOrGetOrderInSupabase({
        letter,
        experienceUuid: expId,
        includePhysical,
      });

      if (orderInfo.isAlreadyPaid) {
        setPaymentState("approved");
        setIsLoadingPaymentData(false);
        setTimeout(() => {
          onSuccess(letter.id);
        }, 1800);
        return;
      }

      if (orderInfo.orderId) {
        setCurrentOrderId(orderInfo.orderId);
      }
      if (orderInfo.orderNumber) {
        setCurrentOrderNumber(orderInfo.orderNumber);
      }

      // 4. Chamar a Supabase Edge Function asaas-create-payment
      const result = await createAsaasPaymentViaEdgeFunction({
        letterId: letter.id,
        childName: letter.childName,
        billingType: paymentMethod === "pix" ? "PIX" : "CREDIT_CARD",
        includePhysical,
        address: includePhysical ? address : undefined,
        orderId: orderInfo.orderId || currentOrderId || undefined,
        experienceUuid: expId || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Não foi possível gerar a cobrança no Asaas.");
        setErrorType(result.errorType || "charge_not_created");
        if (result.errorType === "expired") {
          setPaymentState("expired");
        } else if (result.errorType === "refused") {
          setPaymentState("refused");
        }
        return;
      }

      if (result.alreadyPaid) {
        setPaymentState("approved");
        setTimeout(() => {
          onSuccess(letter.id);
        }, 1800);
        return;
      }

      if (result.payment) {
        if (result.payment.invoiceUrl) setDynamicInvoiceUrl(result.payment.invoiceUrl);
        if (result.payment.pixQrCode) setPixQrCode(result.payment.pixQrCode);
        if (result.payment.pixCopyPaste) setPixCopyPaste(result.payment.pixCopyPaste);
        if (result.payment.orderId) setCurrentOrderId(result.payment.orderId);
        if (result.payment.orderNumber) setCurrentOrderNumber(result.payment.orderNumber);
        setPaymentState("awaiting_payment");
      }
    } catch (err: any) {
      console.warn("[CheckoutModal] Erro ao carregar pagamento:", err);
      setErrorMessage("Erro de comunicação ao preparar o checkout seguro.");
      setErrorType("communication_error");
    } finally {
      setIsLoadingPaymentData(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !letter) return;
    initPaymentFlow();
  }, [isOpen, letter?.id, paymentMethod, includePhysical]);

  // Monitorar pedido no Supabase em tempo real e polling controlado
  useEffect(() => {
    if (!isOpen || !letter || !currentOrderId) return;

    if (activeMonitorCleanup.current) {
      activeMonitorCleanup.current();
      activeMonitorCleanup.current = null;
    }

    const cleanup = monitorOrderPayment(currentOrderId, {
      onStatusChange: (status) => {
        if (status === "paid") {
          setPaymentState("approved");
        } else if (status === "failed") {
          setPaymentState("refused");
        }
      },
      onPaid: () => {
        // Status definitivo atualizado pelo webhook do Asaas via Supabase!
        setPaymentState("approved");
        setTimeout(() => {
          onSuccess(letter.id);
        }, 1800);
      },
      onFailed: () => {
        setPaymentState("refused");
      },
    });

    activeMonitorCleanup.current = cleanup;

    return () => {
      if (activeMonitorCleanup.current) {
        activeMonitorCleanup.current();
        activeMonitorCleanup.current = null;
      }
    };
  }, [isOpen, letter?.id, currentOrderId, onSuccess]);

  if (!isOpen || !letter) return null;

  const handleCopyAsaasLink = () => {
    navigator.clipboard.writeText(dynamicInvoiceUrl || ASAAS_CHECKOUT_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPixCode = () => {
    if (pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      setCopiedPixCode(true);
      setTimeout(() => setCopiedPixCode(false), 2500);
    }
  };

  const handleOpenAsaas = () => {
    window.open(dynamicInvoiceUrl || ASAAS_CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  const handleConfirmAndUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPaymentState("processing");
    setErrorMessage(null);

    if (currentOrderId) {
      const statusCheck = await checkOrderStatusInSupabase(currentOrderId);
      if (statusCheck.isPaid) {
        setPaymentState("approved");
        setTimeout(() => {
          onSuccess(letter.id);
        }, 1800);
        return;
      }

      if (statusCheck.status === "failed") {
        setPaymentState("refused");
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B132B] border border-[#FFD166]/40 rounded-3xl w-full max-w-xl p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EDF2F4]/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title="Fechar janela de checkout"
          aria-label="Fechar checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. ESTADO VISUAL: PAGAMENTO APROVADO */}
        {paymentState === "approved" ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-white">
              Pagamento Confirmado no Asaas!
            </h3>
            <p className="text-sm text-[#EDF2F4]/80 max-w-sm mx-auto">
              A <strong>Experiência Mágica PRO</strong> para <strong>{letter.childName}</strong> já está 100% liberada com áudio e PDF oficial.
            </p>
            <div className="text-xs text-[#FFD166] animate-pulse">
              Redirecionando para a carta oficial... ✨
            </div>
          </div>
        ) : paymentState === "processing" ? (
          /* 2. ESTADO VISUAL: PAGAMENTO EM PROCESSAMENTO */
          <div className="py-10 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-20 h-20 bg-amber-500/15 text-[#FFD166] rounded-full flex items-center justify-center mx-auto border-2 border-[#FFD166]/40 relative">
              <div className="w-10 h-10 border-3 border-[#FFD166] border-t-transparent rounded-full animate-spin" />
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#1C2541] border border-[#FFD166]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#FFD166]">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Pagamento em Processamento</span>
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                Aguardando Confirmação Bancária
              </h3>
              <p className="text-xs text-[#EDF2F4]/80 max-w-md mx-auto leading-relaxed">
                Estamos consultando a confirmação do <strong>Asaas</strong> em tempo real. Assim que o banco liquidar seu Pix ou aprovar seu cartão, a carta será liberada automaticamente.
              </p>
            </div>

            <div className="bg-[#060B19] border border-white/10 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-[#EDF2F4]/70">
                <span>Destinatário:</span>
                <span className="font-semibold text-white">{letter.childName}</span>
              </div>
              {currentOrderNumber && (
                <div className="flex items-center justify-between text-[#EDF2F4]/70">
                  <span>Código do Pedido:</span>
                  <span className="font-mono text-[#FFD166]">{currentOrderNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#EDF2F4]/70">
                <span>Tempo médio do Pix:</span>
                <span className="text-emerald-400 font-semibold">3 a 15 segundos</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmAndUnlock()}
                className="w-full sm:w-auto bg-[#1C2541] hover:bg-[#2A385B] text-white px-5 py-2.5 rounded-xl text-xs font-semibold border border-[#FFD166]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Verificar Novamente</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentState("awaiting_payment")}
                className="w-full sm:w-auto text-[#EDF2F4]/70 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Voltar para o QR Code / Link
              </button>
            </div>
          </div>
        ) : paymentState === "expired" || paymentState === "refused" ? (
          /* 3. ESTADO VISUAL: PAGAMENTO RECUSADO OU EXPIRADO */
          <div className="py-10 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border-2 border-rose-500/40">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-cinzel text-2xl font-bold text-white">
                {paymentState === "expired" ? "Cobrança Expirada" : "Pagamento Não Aprovado"}
              </h3>
              <p className="text-xs text-[#EDF2F4]/80 max-w-sm mx-auto leading-relaxed">
                {paymentState === "expired"
                  ? "O prazo de pagamento no Asaas expirou. Você pode gerar um novo QR Code ou link em um clique."
                  : "A instituição financeira ou emissor do cartão não concluiu a transação. Tente via Pix ou gere uma nova cobrança."}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => initPaymentFlow(true)}
                className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bold py-3 px-6 rounded-xl shadow-lg border border-[#FFD166] flex items-center justify-center gap-2 text-xs sm:text-sm mx-auto transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Gerar Nova Cobrança Segura</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4. ESTADO VISUAL: AGUARDANDO PAGAMENTO */
          <form onSubmit={handleConfirmAndUnlock} className="space-y-6">
            
            {/* Header with Asaas Integration Banner */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFD166] uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Checkout Seguro Asaas</span>
                </div>
                <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Gateway Oficial Asaas</span>
                </div>
              </div>

              <h3 className="font-cinzel text-2xl font-bold text-white">
                Finalizar Experiência PRO
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                Destinatário: <strong className="text-white">{letter.childName} ({letter.city})</strong>
              </p>
            </div>

            {/* Banner de Erro Tratado */}
            {errorMessage && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Aviso de Pagamento:</span>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => initPaymentFlow(true)}
                  className="text-[11px] underline text-rose-300 hover:text-white shrink-0 ml-1 cursor-pointer"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Asaas Main Direct Payment Card */}
            <div className="bg-gradient-to-br from-[#1C2541] to-[#0A1128] border-2 border-[#FFD166]/50 rounded-2xl p-4 sm:p-5 space-y-3 relative shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Link de Cobrança Ativo no Asaas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAsaasLink}
                  className="text-[11px] text-[#FFD166] hover:text-white bg-[#0B132B]/80 hover:bg-[#0B132B] px-2.5 py-1 rounded-lg border border-[#FFD166]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Link Asaas</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-[#EDF2F4]/80 leading-relaxed">
                Você pode realizar o pagamento direto na página oficial segura do <strong>Asaas</strong> via <strong>Pix com aprovação imediata</strong> ou <strong>Cartão de Crédito</strong>.
              </p>

              {/* Action: Open Asaas Button */}
              <button
                type="button"
                onClick={handleOpenAsaas}
                className="w-full bg-[#00B4D8] hover:bg-[#0096C7] text-white font-bold py-3 px-4 rounded-xl shadow-md border border-white/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Abrir Checkout Oficial no Asaas</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Method Selector (Pix / Card info via Asaas) */}
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
                <span>Pix no Asaas</span>
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
                <span>Cartão no Asaas</span>
              </button>
            </div>

            {paymentMethod === "pix" ? (
              <div className="bg-[#060B19] p-4 rounded-2xl border border-emerald-500/30 text-center space-y-2">
                <div className="inline-block bg-white p-2 rounded-xl">
                  {pixQrCode ? (
                    <img
                      src={pixQrCode}
                      alt="Pix QR Code Asaas"
                      className="w-28 h-28 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-emerald-950/20 flex flex-col items-center justify-center text-emerald-950 font-mono text-[10px] text-center font-bold">
                      <QrCode className="w-14 h-14 text-[#060B19] mb-1" />
                      <span>PIX ASAAS</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-emerald-300 font-semibold">
                  Aprovação em segundos no Asaas com liberação instantânea da carta e áudio.
                </p>
                {pixCopyPaste ? (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCopyPixCode}
                      className="inline-flex items-center gap-1.5 text-xs bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      {copiedPixCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Código Pix Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Código Pix Copia-e-Cola</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#EDF2F4]/60">
                    O QR Code e o código Pix Copia-e-Cola são gerados na tela do Asaas.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#060B19] p-4 rounded-2xl border border-white/10 space-y-2 text-xs text-[#EDF2F4]/80">
                <div className="flex items-center gap-2 text-white font-bold">
                  <CreditCard className="w-4 h-4 text-[#FFD166]" />
                  <span>Cartão de Crédito com Proteção Antifraude</span>
                </div>
                <p>
                  No Asaas, você digita os dados do cartão em um ambiente bancário criptografado com certificação PCI-DSS.
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
                <span>Total no Asaas:</span>
                <span className="text-[#FFD166] text-xl font-cinzel">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons: 1. Pay via Asaas / 2. Confirm Payment */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleOpenAsaas}
                className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-4 rounded-2xl shadow-lg border border-[#FFD166] flex items-center justify-center gap-2 text-sm sm:text-base transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer gold-glow"
                id="open-asaas-checkout-btn"
              >
                <Sparkles className="w-4 h-4 text-[#FFD166]" />
                <span>Pagar R$ {totalPrice.toFixed(2)} via Asaas (Pix / Cartão)</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>

              <button
                type="submit"
                disabled={isLoadingPaymentData}
                className="w-full bg-[#1C2541] hover:bg-[#2A385B] text-[#EDF2F4] font-semibold py-3 px-4 rounded-xl border border-white/15 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
                id="confirm-checkout-btn"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Já realizei o pagamento no Asaas • Verificar Confirmação</span>
              </button>
            </div>

            <div className="text-center text-[11px] text-[#EDF2F4]/50 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantia de 7 dias ou seu dinheiro de volta • Processamento seguro Asaas</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
