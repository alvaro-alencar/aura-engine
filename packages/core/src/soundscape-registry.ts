import type { SoundscapeId } from "./ambience-state";

export type SoundscapeEnergy = "very_low" | "low" | "medium" | "high";
export type SoundscapeTexture = "clean" | "warm" | "grainy" | "glassy" | "dark" | "airy" | "pulsed";
export type SoundscapeRenderStrategy = "procedural_drone" | "procedural_particles" | "procedural_pulse" | "sample_loop" | "external_renderer";

export interface SoundscapePreset {
  id: SoundscapeId;
  name: string;
  description: string;
  energy: SoundscapeEnergy;
  textures: SoundscapeTexture[];
  renderStrategy: SoundscapeRenderStrategy;
  defaultBaseFrequency: number;
  defaultVolume: number;
  tags: string[];
  recommendedFor: string[];
  avoidWhen: string[];
}

export const SOUNDSCAPE_REGISTRY: Record<SoundscapeId, SoundscapePreset> = {
  quiet_presence: {
    id: "quiet_presence",
    name: "Quiet Presence",
    description: "A barely audible field for neutral companionship without emotional pressure.",
    energy: "very_low",
    textures: ["clean", "airy"],
    renderStrategy: "procedural_drone",
    defaultBaseFrequency: 174,
    defaultVolume: 0.08,
    tags: ["neutral", "presence", "minimal", "safe-default"],
    recommendedFor: ["neutral chat", "onboarding", "idle states"],
    avoidWhen: ["high urgency", "celebration", "dense creative flow"]
  },
  deep_room_low_warm_drone: {
    id: "deep_room_low_warm_drone",
    name: "Deep Room Low Warm Drone",
    description: "A low, warm ambience for solitude, reflection and long-form thinking.",
    energy: "low",
    textures: ["warm", "grainy"],
    renderStrategy: "procedural_drone",
    defaultBaseFrequency: 110,
    defaultVolume: 0.16,
    tags: ["reflective", "lonely", "slow", "warm"],
    recommendedFor: ["philosophical writing", "late-night chat", "reflective conversation"],
    avoidWhen: ["panic", "high-focus coding", "playful interactions"]
  },
  soft_focus_current: {
    id: "soft_focus_current",
    name: "Soft Focus Current",
    description: "A stable current for studying, coding and concentrated reasoning.",
    energy: "medium",
    textures: ["clean", "pulsed"],
    renderStrategy: "procedural_drone",
    defaultBaseFrequency: 220,
    defaultVolume: 0.14,
    tags: ["focus", "study", "coding", "clarity"],
    recommendedFor: ["study sessions", "coding", "legal reasoning", "debugging"],
    avoidWhen: ["sleep", "grief", "very emotional conversations"]
  },
  curiosity_particles: {
    id: "curiosity_particles",
    name: "Curiosity Particles",
    description: "Small, bright sonic particles for exploration and learning.",
    energy: "medium",
    textures: ["glassy", "airy"],
    renderStrategy: "procedural_particles",
    defaultBaseFrequency: 294,
    defaultVolume: 0.13,
    tags: ["curious", "learning", "questions", "exploration"],
    recommendedFor: ["explanations", "tutorials", "research", "brainstorming"],
    avoidWhen: ["sadness", "deep silence", "high tension"]
  },
  creative_sparks: {
    id: "creative_sparks",
    name: "Creative Sparks",
    description: "A lively but still subtle ambience for ideation, design and creative work.",
    energy: "high",
    textures: ["glassy", "pulsed", "airy"],
    renderStrategy: "procedural_particles",
    defaultBaseFrequency: 330,
    defaultVolume: 0.18,
    tags: ["creative", "ideation", "spark", "momentum"],
    recommendedFor: ["brainstorming", "visual design", "story creation", "product ideation"],
    avoidWhen: ["meditation", "legal review", "sad reflection"]
  },
  tension_shadow_pulse: {
    id: "tension_shadow_pulse",
    name: "Tension Shadow Pulse",
    description: "A controlled pulse for tense states, designed to acknowledge urgency without amplifying panic.",
    energy: "medium",
    textures: ["dark", "pulsed"],
    renderStrategy: "procedural_pulse",
    defaultBaseFrequency: 146,
    defaultVolume: 0.12,
    tags: ["tense", "risk", "urgent", "controlled"],
    recommendedFor: ["error states", "critical debugging", "deadline awareness"],
    avoidWhen: ["anxiety", "fear", "medical distress", "emotional crisis"]
  },
  calm_breathing_field: {
    id: "calm_breathing_field",
    name: "Calm Breathing Field",
    description: "A slow breathing field for calm conversations and decompression.",
    energy: "very_low",
    textures: ["warm", "airy"],
    renderStrategy: "procedural_drone",
    defaultBaseFrequency: 196,
    defaultVolume: 0.11,
    tags: ["calm", "breathing", "soft", "rest"],
    recommendedFor: ["decompression", "quiet chat", "post-stress state"],
    avoidWhen: ["high energy creation", "fast-paced coding"]
  },
  mystic_resonator: {
    id: "mystic_resonator",
    name: "Mystic Resonator",
    description: "A symbolic resonance field for metaphysical, philosophical and poetic exploration.",
    energy: "low",
    textures: ["dark", "warm", "grainy"],
    renderStrategy: "procedural_drone",
    defaultBaseFrequency: 136.1,
    defaultVolume: 0.15,
    tags: ["mystical", "symbolic", "ritual", "philosophy"],
    recommendedFor: ["mythology", "philosophy", "symbolic thinking", "poetry"],
    avoidWhen: ["strict productivity", "legal final review", "panic"]
  },
  playful_glass_motes: {
    id: "playful_glass_motes",
    name: "Playful Glass Motes",
    description: "Tiny playful motes for light exploration without childish excess.",
    energy: "medium",
    textures: ["glassy", "airy"],
    renderStrategy: "procedural_particles",
    defaultBaseFrequency: 392,
    defaultVolume: 0.13,
    tags: ["playful", "light", "game", "children"],
    recommendedFor: ["children-friendly interfaces", "playful tasks", "light creative chat"],
    avoidWhen: ["serious legal work", "grief", "high concentration"]
  }
};

export function getSoundscapePreset(id: SoundscapeId): SoundscapePreset {
  return SOUNDSCAPE_REGISTRY[id];
}

export function listSoundscapePresets(): SoundscapePreset[] {
  return Object.values(SOUNDSCAPE_REGISTRY);
}

export function findSoundscapesByTag(tag: string): SoundscapePreset[] {
  const normalized = tag.trim().toLowerCase();
  return listSoundscapePresets().filter((preset) => preset.tags.includes(normalized));
}
