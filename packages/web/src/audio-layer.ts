import type { AmbienceDecision, SoundscapeRenderStrategy } from "../../core/src";

export interface AuraAudioLayer {
  start(): Promise<void>;
  stop(): void;
  apply(decision: AmbienceDecision): void;
}

interface AudioGraph {
  context: AudioContext;
  masterGain: GainNode;
  drone: DroneVoice;
  noise: NoiseVoice;
  pulse: PulseVoice;
  particles: ParticleVoice;
}

interface DroneVoice {
  oscillator: OscillatorNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  gain: GainNode;
}

interface NoiseVoice {
  source: AudioBufferSourceNode;
  gain: GainNode;
  filter: BiquadFilterNode;
}

interface PulseVoice {
  oscillator: OscillatorNode;
  gain: GainNode;
  tremolo: OscillatorNode;
  tremoloGain: GainNode;
}

interface ParticleVoice {
  gain: GainNode;
  timer: number | null;
  lastDecision: AmbienceDecision | null;
}

export function createAuraAudioLayer(): AuraAudioLayer {
  let graph: AudioGraph | null = null;

  async function start() {
    if (graph) return;

    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(context.destination);

    const drone = createDroneVoice(context, masterGain);
    const noise = createNoiseVoice(context, masterGain);
    const pulse = createPulseVoice(context, masterGain);
    const particles = createParticleVoice(context, masterGain);

    drone.oscillator.start();
    drone.lfo.start();
    noise.source.start();
    pulse.oscillator.start();
    pulse.tremolo.start();

    graph = { context, masterGain, drone, noise, pulse, particles };
  }

  function stop() {
    if (!graph) return;

    window.clearInterval(graph.particles.timer ?? undefined);
    graph.drone.oscillator.stop();
    graph.drone.lfo.stop();
    graph.noise.source.stop();
    graph.pulse.oscillator.stop();
    graph.pulse.tremolo.stop();
    graph.context.close();
    graph = null;
  }

  function apply(decision: AmbienceDecision) {
    if (!graph) return;

    const strategy = decision.soundscapeMeta?.renderStrategy ?? inferStrategy(decision);

    applyDrone(graph, decision, strategy);
    applyNoise(graph, decision, strategy);
    applyPulse(graph, decision, strategy);
    applyParticles(graph, decision, strategy);
  }

  return { start, stop, apply };
}

function createDroneVoice(context: AudioContext, destination: AudioNode): DroneVoice {
  const gain = context.createGain();
  gain.gain.value = 0;
  gain.connect(destination);

  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 174;

  const lfo = context.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08;

  const lfoGain = context.createGain();
  lfoGain.gain.value = 4;

  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);
  oscillator.connect(gain);

  return { oscillator, lfo, lfoGain, gain };
}

function createNoiseVoice(context: AudioContext, destination: AudioNode): NoiseVoice {
  const source = createNoiseSource(context);
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;

  const gain = context.createGain();
  gain.gain.value = 0;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  return { source, gain, filter };
}

function createPulseVoice(context: AudioContext, destination: AudioNode): PulseVoice {
  const oscillator = context.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = 110;

  const tremolo = context.createOscillator();
  tremolo.type = "sine";
  tremolo.frequency.value = 0.9;

  const tremoloGain = context.createGain();
  tremoloGain.gain.value = 0.2;

  const gain = context.createGain();
  gain.gain.value = 0;

  tremolo.connect(tremoloGain);
  tremoloGain.connect(gain.gain);
  oscillator.connect(gain);
  gain.connect(destination);

  return { oscillator, gain, tremolo, tremoloGain };
}

function createParticleVoice(context: AudioContext, destination: AudioNode): ParticleVoice {
  const gain = context.createGain();
  gain.gain.value = 0.22;
  gain.connect(destination);

  return {
    gain,
    timer: null,
    lastDecision: null
  };
}

