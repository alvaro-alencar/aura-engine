import type { AuraSignal, EmotionalTone, ConversationMode, TypingSpeed } from "../../core/src";

export interface AmbienceContextInput {
  text?: string;
  mode?: ConversationMode;
  topic?: string;
  userIsTyping?: boolean;
  userTypingSpeed?: TypingSpeed;
  silenceDurationMs?: number;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

export interface AmbienceAgentResult {
  signal: AuraSignal;
  confidence: number;
  reasons: string[];
}

const TONE_KEYWORDS: Array<{ tone: EmotionalTone; keywords: string[] }> = [
  { tone: "tense", keywords: ["urgent", "error", "broken", "problem", "afraid", "risk", "danger", "angry", "stuck"] },
  { tone: "sad", keywords: ["sad", "alone", "lonely", "grief", "tired", "empty", "loss"] },
  { tone: "excited", keywords: ["amazing", "great", "awesome", "launch", "yes", "wow", "love"] },
  { tone: "curious", keywords: ["why", "how", "what if", "explain", "understand", "learn"] },
  { tone: "focused", keywords: ["code", "debug", "analyze", "architecture", "implement", "solve", "study"] },
  { tone: "mystical", keywords: ["soul", "ritual", "cosmic", "symbol", "transcend", "void", "sacred"] },
  { tone: "playful", keywords: ["fun", "game", "joke", "play", "haha", "lol"] },
  { tone: "calm", keywords: ["calm", "peace", "breathe", "slow", "soft"] }
];

export function createAmbienceAgent() {
  return {
    inferSignal(input: AmbienceContextInput): AmbienceAgentResult {
      const text = input.text?.toLowerCase() ?? "";
      const reasons: string[] = [];
      const inferredTone = inferTone(text, reasons);
      const intensity = inferIntensity(text, input.silenceDurationMs ?? 0, input.userTypingSpeed);

      if (input.silenceDurationMs && input.silenceDurationMs > 7000 && inferredTone === "neutral") {
        reasons.push("Long silence suggests reflective presence.");
      }

      const signal: AuraSignal = {
        mode: input.mode ?? inferMode(text),
        topic: input.topic ?? inferTopic(text),
        emotionalTone: inferredTone === "neutral" && (input.silenceDurationMs ?? 0) > 7000 ? "lonely_reflective" : inferredTone,
        intensity,
        silenceDurationMs: input.silenceDurationMs ?? 0,
        userTypingSpeed: input.userTypingSpeed ?? (input.userIsTyping ? "medium" : "idle"),
        agentName: input.agentName ?? "AuraAgent",
        metadata: {
          source: "ambience-agent-rule-based",
          ...(input.metadata ?? {})
        }
      };

      return {
        signal,
        confidence: estimateConfidence(text, reasons),
        reasons: reasons.length > 0 ? reasons : ["No strong emotional cues found. Using neutral ambience."]
      };
    }
  };
}

function inferTone(text: string, reasons: string[]): EmotionalTone {
  let best: { tone: EmotionalTone; score: number } = { tone: "neutral", score: 0 };

  for (const candidate of TONE_KEYWORDS) {
    const score = candidate.keywords.reduce((sum, keyword) => {
      return text.includes(keyword) ? sum + 1 : sum;
    }, 0);

    if (score > best.score) {
      best = { tone: candidate.tone, score };
    }
  }

  if (best.score > 0) {
    reasons.push(`Detected ${best.tone} tone from keyword cues.`);
  }

  return best.tone;
}

function inferIntensity(text: string, silenceDurationMs: number, typingSpeed?: TypingSpeed): number {
  const exclamationWeight = Math.min(0.18, (text.match(/!/g)?.length ?? 0) * 0.03);
  const questionWeight = Math.min(0.12, (text.match(/\?/g)?.length ?? 0) * 0.02);
  const lengthWeight = Math.min(0.22, text.length / 1200);
  const silenceWeight = Math.min(0.18, silenceDurationMs / 30000);
  const typingWeight = typingSpeed === "fast" ? 0.12 : typingSpeed === "medium" ? 0.06 : 0;

  return Number(Math.min(1, 0.25 + exclamationWeight + questionWeight + lengthWeight + silenceWeight + typingWeight).toFixed(3));
}

function inferMode(text: string): ConversationMode {
  if (/code|debug|typescript|python|api|server|repo/.test(text)) return "coding_session";
  if (/lesson|study|learn|explain|teacher|student/.test(text)) return "study_session";
  if (/story|poem|song|design|create|art/.test(text)) return "creative_session";
  if (/breathe|meditation|calm|silence/.test(text)) return "meditation";
  return "text_conversation";
}

function inferTopic(text: string): string {
  if (/code|debug|typescript|python|api|server|repo/.test(text)) return "software development";
  if (/lesson|study|learn|explain|teacher|student/.test(text)) return "learning";
  if (/story|poem|song|design|create|art/.test(text)) return "creative work";
  if (/law|legal|court|petition|judge/.test(text)) return "legal reasoning";
  if (/ai|agent|model|llm/.test(text)) return "artificial intelligence";
  return "general conversation";
}

function estimateConfidence(text: string, reasons: string[]): number {
  const cueWeight = Math.min(0.5, reasons.length * 0.18);
  const textWeight = Math.min(0.3, text.length / 1000);
  return Number(Math.min(0.92, 0.28 + cueWeight + textWeight).toFixed(3));
}
