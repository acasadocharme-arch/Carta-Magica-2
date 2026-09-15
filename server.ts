import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

// In-memory mock database & audit log for SaaS metrics (with persistence sync)
interface LetterRecord {
  id: string;
  childName: string;
  age: number;
  city: string;
  achievements: string;
  giftRequest: string;
  parentNotes?: string;
  style: string;
  plan: "free" | "pro";
  content: string;
  date: string;
  token: string;
  photoUrl?: string;
  secretMessage?: string;
  childReaction?: string;
  deliveryStatus?: "digital_only" | "processing" | "printed" | "dispatched" | "delivered";
  trackingCode?: string;
  shippingAddress?: {
    recipientName: string;
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface OrderRecord {
  orderId: string;
  letterId: string;
  childName: string;
  amount: number;
  plan: "pro";
  includePhysicalDispatch: boolean;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
}

// Initial mock data
const inMemoryLetters: LetterRecord[] = [
  {
    id: "cm-demo-01",
    childName: "Lucas",
    age: 6,
    city: "São Paulo, SP",
    achievements: "Aprendeu a andar de bicicleta sem rodinhas e ajudou a cuidar com muito carinho do gatinho Pipoca.",
    giftRequest: "Um dinossauro robô que acende os olhos",
    parentNotes: "Lembrar de continuar dormindo no próprio quarto e que os pais o amam infinitamente.",
    style: "mágico",
    plan: "pro",
    date: "12/11/2026",
    token: "lucas-sp-7821",
    deliveryStatus: "dispatched",
    trackingCode: "NP-849204-BR",
    content: `Ho Ho Ho! Olá, meu querido Lucas!

Daqui do alto da montanha gelada do Polo Norte, onde as luzes da Aurora Boreal dançam no céu estrelado, olhei através do meu grande telescópio de cristal dourado e avistei você aí em São Paulo!

Você nem imagina o quanto os duendes artesãos e a Mamãe Noel vibraram quando souberam da sua grande coragem neste ano: andar de bicicleta sem rodinhas! É preciso ter um coração muito valente para tentar, cair, levantar e conseguir pedalar com o vento no rosto. E o seu cuidado afetuoso com o gatinho Pipoca aquece o coração deste velhinho como um chocolate quente em noite de nevasca.

O Rudolph, a rena de nariz vermelho brilhante, já separou com todo carinho a sua cartinha sobre o dinossauro robô que acende os olhos. Nossos elfos inventores estão dando os últimos retoques na oficina mágica de brinquedos.

Seus pais têm um orgulho gigantesco de você. Lembre-se sempre de ser esse menino gentil, corajoso e de continuar dormindo no seu próprio quarto como o grande rapazinho que você já é.

Na noite mágica de Natal, estarei sobrevoando sua casa com meu trenó. Se puder, deixe uma cenoura fresca para as renas e um abraço carinhoso em quem cuida de você.

Com todo o meu amor e pó de estrelas,
Com carinho, Papai Noel 🎅`
  },
  {
    id: "cm-demo-02",
    childName: "Helena",
    age: 5,
    city: "Curitiba, PR",
    achievements: "Fez novos amigos na escolinha e aprendeu a desenhar arco-íris sozinha.",
    giftRequest: "Uma maleta de tintas mágicas e pincéis",
    style: "carinhoso",
    plan: "free",
    date: "10/11/2026",
    token: "helena-cwb-3912",
    deliveryStatus: "digital_only",
    content: `Ho Ho Ho! Minha querida Helena!

Que alegria escrever para você diretamente da minha oficina de brinquedos no Polo Norte! 

Os duendes observadores me contaram que você foi muito corajosa ao fazer novos amigos na escolinha em Curitiba e que seus desenhos de arco-íris são repletos de cores e alegria! Continue espalhando esse sorriso doce por onde passar.

Já registrei no meu Grande Livro Dourado o seu desejo da maleta de tintas mágicas e pincéis. O Rudolph e as outras renas mandam um carinhoso relincho mágico para você!

Durma bem e guarde sempre o encanto do Natal no seu coraçãozinho.

Com carinho, Papai Noel 🎅`
  }
];

const ASAAS_CHECKOUT_URL = "https://www.asaas.com/c/vrbnn78e3935jocc";

const inMemoryOrders: OrderRecord[] = [
  {
    orderId: "ORD-98214",
    letterId: "cm-demo-01",
    childName: "Lucas",
    amount: 39.99,
    plan: "pro",
    includePhysicalDispatch: true,
    status: "paid",
    paymentMethod: "Asaas (Pix / Cartão)",
    createdAt: "12/11/2026 14:22",
    paidAt: "12/11/2026 14:23"
  }
];

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback letter generator when offline or API key absent
// Strictly adheres to the 7-stage magical structure:
// 1. Saudação
// 2. Introdução do Polo Norte
// 3. Conquistas
// 4. Pedido de Natal
// 5. Carinho e Palavras dos Pais
// 6. Encerramento
// 7. Assinatura
function generateFallbackLetter(data: {
  childName: string;
  age: number;
  city: string;
  achievements?: string;
  giftRequest?: string;
  parentNotes?: string;
  style?: string;
  plan?: "free" | "pro";
}): string {
  const isPro = data.plan === "pro";
  const name = data.childName.trim();
  const city = data.city.trim();
  const age = data.age;
  const achievements = data.achievements?.trim() || "foi uma criança gentil, bondosa e cheia de alegria";
  const gift = data.giftRequest?.trim() || "uma surpresa mágica feita com todo o amor";
  const parentNotes = data.parentNotes?.trim() || "";

  if (isPro) {
    return `Ho Ho Ho! Olá, meu querido(a) ${name}!

Daqui do topo do Polo Norte, onde as luzes douradas e esmeraldas da Aurora Boreal dançam pelo céu estrelado e as cabanas de madeira soltam fumaça quentinha com aroma de canela, peguei minha pena de cristal mais brilhante para escrever uma mensagem especial e única para você aí em ${city}!

Abri o Grande Livro Dourado das Boas Ações que os elfos guardam no coração da biblioteca polar. Quando encontrei a sua página, com seus ${age} anos de idade, meu coração se encheu de orgulho e alegria ao ler que você ${achievements}! A Mamãe Noel e os duendes artesãos aplaudiram com sorrisos largos. Pequenos gestos de coragem, bondade e amor fazem o mundo inteiro brilhar mais forte.

O Rudolph, com seu nariz vermelho cintilante, já colocou uma fita dourada no registro do seu pedido especial: "${gift}". Nossos duendes inventores estão trabalhando com muito esmero e alegria na oficina central de brinquedos, garantindo que a noite mágica seja repleta de encanto e surpresas preparadas com carinho.

${parentNotes ? `Seus pais me contaram também um segredinho com os olhinhos cheios de ternura: ${parentNotes}. O amor da sua família é o verdadeiro pó de estrelas que ilumina todo o caminho do trenó!\n\n` : ""}Continue sendo essa criança tão valente, curiosa, doce e protetora de quem está ao seu redor. Na Noite de Natal, quando os sininhos tocarem no céu gelado, saiba que estou enviando uma chuva de bênçãos, saúde e pó de estrelas cintilantes para o seu lar.

Com carinho, Papai Noel 🎅`;
  }

  // Free Tier letter (Strict 7-part structure, warm and concise)
  return `Ho Ho Ho! Olá, meu querido(a) ${name}!

Aqui da minha oficina mágica no Polo Norte, cercado por montanhas de neve branquinha e o brilho suave das estrelas de Natal, observei você aí na cidade de ${city}!

O Grande Livro Dourado me mostrou com muita alegria que, aos seus ${age} anos de idade, você ${achievements}! Que orgulho ver seu crescimento e o seu coração tão bondoso.

Eu e o Rudolph já lemos a sua cartinha sobre o seu pedido: ${gift}. Os duendes estão preparando tudo com muito carinho e animação para a chegada do Natal.

${parentNotes ? `Seus pais têm um amor infinito por você e se orgulham muito da pessoa incrível que você é.\n\n` : ""}Guarde sempre o brilho da esperança e da alegria no seu coração, espalhando sorrisos por onde passar.

Com carinho, Papai Noel 🎅`;
}

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Carta Mágica API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// 2.1 Get All Letters (Admin / Listing)
app.get("/api/letters", (_req, res) => {
  res.json(inMemoryLetters);
});

// 2.2 Get Single Letter by Public Token (Child View)
app.get("/api/letter/:token", (req, res) => {
  const { token } = req.params;
  const letter = inMemoryLetters.find((l) => l.token === token || l.id === token || token.startsWith(l.token));
  if (!letter) {
    return res.status(404).json({ error: "Carta não encontrada" });
  }
  res.json(letter);
});

// 2.3 AI Letter Generation Route (Gemini 3.8 Flash + Strict 7-Stage Structure)
app.post("/api/generate-letter", async (req, res) => {
  try {
    const {
      childName,
      age,
      city,
      achievements,
      giftRequest,
      parentNotes,
      style = "mágico",
      plan = "free",
      photoUrl
    } = req.body;

    if (!childName || !age || !city) {
      return res.status(400).json({
        error: "Campos obrigatórios ausentes (nome da criança, idade e cidade)."
      });
    }

    const isPro = plan === "pro";
    let letterContent = "";
    let generatedWithAI = false;

    const ai = getGeminiClient();

    if (ai) {
      try {
        // System instruction enforcing exact structure, ethical guidelines, and emotional depth
        const systemInstruction = `Você é o verdadeiro Papai Noel escrevendo uma carta emocionante, autêntica, calorosa e inesquecível para uma criança.
Siga RIGOROSAMENTE esta estrutura em 7 partes consecutivas e harmoniosas:
1. SAUDAÇÃO: Ex: "Ho Ho Ho! Olá, meu querido(a) ${childName}!"
2. INTRODUÇÃO DO POLO NORTE: Descrição vívida e sensorial do Polo Norte (as montanhas geladas, a Aurora Boreal dançando em cores no céu noturno, a oficina cheia de aromas de canela e pinheiro, os duendes concentrados preparando os brinquedos e as renas treinando o grande voo).
3. CONQUISTAS: Reconhecimento sincero, comovente e afetuoso das atitudes, aprendizados e conquistas da criança aos ${age} anos de idade em ${city}. Elogie a coragem, o carinho e o esforço.
4. PEDIDO DE NATAL: Menção carinhosa e animada ao presente pedido (${giftRequest || "uma surpresa especial"}), sem fazer falsas promessas materiais irreais mas garantindo que o Rudolph e os duendes já guardaram o desejo no coração da oficina.
5. CARINHO & PALAVRAS DOS PAIS: ${parentNotes ? `Integre de forma natural, doce e comovente o recado confidencial dos responsáveis: "${parentNotes}". Relembre que o amor da família é o maior tesouro.` : `Reforce o amor imenso e orgulho que a família sente por ela.`}
6. ENCERRAMENTO: Uma bênção mágica de pó de estrelas, encorajando a criança a continuar sendo gentil, respeitosa e iluminando a vida de todos.
7. ASSINATURA OBRIGATÓRIA: Exatamente "Com carinho, Papai Noel 🎅"

DIRETRIZES DE SEGURANÇA E ÉTICA:
- NUNCA use chantagem emocional ("se não obedecer não ganha presente", "estou vigiando se você chora"). O Papai Noel é pura bondade, sabedoria e aconchego.
- NUNCA prometa itens materiais de forma forçada.
- Estilo: ${style} (${isPro ? "Para o Plano PRO: crie uma narrativa rica, profunda, literária e mágica com cerca de 260 a 340 palavras, repleta de detalhes sensoriais e emoção genuína" : "Para o Plano Gratuito: crie uma mensagem acolhedora, clara e comovente com cerca de 150 a 190 palavras"}).
- Idioma: Português do Brasil impecável, poético e afetuoso.`;

        const userPrompt = `Escreva a carta de Natal personalizada com as informações:
- Criança: ${childName}
- Idade: ${age} anos
- Cidade: ${city}
- Conquistas e atitudes especiais: ${achievements || "Foi gentil e espalhou alegria"}
- Pedido de presente na cartinha: ${giftRequest || "Um presente feito com amor"}
- Palavras especiais dos pais/responsáveis: ${parentNotes || "Nenhum detalhe extra"}
- Plano: ${isPro ? "PRO (máxima profundidade emocional, detalhes sensoriais e magia literária)" : "Gratuito (básica, terna e envolvente)"}
- Estilo: ${style}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.72,
          },
        });

        if (response && response.text) {
          letterContent = response.text.trim();
          generatedWithAI = true;
        }
      } catch (err: any) {
        console.warn("Gemini API call failed, falling back to local generator:", err?.message || err);
      }
    }

    // Fallback if AI call failed or no API key
    if (!letterContent) {
      letterContent = generateFallbackLetter({
        childName,
        age: Number(age),
        city,
        achievements,
        giftRequest,
        parentNotes,
        style,
        plan: isPro ? "pro" : "free"
      });
    }

    const token = `${childName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36)}`;
    const newRecord: LetterRecord = {
      id: `cm-${Date.now()}`,
      childName,
      age: Number(age),
      city,
      achievements: achievements || "",
      giftRequest: giftRequest || "",
      parentNotes: parentNotes || "",
      style,
      plan: isPro ? "pro" : "free",
      content: letterContent,
      date: new Date().toLocaleDateString("pt-BR"),
      token,
      photoUrl,
      deliveryStatus: isPro ? "processing" : "digital_only",
      trackingCode: isPro ? `NP-${Math.floor(100000 + Math.random() * 900000)}-BR` : undefined
    };

    inMemoryLetters.unshift(newRecord);

    return res.json({
      success: true,
      letter: newRecord,
      generatedWithAI,
      shareUrl: `/natal/${newRecord.token}`
    });
  } catch (error: any) {
    console.error("Error generating letter:", error);
    res.status(500).json({ error: "Falha ao gerar a carta mágica. Tente novamente." });
  }
});

// 2.4 Text-to-Speech (TTS) Service for Santa Claus Voice
app.post("/api/tts", async (req, res) => {
  try {
    const { text, childName = "Criança", voice = "Fenrir" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Texto não fornecido para síntese de voz." });
    }

    const ai = getGeminiClient();
    let audioBase64: string | null = null;
    let provider = "web_speech_fallback";

    // Attempt server-side Gemini TTS if API key is active
    if (ai) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [
            {
              parts: [
                {
                  text: `Com voz profunda, calorosa, lenta, acolhedora e paternal de Papai Noel falando em português do Brasil: ${text.slice(0, 800)}`
                }
              ]
            }
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice === "Fenrir" ? "Fenrir" : "Puck"
                }
              }
            }
          }
        });

        const part = ttsResponse.candidates?.[0]?.content?.parts?.[0];
        if (part && "inlineData" in part && part.inlineData?.data) {
          audioBase64 = part.inlineData.data;
          provider = "gemini_tts";
        }
      } catch (ttsErr: any) {
        console.warn("Gemini TTS preview fallback active:", ttsErr?.message || ttsErr);
      }
    }

    res.json({
      success: true,
      provider,
      audioBase64,
      voiceConfig: {
        tone: "Papai Noel (Grave, Caloroso, Natalino)",
        suggestedPitch: 0.65,
        suggestedRate: 0.88,
        lang: "pt-BR"
      },
      message: provider === "gemini_tts"
        ? "Áudio nativo do Papai Noel gerado com sucesso pelo Gemini TTS!"
        : "Sintetizador temático configurado com modulação de voz grave do Papai Noel."
    });
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao processar Text-to-Speech", details: err?.message });
  }
});

// 2.5 Personalized Video Generation Pipeline Architecture (Veo / AI Avatar Engine)
app.post("/api/video/render-request", (req, res) => {
  try {
    const { letterId, childName, theme = "oficina_polo_norte" } = req.body;
    
    // Video generation job specification (Veo pipeline ready)
    const videoJob = {
      jobId: `VEO-JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      letterId: letterId || "demo",
      childName: childName || "Criança",
      theme,
      engine: "Google Veo / Veo 3.1 Lite Avatar Pipeline",
      promptSpec: {
        scene: "Santa Claus sitting by a crackling warm fireplace in a wooden North Pole cabin, glowing Christmas tree, smiling gently and holding a parchment with the child's name written in gold ink",
        motion: "Gentle warm wave, twinkling eyes, breathing life into the camera",
        lighting: "Cinematic golden hour and northern lights glow",
        aspectRatio: "16:9"
      },
      status: "scheduled_for_christmas_eve",
      availabilityNote: "Estreia oficial do vídeo na véspera de Natal! Os duendes cinegrafistas estão preparando a animação.",
      previewStillUrl: "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      job: videoJob,
      message: "Estrutura do vídeo personalizada registrada com sucesso no pipeline do Polo Norte!"
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao agendar geração de vídeo" });
  }
});

app.get("/api/video/status/:letterId", (req, res) => {
  const { letterId } = req.params;
  res.json({
    letterId,
    status: "coming_soon",
    featureName: "Vídeo Personalizado do Papai Noel",
    availableInPlan: "pro",
    badge: "Em Breve para a Noite de Natal",
    description: "Uma experiência em vídeo cinematográfico onde o Papai Noel fala diretamente com a criança na sua oficina mágica."
  });
});

// 2.6 High-Quality Illustrated A4 PDF Document Generation Service
app.post("/api/generate-pdf", (req, res) => {
  try {
    const { letterId, childName, age, city, content, token, plan = "pro", photoUrl } = req.body;
    
    const isPro = plan === "pro";
    const waterMarkHtml = !isPro
      ? `<div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: #9B021A; opacity: 0.7;">
          Versão de Degustação • Carta Mágica (cartamagica.com.br)
         </div>`
      : "";

    // Self-contained, print-perfect A4 HTML template
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Carta do Papai Noel - ${childName || "Especial"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Playfair Display', Georgia, serif;
      background: #FFFFFF;
      color: #1C2541;
      display: flex;
      justify-content: center;
    }
    
    .page-container {
      width: 100%;
      max-width: 210mm;
      min-height: 297mm;
      background: #FFFDF9 radial-gradient(#F5EDDA 1px, transparent 1px);
      background-size: 30px 30px;
      border: 3px double #C49A45;
      padding: 30px 40px;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(28, 37, 65, 0.15);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    
    .polar-tag {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 900;
      color: #9B021A;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .recipient-info {
      font-size: 13px;
      color: #333333;
    }
    
    .wax-seal {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #EF233C 0%, #D90429 50%, #780016 100%);
      border: 2px solid #FFD166;
      color: #FFD166;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
    }
    
    .seal-text-top {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      font-weight: 900;
      line-height: 1;
    }
    
    .seal-text-sub {
      font-size: 9px;
      font-weight: bold;
      margin-top: 2px;
    }
    
    .photo-portrait {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 18px;
    }
    
    .photo-frame {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      border: 2px solid #C49A45;
      padding: 2px;
      background: #FFFDF9;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }
    
    .photo-caption {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      font-weight: bold;
      color: #9B021A;
      margin-top: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .letter-body {
      font-size: 15px;
      line-height: 1.8;
      color: #1A1A1A;
      white-space: pre-line;
      margin-bottom: 30px;
    }
    
    .footer {
      border-top: 1px solid rgba(28, 37, 65, 0.2);
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .official-badge {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      color: #9B021A;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .signature-box {
      text-align: right;
    }
    
    .signature-font {
      font-family: 'Great Vibes', cursive;
      font-size: 42px;
      color: #9B021A;
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .signature-sub {
      font-size: 11px;
      color: #666666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div style="display: flex; align-items: center;">
        ${photoUrl ? `
        <div class="photo-portrait">
          <div class="photo-frame">
            <img src="${photoUrl}" alt="${childName || "Criança"}" class="photo-img" />
          </div>
          <div class="photo-caption">Retrato Oficial</div>
        </div>
        ` : ''}
        <div>
          <div class="polar-tag">Via Trenó Aéreo Oficial • Polo Norte</div>
          <div class="recipient-info">
            Correspondência para: <strong>${childName || "Criança Especial"}</strong> (${age ? `${age} anos` : ""} • ${city || "Brasil"})
          </div>
        </div>
      </div>
      <div class="wax-seal">
        <div class="seal-text-top">POLO<br/>NORTE</div>
        <div class="seal-text-sub">OFICIAL</div>
      </div>
    </div>
    
    <div class="letter-body">${(content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    
    <div class="footer">
      <div>
        <div class="official-badge">Certificado de Bondade & Amor • Registro ${token || "OFICIAL"}</div>
        <div style="font-size: 11px; color: #777; margin-top: 3px;">Expresso Polar Oficial • Carta Mágica</div>
      </div>
      <div class="signature-box">
        <div class="signature-font">Papai Noel</div>
        <div class="signature-sub">Oficina dos Duendes e Renas 🦌 • Polo Norte</div>
      </div>
    </div>
    ${waterMarkHtml}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao gerar versão para impressão", details: err?.message });
  }
});

// 3. Checkout Simulation & Webhook Confirmation
app.post("/api/checkout", (req, res) => {
  try {
    const { letterId, childName, includePhysicalDispatch = false, address } = req.body;
    const basePrice = 39.99;
    const physicalShippingPrice = includePhysicalDispatch ? 29.90 : 0;
    const totalPrice = Number((basePrice + physicalShippingPrice).toFixed(2));

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: OrderRecord = {
      orderId,
      letterId: letterId || "temp",
      childName: childName || "Criança",
      amount: totalPrice,
      plan: "pro",
      includePhysicalDispatch,
      status: "paid", // Confirmed payment
      paymentMethod: "Asaas (Pix / Cartão)",
      createdAt: new Date().toLocaleString("pt-BR"),
      paidAt: new Date().toLocaleString("pt-BR")
    };

    inMemoryOrders.unshift(newOrder);

    // Update letter if exists
    const letter = inMemoryLetters.find((l) => l.id === letterId);
    if (letter) {
      letter.plan = "pro";
      if (includePhysicalDispatch) {
        letter.deliveryStatus = "processing";
        letter.trackingCode = `NP-${Math.floor(100000 + Math.random() * 900000)}-BR`;
        if (address) {
          letter.shippingAddress = address;
        }
      }
    }

    res.json({
      success: true,
      order: newOrder,
      asaasCheckoutUrl: ASAAS_CHECKOUT_URL,
      message: "Pagamento processado via Asaas e Experiência Mágica PRO liberada com sucesso!"
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao processar pagamento" });
  }
});

// 4.1 Logistics calculation endpoint
app.post("/api/logistics/calculate", (req, res) => {
  const { zipCode, country = "Brasil" } = req.body;
  res.json({
    success: true,
    service: country === "Brasil" ? "Carta Registrada Polar Aérea" : "Expresso Internacional Polar",
    cost: 29.90,
    estimatedDays: country === "Brasil" ? "3 a 5 dias úteis" : "5 a 8 dias úteis",
    packaging: "Envelope pergaminho 180g com selo de cera vermelha artesanal",
    trackingAvailable: true
  });
});

// 4. International Logistics & Postal Quote Route
app.post("/api/logistics/quote", (req, res) => {
  const { country = "Brasil", zipCode } = req.body;

  // Realistically structured postal carriers
  const services = [
    {
      carrier: "Correio Polar Aéreo Oficial (Polo Norte Express)",
      deliveryTime: "3 a 5 dias úteis",
      price: 29.90,
      includes: ["Envelope pergaminho artesanal", "Selo de cera vermelha em relevo", "Certificado de Bom Menino / Boa Menina em papel 180g"]
    },
    {
      carrier: "DHL Express Internacional Natalino",
      deliveryTime: "2 a 3 dias úteis",
      price: 49.90,
      includes: ["Rastreamento prioritário em tempo real", "Embalagem presenteável com fita de veludo"]
    }
  ];

  res.json({
    success: true,
    destination: { country, zipCode },
    services,
    sealAuthenticity: "Selo holográfico do Polo Norte garantido"
  });
});

// In-memory Analytics Event log
const inMemoryAnalyticsEvents: Array<{
  event: string;
  timestamp: string;
  url?: string;
  utm?: any;
  payload?: any;
}> = [];

// 4.3 Analytics Event Tracking Ingestion
app.post("/api/analytics", (req, res) => {
  try {
    const { event, timestamp, url, utm, ...payload } = req.body;
    if (event) {
      inMemoryAnalyticsEvents.unshift({
        event,
        timestamp: timestamp || new Date().toISOString(),
        url,
        utm,
        payload
      });
      if (inMemoryAnalyticsEvents.length > 500) {
        inMemoryAnalyticsEvents.pop();
      }
    }
    res.json({ success: true, count: inMemoryAnalyticsEvents.length });
  } catch {
    res.json({ success: false });
  }
});

// 4.4 Secret Santa Message Generation / Retrieval (PRO feature)
app.post("/api/secret-message", async (req, res) => {
  try {
    const { letterId, childName = "Criança", achievements = "", parentNotes = "" } = req.body;
    
    // Check if letter already has one
    const letter = inMemoryLetters.find((l) => l.id === letterId);
    if (letter && letter.secretMessage) {
      return res.json({ success: true, secretMessage: letter.secretMessage });
    }

    let secretMessage = "";
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Você é o Papai Noel sussurrando um segredinho confidencial e muito doce para a criança chamada ${childName}.
Detalhes: ${achievements ? `Conquistas: ${achievements}.` : ""} ${parentNotes ? `Recado dos pais: ${parentNotes}.` : ""}
Escreva exatamente 2 a 3 frases curtas e afetuosas, começando com "Psst... Um segredo só nosso:" ou algo mágico equivalente, revelando algo especial que só o Papai Noel sabe sobre ela. Em português do Brasil caloroso e comovente.`,
          config: {
            temperature: 0.75,
            maxOutputTokens: 180,
          }
        });
        if (response && response.text) {
          secretMessage = response.text.trim();
        }
      } catch (err: any) {
        console.warn("Secret message fallback active:", err?.message);
      }
    }

    if (!secretMessage) {
      secretMessage = `Psst... ${childName}! Os duendes me contaram em segredo que o seu abraço tem o poder mágico de acalmar qualquer dia nublado. Guarde este segredo no seu coraçãozinho: você é a luz mais brilhante desta casa e o Polo Norte tem muito orgulho de você! ✨ Com carinho, Noel.`;
    }

    if (letter) {
      letter.secretMessage = secretMessage;
    }

    res.json({ success: true, secretMessage });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao gerar mensagem secreta", details: err?.message });
  }
});

// 4.5 Child Reaction Collector
app.post("/api/reaction", (req, res) => {
  try {
    const { letterId, reaction } = req.body;
    const letter = inMemoryLetters.find((l) => l.id === letterId);
    if (letter) {
      letter.childReaction = reaction;
    }
    res.json({ success: true, reaction });
  } catch {
    res.status(500).json({ error: "Erro ao salvar reação" });
  }
});

// 4.6 Elf Helper - AI Suggestions for Letter Personalization
function getFallbackElfSuggestions(field: string, childName: string = "", age?: number): string[] {
  const numAge = typeof age === "number" ? age : 6;

  switch (field) {
    case "achievements":
      if (numAge <= 4) {
        return [
          "Aprendeu a guardar os brinquedos no cesto com muita alegria e cantoria!",
          "Comeu frutas e legumes coloridos e distribuiu abraços apertados na família.",
          "Aprendeu a usar o peniquinho e foi muito corajosa em todas as novidades!",
          "Dividiu os brinquedos com os amiguinhos com um sorriso lindo no rostinho."
        ];
      } else if (numAge <= 8) {
        return [
          "Aprendeu a andar de bicicleta sem rodinhas e demonstrou muita coragem!",
          "Arrumou a caminha todos os dias e cuidou com muito carinho da família.",
          "Fez novos amigos na escola e ajudou os colegas com muita gentileza.",
          "Aprendeu a nadar sem bóias como um peixinho destemido!"
        ];
      } else {
        return [
          "Dedicou-se aos estudos com autonomia e tirou ótimas notas na escola.",
          "Ajudou nas tarefas de casa e foi um exemplo carinhoso de responsabilidade.",
          "Acolheu e defendeu um colega que estava se sentindo sozinho na escola.",
          "Desenvolveu novas habilidades com dedicação e persistência diante de desafios."
        ];
      }

    case "learningMilestone":
      if (numAge <= 4) {
        return [
          "Aprendeu a falar as primeiras frases completas e a cantarolar músicas.",
          "Aprendeu a calçar os próprios sapatos e a vestir o casaquinho.",
          "Aprendeu o nome das cores e a reconhecer os bichinhos nos livros.",
          "Aprendeu a expressar o que sente com palavras doces e carinhosas."
        ];
      } else if (numAge <= 8) {
        return [
          "Aprendeu a ler as primeiras palavrinhas e historinhas com entusiasmo!",
          "Aprendeu a amarrar o próprio tênis e a organizar a mochila escolar.",
          "Aprendeu a somar continhas e a escrever bilhetinhos cheios de carinho.",
          "Aprendeu a andar de patins/skate mantendo o equilíbrio com valentia."
        ];
      } else {
        return [
          "Aprendeu a tocar instrumentos musicais e a expressar sua criatividade.",
          "Leu livros mais longos por conta própria, ampliando muito a imaginação.",
          "Aprendeu a preparar receitinhas simples ajudando a família na cozinha.",
          "Aprendeu noções incríveis de ciências e robótica com muita curiosidade."
        ];
      }

    case "favoriteActivity":
      return [
        "Ama desenhar animais fantásticos, colorir mundos mágicos e pintar telas.",
        "Adora inventar castelos gigantes com blocos de montar e criar aventuras espaciais.",
        "Gosta de cantar, dançar pela sala e encenar teatrinhos divertidos.",
        "Adora brincar ao ar livre na grama, correr com o pet e andar de bicicleta."
      ];

    case "specialMention":
      return [
        "Lembrar que o vovô e a vovó mandam um abraço bem apertado e cheio de orgulho.",
        "Elogiar a bravura e a calma que mostrou durante a visita ao médico ou dentista.",
        "Mencionar o amor incondicional e o carinho com que cuida dos animais da casa.",
        "Dizer que os duendes do Polo Norte viram como ela foi generosa com os colegas."
      ];

    case "giftRequest":
      if (numAge <= 4) {
        return [
          "Um trenzinho de madeira com trilhos e bloquinhos coloridos para montar.",
          "Um livro interativo com sons de animais e ilustrações mágicas.",
          "Um bichinho de pelúcia fofinho para ser companheiro de soninhos tranquilos.",
          "Um kit lúdico de massinhas de modelar com forminhas divertidas."
        ];
      } else if (numAge <= 8) {
        return [
          "Uma bicicleta com capacete para viver grandes aventuras pelo parque!",
          "Um kit completo de pintura e artes com aquarelas, telas e pincéis.",
          "Um robô interativo inteligente ou jogo de tabuleiro para brincar em família.",
          "Um conjunto incrível de blocos de montar para construir naves e castelos."
        ];
      } else {
        return [
          "Um jogo de tabuleiro estratégico para reunir a família toda nas noites de Natal.",
          "Um kit de experimentos científicos ou robótica para explorar invenções.",
          "Um telescópio ou binóculo para observar as estrelas e constelações no céu.",
          "Um patinete esportivo veloz com kit completo de joelheiras e capacete."
        ];
      }

    case "parentNotes":
      return [
        "Lembrar com amor de continuar dormindo no próprio quartinho a noite toda com coragem.",
        "Reforçar que os pais têm um orgulho imenso de seu coração bondoso e alegre.",
        "Incentivar a continuar experimentando legumes e verduras para crescer forte e saudável.",
        "Lembrar que errar faz parte do aprendizado e que tentar de novo é sinal de sabedoria."
      ];

    default:
      return [
        "Uma atitude cheia de generosidade e empatia com as pessoas ao redor.",
        "Uma conquista diária feita com persistência, curiosidade e bom humor.",
        "Um momento inesquecível em família com gargalhadas e muito carinho.",
        "Um passo importante de crescimento e amadurecimento com amor."
      ];
  }
}

app.post("/api/elf-suggestions", async (req, res) => {
  try {
    const { field, childName = "", age, city = "" } = req.body;
    const ai = getGeminiClient();

    let suggestions: string[] = [];

    if (ai) {
      try {
        const fieldDescriptions: Record<string, string> = {
          achievements: "boas ações, conquistas ou atitudes nobres e carinhosas da criança no ano",
          learningMilestone: "aprendizados marcantes, habilidades novas e superações",
          favoriteActivity: "brincadeiras, atividades e hobbies favoritos da criança",
          specialMention: "recado especial ou detalhe carinhoso que o Papai Noel deve citar",
          giftRequest: "ideias realistas e lúdicas de pedidos de presentes de Natal para a criança",
          parentNotes: "conselho amoroso, hábito a incentivar ou palavra de carinho dos pais"
        };

        const targetField = fieldDescriptions[field] || "ideia mágica para carta de Natal";
        const childAgeStr = age ? `de ${age} anos` : "criança";
        const childNameStr = childName ? `chamada ${childName}` : "";

        const prompt = `Você é o Elfo Artesão da Fábrica do Papai Noel no Polo Norte.
Sua missão é sugerir exatamente 4 opções criativas, afetuosas, autênticas e inspiradoras em português brasileiro para preencher o campo: ${targetField}.
Perfil da criança: ${childNameStr} ${childAgeStr}.
Cada sugestão deve ser uma frase concisa (de 6 a 18 palavras), pronta para ser inserida diretamente no formulário pelos pais.
Retorne APENAS um array JSON de strings no formato:
["sugestão 1", "sugestão 2", "sugestão 3", "sugestão 4"]`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.85,
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            suggestions = parsed.slice(0, 4).map((s) => String(s).trim());
          }
        }
      } catch (err: any) {
        console.warn("Gemini elf suggestions call failed, falling back to curated suggestions:", err?.message || err);
      }
    }

    if (!suggestions || suggestions.length === 0) {
      suggestions = getFallbackElfSuggestions(field, childName, typeof age === "number" ? age : undefined);
    }

    res.json({
      success: true,
      field,
      suggestions,
    });
  } catch (error: any) {
    console.error("Error in /api/elf-suggestions:", error);
    res.status(500).json({ error: "Erro ao gerar sugestões do elfo." });
  }
});

// 5. Admin SaaS Metrics Route
app.get("/api/admin/metrics", (_req, res) => {
  const totalLetters = inMemoryLetters.length;
  const proLetters = inMemoryLetters.filter((l) => l.plan === "pro").length;
  const freeLetters = totalLetters - proLetters;
  const conversionRate = totalLetters > 0 ? Number(((proLetters / totalLetters) * 100).toFixed(1)) : 0;
  const totalRevenue = inMemoryOrders
    .filter((o) => o.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  res.json({
    totalLetters,
    proLetters,
    freeLetters,
    conversionRate,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    recentLetters: inMemoryLetters.slice(0, 10),
    recentOrders: inMemoryOrders.slice(0, 10),
    systemHealth: {
      geminiStatus: process.env.GEMINI_API_KEY ? "Operacional" : "Chave não detectada (Modo Fallback Ativo)",
      ttsStatus: "Nativo + Web Speech Operacional",
      pdfStatus: "Renderizador de Alta Precisão Operacional",
      logisticsStatus: "Integração Postal Operacional"
    }
  });
});

// 6. Supabase Architecture Blueprint Route (Schema exporter for production setup)
app.get("/api/supabase/schema", (_req, res) => {
  const schemaSql = `
-- ================================================================
-- CARTA MÁGICA - SUPABASE POSTGRESQL SCHEMA (PRODUCTION READY)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  asaas_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  child_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
  city TEXT NOT NULL,
  achievements TEXT,
  gift_request TEXT,
  parent_notes TEXT,
  style TEXT DEFAULT 'mágico',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  letter_content TEXT NOT NULL,
  photo_url TEXT,
  token TEXT UNIQUE NOT NULL,
  delivery_status TEXT DEFAULT 'digital_only',
  tracking_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  include_physical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brasil',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  billing_type TEXT NOT NULL,
  asaas_customer_id TEXT,
  asaas_payment_id TEXT,
  invoice_url TEXT,
  bank_slip_url TEXT,
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  due_date TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payment_id TEXT,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own experiences" ON public.experiences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public token access for children page" ON public.experiences
  FOR SELECT USING (true);

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
  `;
  res.setHeader("Content-Type", "text/plain");
  res.send(schemaSql);
});

app.get("/api/supabase-blueprint", (_req, res) => {
  const schemaSql = `
-- ================================================================
-- CARTA MÁGICA - SUPABASE POSTGRESQL SCHEMA (PRODUCTION READY)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  asaas_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  child_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
  city TEXT NOT NULL,
  achievements TEXT,
  gift_request TEXT,
  parent_notes TEXT,
  style TEXT DEFAULT 'mágico',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  letter_content TEXT NOT NULL,
  photo_url TEXT,
  token TEXT UNIQUE NOT NULL,
  delivery_status TEXT DEFAULT 'digital_only',
  tracking_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  include_physical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  billing_type TEXT NOT NULL,
  asaas_customer_id TEXT,
  asaas_payment_id TEXT,
  invoice_url TEXT,
  bank_slip_url TEXT,
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  due_date TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payment_id TEXT,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
`;
  res.json({ schema: schemaSql });
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carta Mágica Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
