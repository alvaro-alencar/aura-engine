import type { AmbienceDecision, AuraState, EmotionalTone, SoundscapeId } from "./ambience-state";
import { clamp01 } from "./ambience-state";
import { getSoundscapePreset } from "./soundscape-registry";

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

  const soundscape = TONE_TO_SOUNDSCAPE[state.emotionalTone] ?? "quiet_presence";
  const preset = getSoundscapePreset(soundscape);

  const volume = clamp01(preset.defaultVolume + intensity * 0.18 + silenceWeight * 0.06 - typingWeight);
  const baseFrequency = Number((preset.defaultBaseFrequency + intensity * 24).toFixed(2));
  const modulationRate = Number((0.04 + intensity * 0.28 + silenceWeight * 0.05).toFixed(3));
  const textureAmount = Number(clamp01(0.18 + intensity * 0.52 + silenceWeight * 0.16).toFixed(3));
  const pulseAmount = Number(clamp01(state.emotionalTone === "tense" ? 0.75 : intensity * 0.45).toFixed(3));

  return {
    protocol: "aura.v1",
    soundscape,
    soundscapeMeta: {
      name: preset.name,
      description: preset.description,
      energy: preset.energy,
      textures: preset.textures,
      renderStrategy: preset.renderStrategy,
      tags: preset.tags
    },
    volume: Number(volume.toFixed(3)),
    baseFrequency,
    modulationRate,
    textureAmount,
    pulseAmount,
    transitionMs: state.silenceDurationMs > 7000 ? 4200 : 1800,
    explanation: explainDecision(state, soundscape)
  };
}

function explainDecision(state: AuraState, soundscape: SoundscapeId): string {
  return `Mapped ${state.emotionalTone} tone in ${state.mode} mode to ${soundscape} with intensity ${state.intensity}.`;
}
