import { supabase, isSupabaseConfigured, getOrEnsureAuthToken } from "../lib/supabase";
import { Letter, ShippingAddress } from "../types";

export type PaymentVisualState =
  | "idle"
  | "awaiting_payment"
  | "processing"
  | "approved"
  | "expired"
  | "refused";

export type PaymentErrorType =
  | "charge_not_created"
  | "communication_error"
  | "expired"
  | "refused"
  | "order_not_found"
  | "unauthenticated"
  | "forbidden_access"
  | "unknown";

export interface AsaasPaymentData {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  dueDate?: string;
}

export interface AsaasPaymentResult {
  success: boolean;
  payment?: AsaasPaymentData;
  reused?: boolean;
  alreadyPaid?: boolean;
  error?: string;
  errorType?: PaymentErrorType;
  message?: string;
}

export interface CachedOrderData {
  orderId: string;
  orderNumber: string;
  experienceId?: string;
  letterId: string;
  amount: number;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  includePhysical: boolean;
  payment?: AsaasPaymentData;
  status: "pending" | "paid" | "failed" | "refunded";
  timestamp: number;
}

const CACHE_KEY_PREFIX = "cartamagica_order_";

/**
 * Validador de formato UUID v4
 */
export function isUUID(str?: string | null): boolean {
  return Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str));
}

/**
 * Recupera o pedido em andamento salvo no armazenamento local do navegador.
 * Evita criar cobranças duplicadas se o usuário recarregar ou retornar à página.
 */
export function getCachedOrderForLetter(letterId: string): CachedOrderData | null {
  if (typeof window === "undefined" || !letterId) return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${letterId}`);
    if (!raw) return null;
    const data: CachedOrderData = JSON.parse(raw);
    // Validade máxima de 24 horas para o cache do pedido
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${letterId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Salva o pedido ativo no armazenamento local do navegador para persistência de sessão.
 */
export function setCachedOrderForLetter(letterId: string, orderData: Partial<CachedOrderData>): void {
  if (typeof window === "undefined" || !letterId) return;
  try {
    const existing = getCachedOrderForLetter(letterId) || ({} as Partial<CachedOrderData>);
    const updated: CachedOrderData = {
      orderId: orderData.orderId || existing.orderId || "",
      orderNumber: orderData.orderNumber || existing.orderNumber || "",
      experienceId: orderData.experienceId || existing.experienceId,
      letterId,
      amount: orderData.amount || existing.amount || 39.99,
      billingType: orderData.billingType || existing.billingType || "PIX",
      includePhysical: Boolean(orderData.includePhysical ?? existing.includePhysical),
      payment: orderData.payment || existing.payment,
      status: orderData.status || existing.status || "pending",
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${letterId}`, JSON.stringify(updated));
  } catch {
    // Falha silenciosa de localStorage
  }
}

/**
 * Remove o cache de pedido do armazenamento local.
 */
