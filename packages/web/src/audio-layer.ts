import type { AmbienceDecision } from "../../core/src";

export interface AuraAudioLayer {
  start(): Promise<void>;
  stop(): void;
  apply(decision: AmbienceDecision): void;
}

export function createAuraAudioLayer(): AuraAudioLayer {
  let context: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let lfo: OscillatorNode | null = null;
  let lfoGain: GainNode | null = null;
  let gain: GainNode | null = null;
  let noiseSource: AudioBufferSourceNode | null = null;
  let noiseGain: GainNode | null = null;

  async function start() {
    if (context) return;

    context = new AudioContext();
    gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);

    oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 174;

    lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;

    lfoGain = context.createGain();
    lfoGain.gain.value = 4;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    oscillator.connect(gain);

    noiseGain = context.createGain();
    noiseGain.gain.value = 0;
    noiseGain.connect(gain);

    noiseSource = createNoiseSource(context);
    noiseSource.connect(noiseGain);

    oscillator.start();
    lfo.start();
    noiseSource.start();
  }

  function stop() {
    oscillator?.stop();
    lfo?.stop();
    noiseSource?.stop();
    context?.close();

    context = null;
    oscillator = null;
    lfo = null;
    lfoGain = null;
    gain = null;
    noiseSource = null;
    noiseGain = null;
  }

  function apply(decision: AmbienceDecision) {
    if (!context || !oscillator || !gain || !lfo || !lfoGain || !noiseGain) return;

    const now = context.currentTime;
    const ramp = Math.max(0.2, decision.transitionMs / 1000);

    oscillator.frequency.cancelScheduledValues(now);
    oscillator.frequency.setTargetAtTime(decision.baseFrequency, now, ramp / 3);

    lfo.frequency.cancelScheduledValues(now);
    lfo.frequency.setTargetAtTime(decision.modulationRate, now, ramp / 3);

    lfoGain.gain.cancelScheduledValues(now);
    lfoGain.gain.setTargetAtTime(2 + decision.pulseAmount * 16, now, ramp / 3);

    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(decision.volume, now, ramp / 3);

    noiseGain.gain.cancelScheduledValues(now);
    noiseGain.gain.setTargetAtTime(decision.textureAmount * 0.035, now, ramp / 3);
  }

  return { start, stop, apply };
}

function createNoiseSource(context: AudioContext): AudioBufferSourceNode {
  const bufferSize = context.sampleRate * 2;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}
