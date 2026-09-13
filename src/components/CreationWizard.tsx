import type React from "react";
import { useState, useEffect } from "react";
import { MessageStyle, PlanType, Letter } from "../types";
import { generateLetterAPI } from "../services/api";
import { trackEvent } from "../services/analytics";
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Heart, 
  Gift, 
  Clock, 
  Info,
  Upload
} from "lucide-react";

interface CreationWizardProps {
  initialPlan?: PlanType;
  onCancel: () => void;
  onLetterGenerated: (letter: Letter) => void;
}

export default function CreationWizard({
  initialPlan = "free",
  onCancel,
  onLetterGenerated,
}: CreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan);

  // Form State
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");

  // Step 2
  const [achievements, setAchievements] = useState("");
  const [learningMilestone, setLearningMilestone] = useState("");
  const [favoriteActivity, setFavoriteActivity] = useState("");
  const [specialMention, setSpecialMention] = useState("");

  // Step 3
  const [giftRequest, setGiftRequest] = useState("");

  // Step 4
  const [parentNotes, setParentNotes] = useState("");

  // Step 5
  const [style, setStyle] = useState<MessageStyle>("mágico");
  const [confirmedGuardian, setConfirmedGuardian] = useState(false);

  // Track form_started on mount
  useEffect(() => {
    trackEvent("form_started", { initialPlan });
  }, []);

  // Loading & Animated Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingMessages = [
    "🎅 O Papai Noel recebeu sua mensagem...",
    "❄️ Os duendes estão preparando sua carta...",
    "✨ Estamos colocando um toque especial...",
    "🎄 Sua surpresa está quase pronta...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle image upload mock / base64 preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const canProceedStep1 = childName.trim().length > 0 && age !== "" && city.trim().length > 0;
  const canProceedStep2 = true; // optional but recommended
  const canProceedStep3 = giftRequest.trim().length > 0;
  const canSubmit = confirmedGuardian && canProceedStep1;

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) {
      alert("Por favor, preencha o nome, a idade e a cidade da criança.");
      return;
    }
    if (currentStep === 3 && !canProceedStep3) {
      alert("Por favor, informe o pedido ou presente de Natal.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    if (!canSubmit) {
      alert("Por favor, confirme que é o responsável pela criança.");
      return;
    }

    setIsGenerating(true);

    // Combine achievements into a rich sentence for the prompt
    const combinedAchievements = [
      achievements ? `Fez de especial: ${achievements}` : "",
      learningMilestone ? `Aprendeu: ${learningMilestone}` : "",
      favoriteActivity ? `Gosta muito de: ${favoriteActivity}` : "",
      specialMention ? `Papai Noel deve mencionar: ${specialMention}` : "",
    ].filter(Boolean).join(". ");

    trackEvent("form_completed", {
      childName,
      age: Number(age),
      city,
      plan: selectedPlan,
    });

    try {
      const result = await generateLetterAPI({
        childName,
        age: Number(age),
        city,
        achievements: combinedAchievements,
        giftRequest,
        parentNotes,
        style,
        plan: selectedPlan,
        photoUrl: photoUrl || undefined
      });

      if (result && result.letter) {
        trackEvent("letter_generated", {
          letterId: result.letter.id,
          plan: result.letter.plan,
        });
        onLetterGenerated(result.letter);
      }
    } catch (err: any) {
      console.error("Error creating letter:", err);
      alert("Ocorreu um erro ao gerar a carta. Tentando recuperar...");
    } finally {
      setIsGenerating(false);
    }
  };

  const stepTitles = [
    "Informações da Criança",
    "Personalidade & Conquistas",
    "Pedido de Natal",
    "Recado Especial dos Pais",
    "Estilo, Resumo & Confirmação"
  ];

  if (isGenerating) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Subtle magical glow rings */}
          <div className="absolute inset-0 rounded-full bg-[#FFD166]/15 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-[#FFD166]/30 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFD166] animate-spin" style={{ animationDuration: "12s" }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#1C2541] to-[#0B132B] border border-[#FFD166]/60 flex items-center justify-center text-4xl shadow-lg">
            🎅
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#0B132B] border border-[#FFD166]/40 px-3.5 py-1.5 rounded-full text-xs text-[#FFD166] font-semibold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
          <span>Oficina do Polo Norte Conectada</span>
        </div>

        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mb-3">
          Momento Mágico no Polo Norte
        </h2>

        {/* Dynamic progressive message */}
        <div className="min-h-[56px] flex items-center justify-center px-4 mb-6">
          <p className="text-base sm:text-xl text-[#FFD166] font-medium max-w-lg transition-all duration-300">
            {loadingMessages[loadingTextIndex]}
          </p>
        </div>

        {/* Visual 4-step progress line */}
        <div className="flex items-center justify-center gap-2 max-w-xs w-full mb-8">
          {loadingMessages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                i <= loadingTextIndex ? "bg-[#FFD166] shadow-[0_0_8px_#FFD166]" : "bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#EDF2F4]/70 bg-[#0B132B]/80 px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
          <Clock className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
          <span>Escrevendo com todo o carinho e a sabedoria do Natal para {childName || "sua criança"}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      
      {/* Top Header & Cancel */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="text-xs text-[#EDF2F4]/60 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </button>

        <div className="flex items-center gap-2 bg-[#0B132B] px-3 py-1 rounded-full border border-white/10 text-xs">
          <span className="text-[#EDF2F4]/60">Plano selecionado:</span>
          <button
            onClick={() => setSelectedPlan(selectedPlan === "pro" ? "free" : "pro")}
            className={`font-bold px-2 py-0.5 rounded cursor-pointer ${
              selectedPlan === "pro"
                ? "bg-[#D90429] text-white"
                : "bg-white/10 text-[#FFD166]"
            }`}
          >
            {selectedPlan === "pro" ? "⭐ PRO (R$ 39,99)" : "Gratuito (R$ 0)"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-cinzel font-bold text-[#FFD166] mb-2">
          <span>Etapa {currentStep} de 5: {stepTitles[currentStep - 1]}</span>
          <span>{currentStep * 20}%</span>
        </div>
        <div className="w-full h-2.5 bg-[#0B132B] rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#FFD166] rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${currentStep * 20}%` }}
          />
        </div>
      </div>

      {/* Wizard Card Form */}
      <div className="bg-[#0B132B] border border-[#FFD166]/30 rounded-3xl p-6 sm:p-10 shadow-xl relative">
        
        {/* STEP 1: Child info */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider block mb-1">
                Passo 1
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                Quem é a criança especial?
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                Usaremos o nome e a cidade para que o Papai Noel converse diretamente com ela.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1.5">
                Nome da Criança *
              </label>
              <input
                type="text"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Ex: Sofia, Gabriel, Maria Flor..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                id="wizard-child-name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1.5">
                  Idade *
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ex: 5"
                  className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                  id="wizard-child-age"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1.5">
                  Cidade onde mora *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Belo Horizonte, MG"
                  className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                  id="wizard-child-city"
                />
              </div>
            </div>

            {/* Optional Photo Upload */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-semibold text-[#FFD166] mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Foto da Criança (Opcional — ilustra a página de abertura)</span>
              </label>
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FFD166] shrink-0">
                    <img src={photoUrl} alt="Preview da criança" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="absolute inset-0 bg-black/60 text-white text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer border-2 border-dashed border-white/20 hover:border-[#FFD166]/50 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-[#EDF2F4]/70 hover:text-white transition-colors bg-[#060B19]/60">
                    <Upload className="w-4 h-4 text-[#FFD166]" />
                    <span>Escolher foto do celular ou computador</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
                <span className="text-[11px] text-[#EDF2F4]/50 leading-tight">
                  Protegido: a foto fica armazenada apenas para visualização da sua família.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Personality and achievements */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider block mb-1">
                Passo 2
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                Personalidade & Conquistas de 2026
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                O Papai Noel vai elogiar as coisas incríveis que ela fez neste ano.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1">
                O que ela fez de especial este ano?
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Ex: Aprendeu a nadar sem bóia, ajudou a cuidar do irmãozinho bebê, arrumou a cama todos os dias..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none"
                id="wizard-achievements"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1">
                O que ela aprendeu de marcante?
              </label>
              <input
                type="text"
                value={learningMilestone}
                onChange={(e) => setLearningMilestone(e.target.value)}
                placeholder="Ex: Aprendeu a ler as primeiras palavras, a andar de patins..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1">
                Do que ela mais gosta?
              </label>
              <input
                type="text"
                value={favoriteActivity}
                onChange={(e) => setFavoriteActivity(e.target.value)}
                placeholder="Ex: Ama desenhar animais, brincar de super-herói, dançar na sala..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1">
                Existe algo em especial que você gostaria que o Papai Noel mencionasse?
              </label>
              <input
                type="text"
                value={specialMention}
                onChange={(e) => setSpecialMention(e.target.value)}
                placeholder="Ex: Lembrar que o vovô e a vovó mandam um abraço, ou que ela foi muito corajosa no dentista..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Gift Request */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider block mb-1">
                Passo 3
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                O Pedido de Natal
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                Qual o presente que seu filho mais pediu na cartinha deste ano?
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1.5">
                O que ela pediu de presente? *
              </label>
              <input
                type="text"
                required
                value={giftRequest}
                onChange={(e) => setGiftRequest(e.target.value)}
                placeholder="Ex: Uma bicicleta vermelha, um robô de dinossauro, kit de slime..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                id="wizard-gift-request"
              />
            </div>

            <div className="bg-[#060B19]/80 border border-white/10 rounded-2xl p-4 text-xs text-[#EDF2F4]/75 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#FFD166] shrink-0 mt-0.5" />
              <p leading-relaxed>
                <strong>Nota de Segurança e Carinho:</strong> A IA do Papai Noel nunca faz promessas materiais forçadas nem irreais. Ela valida o pedido com entusiasmo ("o Rudolph e os duendes estão de olho na oficina preparando com todo amor"), preservando as expectativas dos pais.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Parents confidential note */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider block mb-1">
                Passo 4
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                Mensagem Especial dos Pais
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                Um conselho amoroso ou palavra de incentivo que você quer que o Papai Noel reforce.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-1.5">
                Recado confidencial dos responsáveis (Opcional)
              </label>
              <textarea
                rows={4}
                value={parentNotes}
                onChange={(e) => setParentNotes(e.target.value)}
                placeholder="Ex: Lembrar que a mamãe e o papai têm muito orgulho dele e que ele deve continuar dormindo no próprio quarto e comendo as frutinhas..."
                className="w-full bg-[#060B19] border border-white/15 focus:border-[#FFD166] rounded-xl p-4 text-white text-xs sm:text-sm focus:outline-none"
                id="wizard-parent-notes"
              />
            </div>

            <div className="text-[11px] text-[#EDF2F4]/60">
              💡 Dica: O Papai Noel introduzirá isso sutilmente, como: "Seus pais me contaram com os olhos brilhando de amor que...".
            </div>
          </div>
        )}

        {/* STEP 5: Style, Summary and Guardian Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider block mb-1">
                Passo 5
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                Estilo da Mensagem & Confirmação
              </h3>
              <p className="text-xs text-[#EDF2F4]/70 mt-1">
                Revise os detalhes antes do Papai Noel começar a escrever.
              </p>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#EDF2F4]/90 mb-2">
                Escolha o Estilo da Carta
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: "mágico", label: "Mágico", icon: "✨", desc: "Pó de estrelas e Aurora Boreal" },
                  { key: "emocionante", label: "Emocionante", icon: "❤️", desc: "Lágrimas de ternura e orgulho" },
                  { key: "divertido", label: "Divertido", icon: "🎅", desc: "Brincadeiras das renas e duendes" },
                  { key: "carinhoso", label: "Carinhoso", icon: "🧸", desc: "Abraço acolhedor de Natal" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStyle(item.key as MessageStyle)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      style === item.key
                        ? "bg-[#1C2541] border-[#FFD166] text-white shadow-md ring-1 ring-[#FFD166]"
                        : "bg-[#060B19] border-white/10 text-[#EDF2F4]/70 hover:border-white/20"
                    }`}
                  >
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="font-bold text-xs text-white capitalize">{item.label}</div>
                    <div className="text-[10px] text-[#EDF2F4]/50 leading-tight mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-[#060B19] border border-white/10 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-[#FFD166] font-cinzel text-sm border-b border-white/10 pb-1">
                Resumo da Experiência:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#EDF2F4]/80">
                <div><span className="text-[#EDF2F4]/50">Criança:</span> {childName} ({age} anos)</div>
                <div><span className="text-[#EDF2F4]/50">Cidade:</span> {city}</div>
                <div className="col-span-2"><span className="text-[#EDF2F4]/50">Presente pedido:</span> {giftRequest}</div>
                {achievements && (
                  <div className="col-span-2"><span className="text-[#EDF2F4]/50">Conquistas:</span> {achievements}</div>
                )}
                <div><span className="text-[#EDF2F4]/50">Plano:</span> {selectedPlan === "pro" ? "⭐ PRO (R$ 39,99)" : "Gratuito (R$ 0)"}</div>
                <div><span className="text-[#EDF2F4]/50">Estilo:</span> {style}</div>
              </div>
            </div>

            {/* MANDATED PARENTAL PRIVACY CONFIRMATION */}
            <div className="bg-[#1C2541]/80 border border-[#FFD166]/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFD166]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Proteção e Privacidade Infantil</span>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmedGuardian}
                  onChange={(e) => setConfirmedGuardian(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 accent-[#D90429] cursor-pointer"
                  id="guardian-confirm-checkbox"
                />
                <span className="text-xs text-white leading-relaxed select-none">
                  <strong>Confirmo que sou responsável pela criança ou estou autorizado a criar esta experiência.</strong>
                  <span className="block text-[11px] text-[#EDF2F4]/60 mt-0.5">
                    Entendo que a plataforma não solicita endereço nem dados sensíveis e apenas maiores de 18 anos podem criar a carta.
                  </span>
                </span>
              </label>
            </div>

          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="text-xs font-bold text-[#EDF2F4]/70 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#FFD166] to-[#FFB703] hover:from-[#FFE194] hover:to-[#FFD166] text-[#060B19] font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!canSubmit}
              className={`bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold px-8 py-3 rounded-full text-sm sm:text-base flex items-center gap-2 shadow-lg border border-[#FFD166]/50 transition-all cursor-pointer ${
                canSubmit
                  ? "hover:scale-105 active:scale-95 gold-glow animate-pulse"
                  : "opacity-50 cursor-not-allowed"
              }`}
              id="wizard-submit-btn"
            >
              <span>🎅 Criar minha carta</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
