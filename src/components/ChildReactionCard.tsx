import { useState } from "react";
import { Heart, Sparkles, Star, Smile, ThumbsUp } from "lucide-react";
import { submitChildReactionAPI } from "../services/api";
import confetti from "canvas-confetti";

interface ChildReactionCardProps {
  letterId: string;
  childName: string;
  initialReaction?: string;
}

const REACTIONS = [
  { id: "encantado", label: "😍 Ficou encantado(a)!", emoji: "😍" },
  { id: "emocionado", label: "🥹 Muito emocionado(a)!", emoji: "🥹" },
  { id: "alegria", label: "⭐ Pulou de alegria!", emoji: "⭐" },
  { id: "magia", label: "🎅 Acreditou na magia!", emoji: "🎅" },
];

export default function ChildReactionCard({
  letterId,
  childName,
  initialReaction,
}: ChildReactionCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(initialReaction || null);
  const [feedback, setFeedback] = useState(false);

  const handleSelect = async (reactionLabel: string) => {
    setSelectedReaction(reactionLabel);
    setFeedback(true);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#FFD166", "#EF233C", "#06D6A0"],
    });

    await submitChildReactionAPI(letterId, reactionLabel);
  };

  return (
    <div className="bg-[#0B132B]/80 border border-white/15 rounded-2xl p-5 sm:p-6 text-center space-y-3 relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 text-sm font-cinzel font-bold text-white">
        <Heart className="w-4 h-4 text-[#EF233C] fill-[#EF233C]" />
        <span>Gostou da mensagem do Papai Noel?</span>
      </div>

      <p className="text-xs text-[#EDF2F4]/70 max-w-md mx-auto">
        Como {childName || "a criança"} reagiu ao ver a cartinha mágica? Compartilhe com o Polo Norte!
      </p>

      {/* Reaction chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {REACTIONS.map((r) => {
          const isChosen = selectedReaction === r.label;
          return (
            <button
              key={r.id}
              onClick={() => handleSelect(r.label)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isChosen
                  ? "bg-[#D90429] text-white border-2 border-[#FFD166] shadow-md scale-105"
                  : "bg-[#1C2541]/80 hover:bg-[#2A385B] text-[#EDF2F4] border border-white/10 hover:border-[#FFD166]/40"
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label.replace(/^.*? /, "")}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="mt-3 pt-2 text-xs text-[#FFD166] flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
          <span>Que lindo! Os duendes do Polo Norte comemoraram ao saber da reação de {childName}! ✨</span>
        </div>
      )}
    </div>
  );
}
