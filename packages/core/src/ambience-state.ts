export type ConversationMode =
  | "text_conversation"
  | "voice_conversation"
  | "coding_session"
  | "study_session"
  | "creative_session"
  | "meditation"
  | "unknown";

export type EmotionalTone =
  | "neutral"
  | "lonely_reflective"
  | "focused"
  | "curious"
  | "excited"
  | "tense"
  | "sad"
  | "calm"
  | "playful"
  | "mystical";

export type TypingSpeed = "idle" | "slow" | "medium" | "fast";

export interface AuraSignal {
  mode?: ConversationMode;
  topic?: string;
  emotionalTone?: EmotionalTone;
  intensity?: number;
  silenceDurationMs?: number;
  userTypingSpeed?: TypingSpeed;
  agentName?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface AuraState {
  mode: ConversationMode;
  topic: string;
  emotionalTone: EmotionalTone;
  intensity: number;
  silenceDurationMs: number;
  userTypingSpeed: TypingSpeed;
  agentName: string;
  updatedAt: number;
  metadata: Record<string, unknown>;
}

export type SoundscapeId =
  | "quiet_presence"
  | "deep_room_low_warm_drone"
  | "soft_focus_current"
  | "curiosity_particles"
  | "creative_sparks"
  | "tension_shadow_pulse"
  | "calm_breathing_field"
  | "mystic_resonator"
  | "playful_glass_motes";

export interface AmbienceDecision {
  protocol: "aura.v1";
  soundscape: SoundscapeId;
  volume: number;
  baseFrequency: number;
  modulationRate: number;
  textureAmount: number;
  pulseAmount: number;
  transitionMs: number;
  explanation: string;
}

export const DEFAULT_AURA_STATE: AuraState = {
  mode: "unknown",
  topic: "general",
  emotionalTone: "neutral",
  intensity: 0.35,
  silenceDurationMs: 0,
  userTypingSpeed: "idle",
  agentName: "Aura",
  updatedAt: Date.now(),
  metadata: {}
};

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function normalizeSignal(signal: AuraSignal, previous: AuraState = DEFAULT_AURA_STATE): AuraState {
  return {
    mode: signal.mode ?? previous.mode,
    topic: signal.topic?.trim() || previous.topic,
    emotionalTone: signal.emotionalTone ?? previous.emotionalTone,
    intensity: clamp01(signal.intensity ?? previous.intensity),
    silenceDurationMs: Math.max(0, signal.silenceDurationMs ?? previous.silenceDurationMs),
    userTypingSpeed: signal.userTypingSpeed ?? previous.userTypingSpeed,
    agentName: signal.agentName?.trim() || previous.agentName,
    updatedAt: signal.timestamp ?? Date.now(),
    metadata: { ...previous.metadata, ...(signal.metadata ?? {}) }
  };
}
