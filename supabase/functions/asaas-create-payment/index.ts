import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

// Preço oficial e imutável pelo sistema (nunca confiamos em valores enviados pelo frontend)
const BASE_LETTER_PRICE = 39.99;
const PHYSICAL_SHIPPING_PRICE = 29.90;

interface CreatePaymentRequest {
  orderId?: string;
  experienceId?: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  includePhysical?: boolean;
  address?: {
    recipientName: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
  };
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasApiKey) {
      console.error("[asaas-create-payment] ERRO: Secret ASAAS_API_KEY não configurada na Supabase Edge Function.");
      return new Response(
        JSON.stringify({ error: "Configuração de pagamento incompleta no servidor. Contate o suporte." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const asaasEnv = Deno.env.get("ASAAS_ENVIRONMENT") || "production";
    const asaasBaseUrl = asaasEnv.toLowerCase() === "sandbox"
      ? "https://sandbox.asaas.com/v3"
      : "https://api.asaas.com/v3";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[asaas-create-payment] ERRO: Variáveis de ambiente Supabase ausentes.");
      return new Response(
        JSON.stringify({ error: "Serviço indisponível no momento." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Validar autenticação do usuário via JWT do Supabase
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado: token de autenticação ausente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/Bearer /i, "").trim();

    // Cliente Supabase autenticado no contexto do usuário
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida ou expirada. Faça login para continuar." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = userData.user.id;
    const authenticatedUserEmail = userData.user.email || "";

    // Cliente com permissões de serviço para operações seguras no banco
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 2. Parse e sanitização do payload enviado pelo frontend
    const body: CreatePaymentRequest = await req.json();
    const billingType = body.billingType;
    if (!["PIX", "CREDIT_CARD", "BOLETO"].includes(billingType)) {
      return new Response(
        JSON.stringify({ error: "Modalidade de pagamento inválida. Utilize PIX, CREDIT_CARD ou BOLETO." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Buscar ou inicializar o perfil do usuário (profiles)
    let { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, asaas_customer_id")
      .eq("id", authenticatedUserId)
      .maybeSingle();

    if (!profile) {
      // Criar perfil inicial para o usuário autenticado caso ainda não exista
      const initialFullName =
        body.customerInfo?.name ||
        userData.user.user_metadata?.full_name ||
        authenticatedUserEmail.split("@")[0] ||
        "Cliente Carta Mágica";

      const { data: newProfile, error: insertProfErr } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: authenticatedUserId,
          email: authenticatedUserEmail,
          full_name: initialFullName,
          phone: body.customerInfo?.phone || null,
          role: "customer",
        })
        .select()
        .single();

      if (insertProfErr) {
        console.error("[asaas-create-payment] Falha ao criar perfil:", insertProfErr.message);
      } else {
        profile = newProfile;
      }
    }

    // 4. Determinar e validar pedido (orders) pertencente ao authenticatedUserId
    // Nunca confiamos no valor enviado pelo frontend!
    const includePhysical = Boolean(body.includePhysical);
    const calculatedAmount = includePhysical
      ? Number((BASE_LETTER_PRICE + PHYSICAL_SHIPPING_PRICE).toFixed(2))
      : Number(BASE_LETTER_PRICE.toFixed(2));

    const isValidUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str));

    let order: any = null;

    if (body.orderId) {
      // Validar que o pedido informado existe e pertence estritamente ao usuário autenticado
      let orderQuery = supabaseAdmin
        .from("orders")
        .select("id, order_number, user_id, amount, status, include_physical, experience_id")
        .eq("user_id", authenticatedUserId);

      if (isValidUUID(body.orderId)) {
        orderQuery = orderQuery.eq("id", body.orderId);
      } else {
        orderQuery = orderQuery.eq("order_number", body.orderId);
      }

      const { data: existingOrder, error: orderErr } = await orderQuery.maybeSingle();

      if (orderErr || !existingOrder) {
        return new Response(
          JSON.stringify({ error: "Pedido não encontrado ou não pertence ao usuário autenticado." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (existingOrder.status === "paid") {
        return new Response(
          JSON.stringify({
            success: true,
            alreadyPaid: true,
            message: "Este pedido já foi pago e liberado com sucesso.",
            order: existingOrder,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      order = existingOrder;
    } else {
      // Resolver ID da experiência de forma segura contra formatos não-UUID
      let resolvedExperienceId: string | null = null;
      if (isValidUUID(body.experienceId)) {
        resolvedExperienceId = body.experienceId!;
      } else if (body.experienceId) {
        const { data: expMatch } = await supabaseAdmin
          .from("experiences")
          .select("id")
          .eq("token", body.experienceId)
          .maybeSingle();
        if (expMatch?.id) {
          resolvedExperienceId = expMatch.id;
        }
      }

      // Verificar se já existe um pedido pendente para a mesma experiência e usuário
      if (resolvedExperienceId) {
        const { data: pendingOrder } = await supabaseAdmin
          .from("orders")
          .select("id, order_number, user_id, amount, status, include_physical, experience_id")
          .eq("user_id", authenticatedUserId)
          .eq("experience_id", resolvedExperienceId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pendingOrder) {
          order = pendingOrder;
        }
      }

      // Se ainda não existir pedido, criar no banco com o valor oficial do sistema
      if (!order) {
        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: createdOrder, error: createOrderErr } = await supabaseAdmin
          .from("orders")
          .insert({
            order_number: orderNumber,
            experience_id: resolvedExperienceId,
            user_id: authenticatedUserId,
            amount: calculatedAmount,
            status: "pending",
            payment_method: `Asaas (${billingType})`,
            include_physical: includePhysical,
          })
          .select()
          .single();

        if (createOrderErr || !createdOrder) {
          console.error("[asaas-create-payment] Falha ao criar pedido:", createOrderErr?.message);
          return new Response(
            JSON.stringify({ error: "Não foi possível registrar o pedido no sistema." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        order = createdOrder;
      }
    }

    // Se houver endereço para envio físico, salvar em shipping_addresses
    if (includePhysical && body.address && order?.id) {
      await supabaseAdmin.from("shipping_addresses").upsert({
        order_id: order.id,
        recipient_name: body.address.recipientName,
        street: body.address.street,
        number: body.address.number,
        complement: body.address.complement || "",
        city: body.address.city,
        state: body.address.state,
        zip_code: body.address.zipCode,
        country: body.address.country || "Brasil",
      });
    }

    // 5. Prevenção de duplicidade: Verificar se já existe uma cobrança pendente válida para o mesmo pedido
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .eq("status", "pending")
      .eq("billing_type", billingType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPayment && existingPayment.asaas_payment_id) {
      // Para PIX, se já tivermos o QR Code e código copia-e-cola válidos, reaproveitar
      if (billingType === "PIX" && existingPayment.pix_qr_code && existingPayment.pix_copy_paste) {
        return new Response(
          JSON.stringify({
            success: true,
            reused: true,
            payment: {
              id: existingPayment.id,
              orderId: order.id,
              orderNumber: order.order_number,
              amount: existingPayment.amount,
              status: existingPayment.status,
              billingType: existingPayment.billing_type,
              invoiceUrl: existingPayment.invoice_url,
              pixQrCode: existingPayment.pix_qr_code,
              pixCopyPaste: existingPayment.pix_copy_paste,
              dueDate: existingPayment.due_date,
            },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Se for Cartão/Boleto e já tiver invoice_url, reaproveitar também
      if (billingType !== "PIX" && existingPayment.invoice_url) {
        return new Response(
          JSON.stringify({
            success: true,
            reused: true,
            payment: {
              id: existingPayment.id,
              orderId: order.id,
              orderNumber: order.order_number,
              amount: existingPayment.amount,
              status: existingPayment.status,
              billingType: existingPayment.billing_type,
              invoiceUrl: existingPayment.invoice_url,
              bankSlipUrl: existingPayment.bank_slip_url,
              dueDate: existingPayment.due_date,
            },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 6. Gerenciar cliente no Asaas (profiles.asaas_customer_id)
    let asaasCustomerId = profile?.asaas_customer_id;

    if (!asaasCustomerId) {
      const customerName =
        profile?.full_name ||
        body.customerInfo?.name ||
        userData.user.user_metadata?.full_name ||
        "Cliente Carta Mágica";

      const customerEmail = profile?.email || body.customerInfo?.email || authenticatedUserEmail;
      const customerPhone = profile?.phone || body.customerInfo?.phone || undefined;
      const customerCpfCnpj = body.customerInfo?.cpfCnpj?.replace(/\D/g, "") || undefined;

      // Chamar API Asaas para criar novo cliente
      const asaasCustomerRes = await fetch(`${asaasBaseUrl}/customers`, {
        method: "POST",
        headers: {
          access_token: asaasApiKey,
          "Content-Type": "application/json",
          "User-Agent": "CartaMagica-PaymentEngine/1.0",
        },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          cpfCnpj: customerCpfCnpj,
          notificationDisabled: false,
        }),
      });

      const customerJson = await asaasCustomerRes.json();
      if (!asaasCustomerRes.ok || !customerJson?.id) {
        console.error(
          "[asaas-create-payment] Falha ao criar cliente no Asaas:",
          customerJson?.errors?.[0]?.description || customerJson?.message || "Erro desconhecido"
        );
        return new Response(
          JSON.stringify({
            error:
              customerJson?.errors?.[0]?.description ||
              "Não foi possível cadastrar o pagador junto ao Asaas. Verifique os dados informados.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      asaasCustomerId = customerJson.id;

      // Salvar asaas_customer_id no perfil para futuras cobranças
      await supabaseAdmin
        .from("profiles")
        .update({
          asaas_customer_id: asaasCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authenticatedUserId);
    }

    // 7. Criar cobrança no Asaas com valor oficial e externalReference
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const asaasPaymentPayload: Record<string, any> = {
      customer: asaasCustomerId,
      billingType: billingType,
      value: calculatedAmount,
      dueDate: dueDateStr,
      description: `Carta Mágica do Papai Noel - Pedido #${order.order_number || order.id}`,
      externalReference: order.id,
      postalService: false,
    };

    // Suporte a Cartão de Crédito transparente caso os dados do cartão tenham sido fornecidos
    if (billingType === "CREDIT_CARD" && body.creditCard && body.creditCardHolderInfo) {
      asaasPaymentPayload.creditCard = {
        holderName: body.creditCard.holderName,
        number: body.creditCard.number.replace(/\D/g, ""),
        expiryMonth: body.creditCard.expiryMonth,
        expiryYear: body.creditCard.expiryYear,
        ccv: body.creditCard.ccv,
      };
      asaasPaymentPayload.creditCardHolderInfo = {
        name: body.creditCardHolderInfo.name,
        email: body.creditCardHolderInfo.email,
        cpfCnpj: body.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ""),
        postalCode: body.creditCardHolderInfo.postalCode.replace(/\D/g, ""),
        addressNumber: body.creditCardHolderInfo.addressNumber,
        phone: body.creditCardHolderInfo.phone.replace(/\D/g, ""),
      };
    }

    const asaasChargeRes = await fetch(`${asaasBaseUrl}/payments`, {
      method: "POST",
      headers: {
        access_token: asaasApiKey,
        "Content-Type": "application/json",
        "User-Agent": "CartaMagica-PaymentEngine/1.0",
      },
      body: JSON.stringify(asaasPaymentPayload),
    });

    const chargeJson = await asaasChargeRes.json();
    if (!asaasChargeRes.ok || !chargeJson?.id) {
      console.error(
        "[asaas-create-payment] Falha ao criar cobrança Asaas:",
        chargeJson?.errors?.[0]?.description || chargeJson?.message || "Erro desconhecido"
      );
      return new Response(
        JSON.stringify({
          error:
            chargeJson?.errors?.[0]?.description ||
            "Erro ao gerar a cobrança no gateway de pagamento. Tente novamente.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const asaasPaymentId = chargeJson.id;
    let pixQrCode: string | null = null;
    let pixCopyPaste: string | null = null;

    // 8. Para PIX: Buscar QR Code e Pix Copia e Cola na API oficial do Asaas
    if (billingType === "PIX") {
      try {
        const pixRes = await fetch(`${asaasBaseUrl}/payments/${asaasPaymentId}/pixQrCode`, {
          method: "GET",
          headers: {
            access_token: asaasApiKey,
            "Content-Type": "application/json",
            "User-Agent": "CartaMagica-PaymentEngine/1.0",
          },
        });

        if (pixRes.ok) {
          const pixJson = await pixRes.json();
          if (pixJson?.encodedImage) {
            pixQrCode = `data:image/png;base64,${pixJson.encodedImage}`;
          }
          if (pixJson?.payload) {
            pixCopyPaste = pixJson.payload;
          }
        }
      } catch (pixErr) {
        console.error("[asaas-create-payment] Falha ao obter dados Pix QR Code:", pixErr);
      }
    }

    // 9. Salvar retorno completo na tabela payments
    const { data: newPayment, error: insertPayErr } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        user_id: authenticatedUserId,
        amount: calculatedAmount,
        status: "pending",
        billing_type: billingType,
        asaas_customer_id: asaasCustomerId,
        asaas_payment_id: asaasPaymentId,
        invoice_url: chargeJson.invoiceUrl || null,
        bank_slip_url: chargeJson.bankSlipUrl || null,
        pix_qr_code: pixQrCode,
        pix_copy_paste: pixCopyPaste,
        due_date: chargeJson.dueDate || dueDateStr,
        metadata: {
          externalReference: order.id,
          orderNumber: order.order_number,
          netValue: chargeJson.netValue || null,
          billingType: billingType,
        },
      })
      .select()
      .single();

    if (insertPayErr) {
      console.error("[asaas-create-payment] Falha ao persistir em payments:", insertPayErr.message);
    }

    // 10. Retornar resposta estritamente sanitizada ao frontend (sem expor segredos)
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: newPayment?.id || null,
          orderId: order.id,
          orderNumber: order.order_number,
          amount: calculatedAmount,
          status: "pending",
          billingType: billingType,
          invoiceUrl: chargeJson.invoiceUrl || null,
          bankSlipUrl: chargeJson.bankSlipUrl || null,
          pixQrCode: pixQrCode,
          pixCopyPaste: pixCopyPaste,
          dueDate: chargeJson.dueDate || dueDateStr,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Tratamento de erro seguro: nunca expor API Key ou stack traces internos
    console.error("[asaas-create-payment] Erro interno inesperado:", err?.message || err);
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro interno ao processar o pagamento. Tente novamente mais tarde." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