export function clearCachedOrderForLetter(letterId: string): void {
  if (typeof window === "undefined" || !letterId) return;
  try {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${letterId}`);
  } catch {
    // Ignorar
  }
}

/**
 * Sincroniza a carta criada com a tabela 'experiences' do Supabase.
 * Retorna o UUID da experiência salva no Supabase para vinculação estrita com o pedido.
 */
export async function saveExperienceToSupabase(letter: Letter): Promise<string | null> {
  if (!isSupabaseConfigured || !letter) return null;

  try {
    const { userId } = await getOrEnsureAuthToken();
    if (!userId) return null;

    // Verificar se a experiência já existe no Supabase pelo token
    const { data: existing } = await supabase
      .from("experiences")
      .select("id, plan, token")
      .eq("token", letter.token)
      .maybeSingle();

    if (existing?.id) {
      return existing.id;
    }

    // Inserir nova experiência respeitando estritamente o RLS (auth.uid() = user_id)
    const { data: created, error } = await supabase
      .from("experiences")
      .insert({
        user_id: userId,
        child_name: letter.childName,
        age: letter.age,
        city: letter.city,
        achievements: letter.achievements || null,
        gift_request: letter.giftRequest || null,
        parent_notes: letter.parentNotes || null,
        style: letter.style || "mágico",
        plan: letter.plan || "free",
        letter_content: letter.content,
        token: letter.token,
        photo_url: letter.photoUrl || null,
        delivery_status: letter.deliveryStatus || "digital_only",
        tracking_code: letter.trackingCode || null,
      })
      .select("id")
      .single();

    if (!error && created?.id) {
      return created.id;
    }
  } catch (err) {
    console.warn("[asaasPayment] Aviso ao salvar experiência no Supabase:", err);
  }

  return null;
}

/**
 * Cria ou recupera um pedido existente no Supabase para a experiência selecionada.
 * Respeita as políticas RLS e evita cobranças duplicadas.
 */
export async function createOrGetOrderInSupabase(params: {
  letter: Letter;
  experienceUuid?: string | null;
  includePhysical?: boolean;
}): Promise<{
  orderId: string | null;
  orderNumber: string | null;
  status: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  isAlreadyPaid: boolean;
}> {
  const basePrice = 39.99;
  const shippingPrice = params.includePhysical ? 29.90 : 0;
  const calculatedAmount = Number((basePrice + shippingPrice).toFixed(2));

  // 1. Checar cache local primeiro
  const cached = getCachedOrderForLetter(params.letter.id);
  if (cached?.orderId) {
    const { isPaid, status, order } = await checkOrderStatusInSupabase(cached.orderId);
    if (isPaid) {
      return {
        orderId: cached.orderId,
        orderNumber: cached.orderNumber,
        status: "paid",
        amount: cached.amount,
        isAlreadyPaid: true,
      };
    }
    if (status === "pending" && cached.includePhysical === Boolean(params.includePhysical)) {
      return {
        orderId: cached.orderId,
        orderNumber: cached.orderNumber,
        status: "pending",
        amount: cached.amount,
        isAlreadyPaid: false,
      };
    }
  }

  if (!isSupabaseConfigured) {
    const simOrderId = `ord_sim_${params.letter.id.slice(0, 8)}`;
    const simOrderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    return {
      orderId: simOrderId,
      orderNumber: simOrderNumber,
      status: "pending",
      amount: calculatedAmount,
      isAlreadyPaid: false,
    };
  }

  try {
    const { userId } = await getOrEnsureAuthToken();
    if (!userId) {
      return { orderId: null, orderNumber: null, status: "pending", amount: calculatedAmount, isAlreadyPaid: false };
    }

    const expId = params.experienceUuid && isUUID(params.experienceUuid) ? params.experienceUuid : null;

    // 2. Verificar se já existe um pedido no Supabase para este usuário e experiência
    if (expId) {
      const { data: existingOrders } = await supabase
        .from("orders")
        .select("id, order_number, amount, status, include_physical, paid_at")
        .eq("user_id", userId)
        .eq("experience_id", expId)
        .order("created_at", { ascending: false })
        .limit(2);

      if (existingOrders && existingOrders.length > 0) {
        // Se houver algum já pago, priorizar
        const paidOrder = existingOrders.find((o) => o.status === "paid");
        if (paidOrder) {
          setCachedOrderForLetter(params.letter.id, {
            orderId: paidOrder.id,
            orderNumber: paidOrder.order_number,
            experienceId: expId,
            status: "paid",
            amount: Number(paidOrder.amount),
          });
          return {
            orderId: paidOrder.id,
            orderNumber: paidOrder.order_number,
            status: "paid",
            amount: Number(paidOrder.amount),
            isAlreadyPaid: true,
          };
        }

        // Se houver pedido pendente compatível com a modalidade de envio físico
        const pendingOrder = existingOrders.find(
          (o) => o.status === "pending" && Boolean(o.include_physical) === Boolean(params.includePhysical)
        );
        if (pendingOrder) {
          setCachedOrderForLetter(params.letter.id, {
            orderId: pendingOrder.id,
            orderNumber: pendingOrder.order_number,
            experienceId: expId,
            status: "pending",
            amount: Number(pendingOrder.amount),
            includePhysical: Boolean(params.includePhysical),
          });
          return {
            orderId: pendingOrder.id,
            orderNumber: pendingOrder.order_number,
            status: "pending",
            amount: Number(pendingOrder.amount),
            isAlreadyPaid: false,
          };
        }
      }
    }

    // 3. Tentar criar o pedido pendente via Supabase (com status = 'pending' garantido pelo cliente)
    // Se as políticas de RLS permitirem inserção de pedidos pelo usuário autenticado:
    const newOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: createdOrder, error: insertErr } = await supabase
      .from("orders")
      .insert({
        order_number: newOrderNumber,
        experience_id: expId,
        user_id: userId,
        amount: calculatedAmount,
        status: "pending",
        include_physical: Boolean(params.includePhysical),
        payment_method: "Asaas",
      })
      .select("id, order_number, amount, status")
      .maybeSingle();

    if (!insertErr && createdOrder?.id) {
      setCachedOrderForLetter(params.letter.id, {
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        experienceId: expId || undefined,
        status: "pending",
        amount: Number(createdOrder.amount),
        includePhysical: Boolean(params.includePhysical),
      });
      return {
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        status: "pending",
        amount: Number(createdOrder.amount),
        isAlreadyPaid: false,
      };
    }
  } catch (err) {
    console.warn("[asaasPayment] Aviso ao buscar/criar pedido no Supabase:", err);
  }

  return {
    orderId: null,
    orderNumber: null,
    status: "pending",
    amount: calculatedAmount,
    isAlreadyPaid: false,
  };
}

/**
 * Invoca a Supabase Edge Function 'asaas-create-payment' de forma 100% segura.
 * A API Key do Asaas nunca passa pelo navegador e fica restrita aos Secrets da Edge Function.
 * Não permite marcar o pedido como pago pelo frontend.
 */
export async function createAsaasPaymentViaEdgeFunction(params: {
  letterId: string;
  childName: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  includePhysical?: boolean;
  address?: ShippingAddress;
  orderId?: string | null;
  experienceUuid?: string | null;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
  };
}): Promise<AsaasPaymentResult> {
  // Se Supabase estiver configurado no frontend, chamar a Edge Function oficial
  if (isSupabaseConfigured) {
    try {
      const { token, userId } = await getOrEnsureAuthToken();

      if (!token || !userId) {
        return {
          success: false,
          error: "Usuário não autenticado no sistema. Não foi possível iniciar o checkout.",
          errorType: "unauthenticated",
        };
      }

      const { data, error } = await supabase.functions.invoke("asaas-create-payment", {
        body: {
          orderId: params.orderId || undefined,
          experienceId: params.experienceUuid || params.letterId,
          billingType: params.billingType,
          includePhysical: params.includePhysical,
          address: params.address,
          customerInfo: params.customerInfo,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
        console.warn("[asaasPayment] Erro na Edge Function:", error.message);
        let errorType: PaymentErrorType = "charge_not_created";
        if (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized")) {
          errorType = "unauthenticated";
        } else if (error.message.includes("403") || error.message.toLowerCase().includes("forbidden")) {
          errorType = "forbidden_access";
        } else if (error.message.includes("404") || error.message.toLowerCase().includes("não encontrado")) {
          errorType = "order_not_found";
        } else if (error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("fetch")) {
          errorType = "communication_error";
        }

        return {
          success: false,
          error: error.message || "Falha na comunicação com o gateway seguro.",
          errorType,
        };
      }

      if (data?.error) {
        let errorType: PaymentErrorType = "charge_not_created";
        const errLower = String(data.error).toLowerCase();
        if (errLower.includes("autoriz") || errLower.includes("login") || errLower.includes("sessão")) {
          errorType = "unauthenticated";
        } else if (errLower.includes("outro usuário") || errLower.includes("não pertence")) {
          errorType = "forbidden_access";
        } else if (errLower.includes("não encontrado")) {
          errorType = "order_not_found";
        } else if (errLower.includes("expirad")) {
          errorType = "expired";
        } else if (errLower.includes("recusad")) {
          errorType = "refused";
        }

        return {
          success: false,
          error: data.error,
          errorType,
        };
      }

      if (data?.success && data.payment) {
        // Atualizar cache de persistência para recuperação posterior
        setCachedOrderForLetter(params.letterId, {
          orderId: data.payment.orderId,
          orderNumber: data.payment.orderNumber,
          experienceId: params.experienceUuid || undefined,
          amount: data.payment.amount,
          billingType: data.payment.billingType,
          includePhysical: Boolean(params.includePhysical),
          payment: data.payment,
          status: data.alreadyPaid ? "paid" : "pending",
        });

        return {
          success: true,
          payment: data.payment,
          reused: Boolean(data.reused),
          alreadyPaid: Boolean(data.alreadyPaid),
          message: data.message,
        };
      }
    } catch (err: any) {
      console.warn("[asaasPayment] Exceção ao chamar Edge Function:", err?.message || err);
      return {
        success: false,
        error: "Falha temporária de conexão com o servidor de pagamentos.",
        errorType: "communication_error",
      };
    }
  }

  // Fallback seguro em ambiente de demonstração/local sem Edge Functions ativas
  const simulatedAmount = params.includePhysical ? 69.89 : 39.99;
  const mockOrderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const mockOrderId = params.orderId || `ord_${params.letterId.slice(0, 10)}`;

  const fallbackPayment: AsaasPaymentData = {
    id: `pay_sim_${Date.now()}`,
    orderId: mockOrderId,
    orderNumber: mockOrderNumber,
    amount: simulatedAmount,
    status: "pending",
    billingType: params.billingType,
    invoiceUrl: "https://www.asaas.com/c/vrbnn78e3935jocc",
    pixQrCode: null,
    pixCopyPaste: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540539.995802BR5913Carta Magica6009Sao Paulo62070503***6304ABCD",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
  };

  setCachedOrderForLetter(params.letterId, {
    orderId: mockOrderId,
    orderNumber: mockOrderNumber,
    amount: simulatedAmount,
    billingType: params.billingType,
    includePhysical: Boolean(params.includePhysical),
    payment: fallbackPayment,
    status: "pending",
  });

  return {
    success: true,
    payment: fallbackPayment,
    message: "Modo de demonstração local ativo.",
  };
}

/**
 * Consulta o status atualizado do pedido no Supabase.
 * Nunca altera o status financeiro no banco — estritamente somente-leitura.
 * Trata erros de autenticação, pedido inexistente e permissões RLS.
 */
export async function checkOrderStatusInSupabase(
  orderIdOrNumber: string
): Promise<{
  isPaid: boolean;
  status: "pending" | "paid" | "failed" | "refunded";
  order?: any;
  error?: string;
  errorType?: PaymentErrorType;
}> {
  if (!orderIdOrNumber) {
    return { isPaid: false, status: "pending", errorType: "order_not_found" };
  }

  if (!isSupabaseConfigured) {
    return { isPaid: false, status: "pending" };
  }

  try {
    const { token, userId } = await getOrEnsureAuthToken();
    if (!token || !userId) {
      return {
        isPaid: false,
        status: "pending",
        error: "Usuário não autenticado.",
        errorType: "unauthenticated",
      };
    }

    let query = supabase
      .from("orders")
      .select("id, order_number, user_id, amount, status, paid_at, experience_id")
      .eq("user_id", userId);

    if (isUUID(orderIdOrNumber)) {
      query = query.eq("id", orderIdOrNumber);
    } else {
      query = query.eq("order_number", orderIdOrNumber);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      if (error.code === "PGRST116" || error.message.includes("not found")) {
        return { isPaid: false, status: "pending", error: "Pedido inexistente.", errorType: "order_not_found" };
      }
      if (error.code === "42501" || error.message.includes("policy")) {
        return { isPaid: false, status: "pending", error: "Acesso não autorizado ao pedido.", errorType: "forbidden_access" };
      }
      return { isPaid: false, status: "pending", error: error.message, errorType: "communication_error" };
    }

    if (!order) {
      return { isPaid: false, status: "pending", error: "Pedido não localizado.", errorType: "order_not_found" };
    }

    const status = order.status as "pending" | "paid" | "failed" | "refunded";
    const isPaid = status === "paid";

    return {
      isPaid,
      status,
      order,
    };
  } catch (err: any) {
    console.warn("[asaasPayment] Erro ao consultar pedido no Supabase:", err);
    return { isPaid: false, status: "pending", error: err?.message, errorType: "communication_error" };
  }
}

/**
 * Cria uma rotina controlada de escuta no Supabase para detectar quando o webhook Asaas
 * atualizar o pedido para 'paid' ou 'failed'.
 *
 * Características essenciais:
 * 1. Usa Realtime Channel (postgres_changes) caso disponível.
 * 2. Polling seguro e controlado a cada 4 segundos com limite máximo de 45 tentativas (3 minutos).
 * 3. Evita sobrecarga de requisições no Supabase e finaliza automaticamente após confirmação.
 */
export function monitorOrderPayment(
  orderIdOrNumber: string,
  callbacks: {
    onStatusChange?: (status: "pending" | "paid" | "failed" | "refunded") => void;
    onPaid: () => void;
    onFailed?: (reason?: string) => void;
  }
): () => void {
  let isCancelled = false;
  let pollAttempts = 0;
  const MAX_POLL_ATTEMPTS = 45; // 45 * 4s = 3 minutos de monitoramento ativo

  // 1. Polling controlado com intervalo de 4 segundos
  const intervalId = setInterval(async () => {
    if (isCancelled) return;
    pollAttempts++;

    if (pollAttempts > MAX_POLL_ATTEMPTS) {
      clearInterval(intervalId);
      return;
    }

    const result = await checkOrderStatusInSupabase(orderIdOrNumber);
    if (isCancelled) return;

    if (result.status && callbacks.onStatusChange) {
      callbacks.onStatusChange(result.status);
    }

    if (result.isPaid) {
      isCancelled = true;
      clearInterval(intervalId);
      callbacks.onPaid();
      return;
    }

    if (result.status === "failed") {
      isCancelled = true;
      clearInterval(intervalId);
      if (callbacks.onFailed) {
        callbacks.onFailed("Cobrança recusada ou cancelada no gateway.");
      }
    }
  }, 4000);

  // 2. Realtime Channel do Supabase caso suportado
  let channel: any = null;
  if (isSupabaseConfigured && orderIdOrNumber) {
    try {
      const channelName = `order-mon-${orderIdOrNumber.slice(0, 16)}-${Date.now()}`;
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
          },
          (payload: any) => {
            if (isCancelled) return;
            const newRow = payload.new;
            const matchesId =
              newRow?.id === orderIdOrNumber ||
              newRow?.order_number === orderIdOrNumber;

            if (matchesId) {
              const newStatus = newRow?.status as "pending" | "paid" | "failed" | "refunded";
              if (callbacks.onStatusChange) {
                callbacks.onStatusChange(newStatus);
              }

              if (newStatus === "paid") {
                isCancelled = true;
                clearInterval(intervalId);
                callbacks.onPaid();
              } else if (newStatus === "failed" && callbacks.onFailed) {
                isCancelled = true;
                clearInterval(intervalId);
                callbacks.onFailed("Pagamento recusado.");
              }
            }
          }
        )
        .subscribe();
    } catch {
      // Fallback seguro permanece ativo no polling
    }
  }

  // Função de cancelamento e limpeza
  return () => {
    isCancelled = true;
    clearInterval(intervalId);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {
        // Ignorar erro de fechamento
      }
    }
  };
}