function applyDrone(graph: AudioGraph, decision: AmbienceDecision, strategy: SoundscapeRenderStrategy) {
  const now = graph.context.currentTime;
  const ramp = rampTime(decision);
  const active = strategy === "procedural_drone" || strategy === "external_renderer" || strategy === "sample_loop";
  const targetGain = active ? decision.volume : decision.volume * 0.16;

  graph.drone.oscillator.frequency.cancelScheduledValues(now);
  graph.drone.oscillator.frequency.setTargetAtTime(decision.baseFrequency, now, ramp / 3);

  graph.drone.lfo.frequency.cancelScheduledValues(now);
  graph.drone.lfo.frequency.setTargetAtTime(decision.modulationRate, now, ramp / 3);

  graph.drone.lfoGain.gain.cancelScheduledValues(now);
  graph.drone.lfoGain.gain.setTargetAtTime(2 + decision.pulseAmount * 10, now, ramp / 3);

  graph.drone.gain.gain.cancelScheduledValues(now);
  graph.drone.gain.gain.setTargetAtTime(targetGain, now, ramp / 3);
}

function applyNoise(graph: AudioGraph, decision: AmbienceDecision, strategy: SoundscapeRenderStrategy) {
  const now = graph.context.currentTime;
  const ramp = rampTime(decision);
  const textureBoost = strategy === "procedural_particles" ? 1.1 : strategy === "procedural_pulse" ? 0.7 : 0.9;
  const targetGain = decision.textureAmount * 0.035 * textureBoost;

  graph.noise.filter.frequency.cancelScheduledValues(now);
  graph.noise.filter.frequency.setTargetAtTime(600 + decision.baseFrequency * 5, now, ramp / 3);

  graph.noise.gain.gain.cancelScheduledValues(now);
  graph.noise.gain.gain.setTargetAtTime(targetGain, now, ramp / 3);
}

function applyPulse(graph: AudioGraph, decision: AmbienceDecision, strategy: SoundscapeRenderStrategy) {
  const now = graph.context.currentTime;
  const ramp = rampTime(decision);
  const active = strategy === "procedural_pulse";
  const targetGain = active ? decision.volume * 0.42 : 0.0001;

  graph.pulse.oscillator.frequency.cancelScheduledValues(now);
  graph.pulse.oscillator.frequency.setTargetAtTime(decision.baseFrequency / 2, now, ramp / 3);

  graph.pulse.tremolo.frequency.cancelScheduledValues(now);
  graph.pulse.tremolo.frequency.setTargetAtTime(0.45 + decision.pulseAmount * 3.2, now, ramp / 3);

  graph.pulse.tremoloGain.gain.cancelScheduledValues(now);
  graph.pulse.tremoloGain.gain.setTargetAtTime(decision.pulseAmount * 0.35, now, ramp / 3);

  graph.pulse.gain.gain.cancelScheduledValues(now);
  graph.pulse.gain.gain.setTargetAtTime(targetGain, now, ramp / 3);
}

function applyParticles(graph: AudioGraph, decision: AmbienceDecision, strategy: SoundscapeRenderStrategy) {
  graph.particles.lastDecision = decision;

  if (strategy !== "procedural_particles") {
    if (graph.particles.timer !== null) {
      window.clearInterval(graph.particles.timer);
      graph.particles.timer = null;
    }
    return;
  }

  if (graph.particles.timer !== null) return;

  graph.particles.timer = window.setInterval(() => {
    const latest = graph?.particles.lastDecision;
    if (!graph || !latest) return;
    spawnParticle(graph.context, graph.particles.gain, latest);
  }, 260);
}

function spawnParticle(context: AudioContext, destination: AudioNode, decision: AmbienceDecision) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const randomRatio = 1 + Math.random() * 1.8;

  oscillator.type = "sine";
  oscillator.frequency.value = decision.baseFrequency * randomRatio;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.002, decision.volume * 0.12), now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + Math.random() * 0.42);

  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(now);
  oscillator.stop(now + 0.8);
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

function inferStrategy(decision: AmbienceDecision): SoundscapeRenderStrategy {
  if (decision.soundscape.includes("particles") || decision.soundscape.includes("sparks") || decision.soundscape.includes("motes")) {
    return "procedural_particles";
  }

  if (decision.soundscape.includes("pulse")) {
    return "procedural_pulse";
  }

  return "procedural_drone";
}

function rampTime(decision: AmbienceDecision): number {
  return Math.max(0.2, decision.transitionMs / 1000);
}
