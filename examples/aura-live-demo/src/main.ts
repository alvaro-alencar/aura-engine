import { createAmbienceAgent, type AmbienceContextInput, type AmbienceAgentResult } from "../../../packages/ai/src";
import { createAuraEngine, type AmbienceDecision, type ConversationMode, type TypingSpeed } from "../../../packages/core/src";
import { createAuraAudioLayer } from "../../../packages/web/src/audio-layer";

const aura = createAuraEngine();
const localAgent = createAmbienceAgent();
const audio = createAuraAudioLayer();

const API_BASE_URL = "http://localhost:8787";

interface InferenceResponse extends AmbienceAgentResult {
  decision: AmbienceDecision;
  provider?: "local-rules" | "openrouter";
}

const contextInput = document.querySelector<HTMLTextAreaElement>("#context");
const engineInput = document.querySelector<HTMLSelectElement>("#engine");
const silenceInput = document.querySelector<HTMLInputElement>("#silence");
const silenceLabel = document.querySelector<HTMLSpanElement>("#silenceLabel");
const typingSpeedInput = document.querySelector<HTMLSelectElement>("#typingSpeed");
const modeInput = document.querySelector<HTMLSelectElement>("#mode");
const startButton = document.querySelector<HTMLButtonElement>("#start");
const inferButton = document.querySelector<HTMLButtonElement>("#infer");
const cycleButton = document.querySelector<HTMLButtonElement>("#cycle");
const stopButton = document.querySelector<HTMLButtonElement>("#stop");
const output = document.querySelector<HTMLPreElement>("#output");

const soundscapeName = document.querySelector<HTMLElement>("#soundscapeName");
const soundscapeDescription = document.querySelector<HTMLSpanElement>("#soundscapeDescription");
const tone = document.querySelector<HTMLElement>("#tone");
const strategy = document.querySelector<HTMLElement>("#strategy");
const intensity = document.querySelector<HTMLElement>("#intensity");
const confidence = document.querySelector<HTMLElement>("#confidence");

let audioStarted = false;
let sampleIndex = 0;
let requestCounter = 0;

const samples = [
  {
    text: "Estou escrevendo para uma IA com fone no ouvido. O ambiente está silencioso. Quero sentir que existe algo inteligente presente aqui comigo.",
    silence: 9000,
    speed: "slow",
    mode: "text_conversation"
  },
  {
    text: "Preciso debugar este servidor TypeScript e entender por que a rota da API quebrou. Quero foco, não desespero.",
    silence: 1800,
    speed: "fast",
    mode: "coding_session"
  },
  {
    text: "Explique essa ideia como se eu estivesse estudando profundamente. Quero clareza, paciência e concentração suave.",
    silence: 2500,
    speed: "medium",
    mode: "study_session"
  },
  {
    text: "E se uma interface de IA tivesse atmosfera própria, uma sala simbólica, um pequeno clima cósmico ao redor do pensamento?",
    silence: 6000,
    speed: "slow",
    mode: "creative_session"
  },
  {
    text: "Existe um erro urgente em produção. Preciso de atenção máxima, mas sem pânico. Algo está errado, mas podemos resolver.",
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
      source: "aura-live-demo",
      language: "pt-BR"
    }
  };
}

async function inferAndApply() {
  const currentRequest = requestCounter + 1;
  requestCounter = currentRequest;

  setLoading(true);

  try {
    const result = await inferWithSelectedEngine(readContext());

    if (currentRequest !== requestCounter) return;

    const decision = aura.update(result.signal);
    const finalDecision = result.decision ?? decision;

    if (audioStarted) {
      audio.apply(finalDecision);
    }

    updateUi(result.confidence, result.reasons, finalDecision, result.provider ?? selectedEngineLabel());
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
}

async function inferWithSelectedEngine(context: AmbienceContextInput): Promise<InferenceResponse> {
  if (engineInput?.value === "openrouter") {
    const response = await fetch(`${API_BASE_URL}/llm-infer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(context)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(payload?.message ?? `Falha ao chamar OpenRouter pelo servidor local: ${response.status}`);
    }

    return await response.json() as InferenceResponse;
  }

  const result = localAgent.inferSignal(context);
  const decision = aura.decide(result.signal);
  return { ...result, decision, provider: "local-rules" };
}

function updateUi(agentConfidence: number, reasons: string[], decision: AmbienceDecision, provider: string) {
  if (soundscapeName) soundscapeName.textContent = decision.soundscapeMeta?.name ?? decision.soundscape;
  if (soundscapeDescription) soundscapeDescription.textContent = decision.soundscapeMeta?.description ?? decision.explanation;
  if (tone) tone.textContent = aura.getState().emotionalTone;
  if (strategy) strategy.textContent = decision.soundscapeMeta?.renderStrategy ?? "—";
  if (intensity) intensity.textContent = String(aura.getState().intensity);
  if (confidence) confidence.textContent = String(agentConfidence);

  if (output) {
    output.textContent = JSON.stringify(
      {
        motor: provider,
        agente: {
          confianca: agentConfidence,
          motivos: reasons
        },
        estado: aura.getState(),
        decisao: decision
      },
      null,
      2
    );
  }
}

function showError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro desconhecido.";
  if (soundscapeName) soundscapeName.textContent = "Erro na inferência";
  if (soundscapeDescription) soundscapeDescription.textContent = message;
  if (output) {
    output.textContent = JSON.stringify({ erro: message }, null, 2);
  }
}

function setLoading(isLoading: boolean) {
  if (!inferButton) return;
  inferButton.disabled = isLoading;
  inferButton.textContent = isLoading ? "Inferindo..." : "Inferir e aplicar";
}

function selectedEngineLabel() {
  return engineInput?.value === "openrouter" ? "openrouter" : "local-rules";
}

function updateSilenceLabel() {
  if (!silenceInput || !silenceLabel) return;
  silenceLabel.textContent = `${silenceInput.value}ms`;
}

startButton?.addEventListener("click", async () => {
  await audio.start();
  audioStarted = true;
  await inferAndApply();
});

inferButton?.addEventListener("click", () => {
  void inferAndApply();
});

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
  void inferAndApply();
});

contextInput?.addEventListener("input", () => {
  window.clearTimeout(Number(contextInput.dataset.timer ?? 0));
  const timer = window.setTimeout(() => void inferAndApply(), 650);
  contextInput.dataset.timer = String(timer);
});

silenceInput?.addEventListener("input", () => {
  updateSilenceLabel();
  void inferAndApply();
});

typingSpeedInput?.addEventListener("change", () => void inferAndApply());
modeInput?.addEventListener("change", () => void inferAndApply());
engineInput?.addEventListener("change", () => void inferAndApply());

updateSilenceLabel();
void inferAndApply();
