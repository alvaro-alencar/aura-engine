import { createAuraEngine, type EmotionalTone } from "../../../packages/core/src";
import { createAuraAudioLayer } from "../../../packages/web/src/audio-layer";

const aura = createAuraEngine();
const audio = createAuraAudioLayer();

const tone = document.querySelector<HTMLSelectElement>("#tone");
const intensity = document.querySelector<HTMLInputElement>("#intensity");
const start = document.querySelector<HTMLButtonElement>("#start");
const stop = document.querySelector<HTMLButtonElement>("#stop");
const output = document.querySelector<HTMLPreElement>("#output");

function render() {
  if (!tone || !intensity || !output) return;

  const decision = aura.update({
    mode: "text_conversation",
    topic: "responsive ambience",
    emotionalTone: tone.value as EmotionalTone,
    intensity: Number(intensity.value),
    silenceDurationMs: tone.value === "lonely_reflective" ? 8500 : 2200,
    userTypingSpeed: "slow",
    agentName: "Aura"
  });

  audio.apply(decision);
  output.textContent = JSON.stringify(decision, null, 2);
}

start?.addEventListener("click", async () => {
  await audio.start();
  render();
});

stop?.addEventListener("click", () => {
  audio.stop();
});

tone?.addEventListener("change", render);
intensity?.addEventListener("input", render);
render();
