import { createAmbienceAgent, type AmbienceContextInput } from "../../../packages/ai/src";
import { createAuraEngine, type ConversationMode, type TypingSpeed } from "../../../packages/core/src";
import { createAuraAudioLayer } from "../../../packages/web/src/audio-layer";

const aura = createAuraEngine();
const agent = createAmbienceAgent();
const audio = createAuraAudioLayer();

const contextInput = document.querySelector<HTMLTextAreaElement>("#context");
const silenceInput = document.querySelector<HTMLInputElement>("#silence");
const silenceLabel = document.querySelector<HTMLSpanElement>("#silenceLabel");
const typingSpeedInput = document.querySelector<HTMLSelectElement>("#typingSpeed");
const modeInput = document.querySelector<HTMLSelectElement>("#mode");
const startButton = document.querySelector<HTMLButtonElement>("#start");
const inferButton = document.querySelector<HTMLButtonElement>("#infer");
const cycleButton = document.querySelector<HTMLButtonElement>("#cycle");
const stopButton = document.querySelector<HTMLButtonElement>("#stop");
const output = document.querySelector<HTMLPreElement>("#output");

const soundscapeName = document.querySelector<HTMLStrongElement>("#soundscapeName");
const soundscapeDescription = document.querySelector<HTMLSpanElement>("#soundscapeDescription");
const tone = document.querySelector<HTMLStrongElement>("#tone");
const strategy = document.querySelector<HTMLStrongElement>("#strategy");
const intensity = document.querySelector<HTMLStrongElement>("#intensity");
const confidence = document.querySelector<HTMLStrongElement>("#confidence");

let audioStarted = false;
let sampleIndex = 0;

const samples = [
  {
    text: "I am writing to an AI with headphones on. The room is silent. I want to feel that something intelligent is present here with me.",
    silence: 9000,
    speed: "slow",
    mode: "text_conversation"
  },
  {
    text: "I need to debug this TypeScript server and understand why the API route is broken. Keep me focused.",
    silence: 1800,
    speed: "fast",
    mode: "coding_session"
  },
  {
    text: "Explain this idea like I am studying deeply. I want clarity, patience and a soft current of concentration.",
    silence: 2500,
    speed: "medium",
    mode: "study_session"
  },
  {
    text: "What if an AI interface had an atmosphere, a symbolic room, a small cosmic weather around thought?",
    silence: 6000,
    speed: "slow",
    mode: "creative_session"
  },
  {
    text: "There is an urgent error in production and I need awareness without panic. Something is wrong but we can solve it.",
    silence: 500,
    speed: "fast",
    mode: "coding_session"
  }
] satisfies Array<{ text: string; silence: number; speed: TypingSpeed; mode: ConversationMode }>;

function readContext(): AmbienceContextInput {
  return {
    text: contextInput?.value ?? "",
    silenceDurationMs: Number(silenceInput?.value ?? 0),
    userTypingSpeed: (typingSpeedInput?.value ?? "idle") as TypingSpeed,
    mode: (modeInput?.value ?? "text_conversation") as ConversationMode,
    agentName: "AuraLiveDemo",
    metadata: {
      source: "aura-live-demo"
    }
  };
}

function inferAndApply() {
  const result = agent.inferSignal(readContext());
  const decision = aura.update(result.signal);

  if (audioStarted) {
    audio.apply(decision);
  }

  updateUi(result.confidence, result.reasons, decision);
}

function updateUi(agentConfidence: number, reasons: string[], decision = aura.decide(readContext())) {
  if (soundscapeName) soundscapeName.textContent = decision.soundscapeMeta?.name ?? decision.soundscape;
  if (soundscapeDescription) soundscapeDescription.textContent = decision.soundscapeMeta?.description ?? decision.explanation;
  if (tone) tone.textContent = aura.getState().emotionalTone;
  if (strategy) strategy.textContent = decision.soundscapeMeta?.renderStrategy ?? "—";
  if (intensity) intensity.textContent = String(aura.getState().intensity);
  if (confidence) confidence.textContent = String(agentConfidence);

  if (output) {
    output.textContent = JSON.stringify(
      {
        agent: {
          confidence: agentConfidence,
          reasons
        },
        state: aura.getState(),
        decision
      },
      null,
      2
    );
  }
}

function updateSilenceLabel() {
  if (!silenceInput || !silenceLabel) return;
  silenceLabel.textContent = `${silenceInput.value}ms`;
}

startButton?.addEventListener("click", async () => {
  await audio.start();
  audioStarted = true;
  inferAndApply();
});

inferButton?.addEventListener("click", inferAndApply);

stopButton?.addEventListener("click", () => {
  audio.stop();
  audioStarted = false;
});

cycleButton?.addEventListener("click", () => {
  const sample = samples[sampleIndex % samples.length];
  sampleIndex += 1;

  if (contextInput) contextInput.value = sample.text;
  if (silenceInput) silenceInput.value = String(sample.silence);
  if (typingSpeedInput) typingSpeedInput.value = sample.speed;
  if (modeInput) modeInput.value = sample.mode;

  updateSilenceLabel();
  inferAndApply();
});

contextInput?.addEventListener("input", () => {
  window.clearTimeout(Number(contextInput.dataset.timer ?? 0));
  const timer = window.setTimeout(inferAndApply, 420);
  contextInput.dataset.timer = String(timer);
});

silenceInput?.addEventListener("input", () => {
  updateSilenceLabel();
  inferAndApply();
});

typingSpeedInput?.addEventListener("change", inferAndApply);
modeInput?.addEventListener("change", inferAndApply);

updateSilenceLabel();
inferAndApply();
