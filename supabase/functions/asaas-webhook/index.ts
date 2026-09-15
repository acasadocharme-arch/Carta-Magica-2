import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Apenas aceitar requisições POST do Asaas
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const expectedWebhookToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[asaas-webhook] ERRO: Variáveis de ambiente do Supabase ausentes.");
    return new Response(JSON.stringify({ error: "Serviço indisponível" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 1. Validação OBRIGATÓRIA do header de autenticação do webhook do Asaas
  // NUNCA utilizamos a API Key do Asaas como token de webhook!
  if (!expectedWebhookToken) {
    console.error("[asaas-webhook] ERRO CRÍTICO: Secret ASAAS_WEBHOOK_TOKEN não configurada na Edge Function.");
    return new Response(JSON.stringify({ error: "Webhook token não configurado no servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const incomingToken =
    req.headers.get("asaas-access-token") ||
    req.headers.get("x-asaas-access-token") ||
    req.headers.get("authorization")?.replace(/Bearer /i, "").trim() ||
    "";

  if (!incomingToken || incomingToken !== expectedWebhookToken) {
    // Log seguro sem expor tokens
    console.warn("[asaas-webhook] Tentativa não autorizada rejeitada: token de webhook inválido ou ausente.");
    return new Response(JSON.stringify({ error: "Não autorizado: token do webhook inválido" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. Parse seguro do corpo da notificação enviada pelo Asaas
  let payload: any;
  try {
    payload = await req.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Payload JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eventType: string = payload?.event || "UNKNOWN";
  const asaasPayment = payload?.payment || {};
  const asaasPaymentId: string = asaasPayment?.id || "";

  // Identificador único para idempotência (usa id do evento do Asaas ou chave composta única)
  const eventId: string =
    payload?.id ||
    `${eventType}_${asaasPaymentId}_${asaasPayment?.clientPaymentDate || asaasPayment?.paymentDate || asaasPayment?.dateCreated || Date.now()}`;

  // Log seguro do evento recebido (nunca expor dados sensíveis do pagador)
  console.log(`[asaas-webhook] Evento recebido: ${eventType} | Pagamento: ${asaasPaymentId || "N/A"}`);

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // 3. Idempotência: verificar se este event_id já foi registrado e processado
  const { data: existingEvent } = await supabaseAdmin
    .from("webhook_events")
    .select("event_id, status")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingEvent && existingEvent.status === "processed") {
    console.log(`[asaas-webhook] Evento ${eventId} já foi processado anteriormente. Ignorando de forma idempotente.`);
    return new Response(
      JSON.stringify({ success: true, message: "Evento já processado anteriormente", eventId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Registrar ou atualizar registro em webhook_events como pendente
  await supabaseAdmin.from("webhook_events").upsert(
    {
      event_id: eventId,
      event_type: eventType,
      payment_id: asaasPaymentId || null,
      payload: payload,
      status: "pending",
    },
    { onConflict: "event_id" }
  );

  try {
    // 4. Mapeamento oficial dos eventos do Asaas para o sistema Carta Mágica:
    // PAYMENT_CREATED  -> orders.status = 'pending'
    // PAYMENT_CONFIRMED -> orders.status = 'pending' (Atenção: NUNCA considerar apenas CONFIRMED como recebido!)
    // PAYMENT_RECEIVED  -> orders.status = 'paid', preencher paid_at; payments.status = 'received', preencher paid_at
    // PAYMENT_OVERDUE   -> orders.status = 'failed', payments.status = 'overdue'
    // PAYMENT_DELETED   -> orders.status = 'failed', payments.status = 'deleted'
    // PAYMENT_REFUNDED  -> orders.status = 'refunded', payments.status = 'refunded'

    let targetOrderStatus: "pending" | "paid" | "failed" | "refunded" | null = null;
    let targetPaymentStatus: string | null = null;
    let isReceived = false;

    switch (eventType) {
      case "PAYMENT_CREATED":
        targetOrderStatus = "pending";
        targetPaymentStatus = "pending";
        break;

      case "PAYMENT_CONFIRMED":
        // Regra de ouro mandatada: nunca considerar apenas PAYMENT_CONFIRMED como pagamento final recebido
        targetOrderStatus = "pending";
        targetPaymentStatus = "confirmed";
        break;

      case "PAYMENT_RECEIVED":
        targetOrderStatus = "paid";
        targetPaymentStatus = "received";
        isReceived = true;
        break;

      case "PAYMENT_OVERDUE":
        targetOrderStatus = "failed";
        targetPaymentStatus = "overdue";
        break;

      case "PAYMENT_DELETED":
        targetOrderStatus = "failed";
        targetPaymentStatus = "deleted";
        break;

      case "PAYMENT_REFUNDED":
        targetOrderStatus = "refunded";
        targetPaymentStatus = "refunded";
        break;

      default:
        console.log(`[asaas-webhook] Evento informativo ignorado para transição de status: ${eventType}`);
        break;
    }

    if (targetOrderStatus && asaasPaymentId) {
      const nowIso = new Date().toISOString();
      const paidAtIso =
        asaasPayment?.clientPaymentDate ||
        asaasPayment?.paymentDate ||
        asaasPayment?.confirmedDate ||
        nowIso;

      // 5. Localizar o registro em payments pelo asaas_payment_id
      let { data: paymentRecord } = await supabaseAdmin
        .from("payments")
        .select("id, order_id, user_id, amount, status")
        .eq("asaas_payment_id", asaasPaymentId)
        .maybeSingle();

      let targetOrderId = paymentRecord?.order_id;

      // Caso o registro em payments não seja localizado pelo asaas_payment_id,
      // tentar associar pelo externalReference (que contém o order_id ou order_number)
      if (!targetOrderId && asaasPayment?.externalReference) {
        const { data: orderById } = await supabaseAdmin
          .from("orders")
          .select("id, user_id, experience_id")
          .or(`id.eq.${asaasPayment.externalReference},order_number.eq.${asaasPayment.externalReference}`)
          .maybeSingle();

        if (orderById) {
          targetOrderId = orderById.id;
        }
      }

      // 6. Atualizar tabela payments
      if (paymentRecord) {
        const updatePaymentData: Record<string, any> = {
          status: targetPaymentStatus,
          updated_at: nowIso,
        };

        if (isReceived) {
          updatePaymentData.paid_at = paidAtIso;
        }

        await supabaseAdmin
          .from("payments")
          .update(updatePaymentData)
          .eq("id", paymentRecord.id);
      }

      // 7. Atualizar tabela orders e liberar a experiência PRO
      if (targetOrderId) {
        const updateOrderData: Record<string, any> = {
          status: targetOrderStatus,
        };

        if (isReceived) {
          updateOrderData.paid_at = paidAtIso;
        }

        const { data: updatedOrder, error: orderUpdErr } = await supabaseAdmin
          .from("orders")
          .update(updateOrderData)
          .eq("id", targetOrderId)
          .select("id, experience_id, status")
          .maybeSingle();

        if (orderUpdErr) {
          console.error(`[asaas-webhook] Erro ao atualizar status do pedido ${targetOrderId}:`, orderUpdErr.message);
        }

        // 8. Se o pagamento foi recebido com sucesso, liberar automaticamente a experiência PRO na tabela experiences
        if (isReceived && updatedOrder?.experience_id) {
          const { error: expUpdErr } = await supabaseAdmin
            .from("experiences")
            .update({
              plan: "pro",
            })
            .eq("id", updatedOrder.experience_id);

          if (expUpdErr) {
            console.error(`[asaas-webhook] Erro ao liberar plano PRO na experiência ${updatedOrder.experience_id}:`, expUpdErr.message);
          } else {
            console.log(`[asaas-webhook] SUCESSO: Experiência Mágica PRO liberada para o pedido ${targetOrderId}`);
          }
        }
      } else {
        console.warn(`[asaas-webhook] Nenhum pedido relacionado encontrado para o pagamento Asaas: ${asaasPaymentId}`);
      }
    }

    // 9. Atualizar webhook_events como processado com sucesso
    await supabaseAdmin
      .from("webhook_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);

    return new Response(
      JSON.stringify({ success: true, eventId, eventType, status: "processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Registrar falha em webhook_events preservando o payload original intacto
    const errorMessage = err?.message || String(err);
    console.error("[asaas-webhook] Erro durante o processamento do webhook:", errorMessage);

    await supabaseAdmin
      .from("webhook_events")
      .update({
        status: "failed",
        error_message: errorMessage,
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);

    return new Response(
      JSON.stringify({ error: "Erro ao processar evento do webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
