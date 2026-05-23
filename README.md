# Aura Engine

**Aura Engine** is a responsive ambience engine powered by AI.

It creates a real-time atmospheric layer for conversations, apps and agentic interfaces, transforming silent interactions into living sensory fields.

The goal is not to play background music.

The goal is to create presence.

> Idea and original concept by **Álvaro Alencar**.  
> Public project. You may use it, fork it, remix it and build from it. Please cite Álvaro Alencar as the original thinker of the concept.

## Why this exists

Modern AI interfaces are too silent. They answer, but they do not inhabit the room.

Humans do not perceive presence only through words. Presence has rhythm, texture, breath, silence, density and atmosphere.

Aura Engine explores a simple thesis:

> AI interfaces should not only speak. They should create an ambient field of presence.

## What it does

Aura Engine receives conversational signals and maps them into ambience decisions.

Examples of signals:

- conversation mode
- topic
- emotional tone
- cognitive intensity
- silence duration
- typing rhythm
- agent personality
- transition between contexts

The first version does not try to generate complex music from scratch. It starts with a pragmatic architecture:

1. interpret conversational state;
2. map the state to an ambience profile;
3. render a lightweight procedural soundscape in the browser;
4. expose a clean API that can later be connected to a dedicated ambience AI.

## Quick start

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Basic usage

```ts
import { createAuraEngine } from "./packages/core/src";

const aura = createAuraEngine();

const decision = aura.update({
  mode: "text_conversation",
  topic: "philosophy",
  emotionalTone: "lonely_reflective",
  intensity: 0.72,
  silenceDurationMs: 8500,
  userTypingSpeed: "slow"
});

console.log(decision);
```

## Repository structure

```txt
aura-engine/
  docs/
    manifesto.md
    architecture.md
    ambience-taxonomy.md
  packages/
    core/
      src/
        ambience-engine.ts
        ambience-state.ts
        mood-mapper.ts
        index.ts
    web/
      src/
        audio-layer.ts
    ai/
      src/
        ambience-agent.ts
        prompt.ts
  examples/
    browser-demo/
      index.html
      src/main.ts
```

## Status

Experimental seed version.

This is the first skeleton: a working symbolic and procedural foundation for responsive ambience. The next step is connecting an actual LLM-based ambience agent and expanding the sound palette.

## Citation

If this concept helps your project, article, product or research, cite:

**Álvaro Alencar — Aura Engine: responsive ambience engine for AI interfaces.**
