import type { AmbienceDecision, AuraState, EmotionalTone, SoundscapeId } from "./ambience-state";
import { clamp01 } from "./ambience-state";

const TONE_TO_SOUNDSCAPE: Record<EmotionalTone, SoundscapeId> = {
  neutral: "quiet_presence",
  lonely_reflective: "deep_room_low_warm_drone",
  focused: "soft_focus_current",
  curious: "curiosity_particles",
  excited: "creative_sparks",
  tense: "tension_shadow_pulse",
  sad: "deep_room_low_warm_drone",
  calm: "calm_breathing_field",
  playful: "playful_glass_motes",
  mystical: "mystic_resonator"
};

export function mapStateToAmbience(state: AuraState): AmbienceDecision {
  const intensity = clamp01(state.intensity);
  const silenceWeight = clamp01(state.silenceDurationMs / 15000);
  const typingWeight = state.userTypingSpeed === "fast" ? 0.18 : state.userTypingSpeed === "medium" ? 0.1 : 0;
  const volume = clamp01(0.08 + intensity * 0.24 + silenceWeight * 0.08 - typingWeight);

  const soundscape = TONE_TO_SOUNDSCAPE[state.emotionalTone] ?? "quiet_presence";

  const baseFrequency = chooseBaseFrequency(state.emotionalTone, intensity);
  const modulationRate = Number((0.04 + intensity * 0.28 + silenceWeight * 0.05).toFixed(3));
  const textureAmount = Number(clamp01(0.18 + intensity * 0.52 + silenceWeight * 0.16).toFixed(3));
  const pulseAmount = Number(clamp01(state.emotionalTone === "tense" ? 0.75 : intensity * 0.45).toFixed(3));

  return {
    protocol: "aura.v1",
    soundscape,
    volume: Number(volume.toFixed(3)),
    baseFrequency,
    modulationRate,
    textureAmount,
    pulseAmount,
    transitionMs: state.silenceDurationMs > 7000 ? 4200 : 1800,
    explanation: explainDecision(state, soundscape)
  };
}

function chooseBaseFrequency(tone: EmotionalTone, intensity: number): number {
  const base = {
    neutral: 174,
    lonely_reflective: 110,
    focused: 220,
    curious: 294,
    excited: 330,
    tense: 146,
    sad: 123,
    calm: 196,
    playful: 392,
    mystical: 136.1
  } satisfies Record<EmotionalTone, number>;

  return Number((base[tone] + intensity * 24).toFixed(2));
}

function explainDecision(state: AuraState, soundscape: SoundscapeId): string {
  return `Mapped ${state.emotionalTone} tone in ${state.mode} mode to ${soundscape} with intensity ${state.intensity}.`;
}
