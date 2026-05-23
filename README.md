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

## Use it in five ways

### 1. Browser demo

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

### 2. HTTP sidecar for any language

```bash
npm install
npm run server
```

Then call:

```txt
POST http://localhost:8787/decide
```

Example:

```bash
curl -X POST http://localhost:8787/decide \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "study_session",
    "topic": "medical tutoring",
    "emotionalTone": "focused",
    "intensity": 0.64,
    "silenceDurationMs": 4200,
    "userTypingSpeed": "medium",
    "agentName": "Tutoria"
  }'
```

### 3. Docker sidecar

```bash
docker compose up --build
```

The service will be available at:

```txt
http://localhost:8787
```

### 4. Live ambience stream

Aura Engine can stream ambience updates through Server-Sent Events:

```txt
GET http://localhost:8787/events
```

Browser example:

```ts
const events = new EventSource("http://localhost:8787/events");

events.addEventListener("aura.update", (event) => {
  const payload = JSON.parse(event.data);
  console.log(payload.decision);
});
```

SDK example:

```ts
const subscription = aura.subscribe({
  onEvent(event) {
    if (event.decision) {
      console.log("Apply ambience", event.decision);
    }
  }
});
```

### 5. Ambience Agent inference

Aura Engine can infer symbolic ambience signals from interaction context:

```txt
POST http://localhost:8787/infer
POST http://localhost:8787/infer-update
```

Example:

```bash
curl -X POST http://localhost:8787/infer-update \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I feel alone writing to this AI in silence, but I want to keep thinking.",
    "silenceDurationMs": 9000,
    "userTypingSpeed": "slow",
    "agentName": "AuraAgent"
  }'
```

`/infer` returns signal and decision without mutating state.  
`/infer-update` infers, updates Aura state and broadcasts `aura.update` to SSE clients.

## Basic library usage

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

## HTTP client usage

```ts
import { createAuraHttpClient } from "./packages/client/src";

const aura = createAuraHttpClient({ baseUrl: "http://localhost:8787" });

const decision = await aura.decide({
  mode: "text_conversation",
  topic: "onboarding",
  emotionalTone: "curious",
  intensity: 0.48
});

console.log(decision);
```

## Protocol

Aura Engine speaks JSON over HTTP and SSE.

See:

- `docs/protocol.md`
- `docs/openapi.yaml`
- `docs/ambience-agent.md`
- `docs/streaming.md`
- `docs/integration-guide.md`
- `docs/sidecar.md`

## Repository structure

```txt
aura-engine/
  docs/
    manifesto.md
    architecture.md
    protocol.md
    openapi.yaml
    ambience-agent.md
    streaming.md
    integration-guide.md
    sidecar.md
  packages/
    ai/
      src/
        ambience-agent.ts
        prompt.ts
        index.ts
    core/
      src/
        ambience-engine.ts
        ambience-state.ts
        mood-mapper.ts
        index.ts
    client/
      src/
        aura-http-client.ts
        index.ts
    server/
      src/
        server.ts
    web/
      src/
        audio-layer.ts
  examples/
    browser-demo/
      index.html
      src/main.ts
    http-client/
      README.md
    streaming-client/
      index.html
```

## Design laws

Aura must be subtle.

If it competes with thought, it failed.

If it manipulates emotion aggressively, it failed.

If it becomes generic music, it failed.

Aura should behave like the weather of an intelligent room.

## Status

Experimental seed version.

This is the first skeleton: a working symbolic and procedural foundation for responsive ambience. The next step is connecting optional LLM providers, adding richer renderers and expanding the sound palette.

## Citation

If this concept helps your project, article, product or research, cite:

**Álvaro Alencar — Aura Engine: responsive ambience engine for AI interfaces.**
