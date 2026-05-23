# Architecture

Aura Engine is designed as a small, connectable ambience brain.

It should work in three modes:

1. **Embedded library**: imported directly by a TypeScript or JavaScript app.
2. **HTTP service**: consumed by any language through JSON.
3. **Client renderer**: browser/mobile layer that receives ambience decisions and renders sound.

## Principle

The core does not need to know the whole conversation.

A host system can send symbolic signals only:

```json
{
  "mode": "text_conversation",
  "topic": "law tutoring",
  "emotionalTone": "focused",
  "intensity": 0.7,
  "silenceDurationMs": 3000,
  "userTypingSpeed": "medium"
}
```

Aura Engine returns an ambience decision:

```json
{
  "protocol": "aura.v1",
  "soundscape": "soft_focus_current",
  "volume": 0.28,
  "baseFrequency": 236.8,
  "modulationRate": 0.24,
  "textureAmount": 0.58,
  "pulseAmount": 0.31,
  "transitionMs": 1800
}
```

The host decides how to render it.

## Layers

### Core

Pure TypeScript logic.

- receives signal
- normalizes state
- maps state to ambience decision
- has no dependency on browser or server

### Server

Small HTTP adapter.

- exposes `/health`
- exposes `/decide`
- exposes `/update`
- exposes `/state`
- exposes `/reset`

### Web audio layer

Browser renderer using Web Audio API.

- oscillator drone
- low-frequency modulation
- procedural noise texture
- smooth transitions

### Future AI agent

The dedicated ambience AI should not be required for the protocol to work.

It can be added as an optional layer:

```txt
host app -> symbolic signal -> ambience AI -> aura decision -> renderer
```

or:

```txt
host app -> raw context -> ambience AI -> symbolic signal -> aura core -> renderer
```

## Integration with existing systems

For a system like a tutoring platform, the recommended architecture is:

```txt
Tutoria backend/frontend
  -> extracts symbolic conversation signals
  -> sends POST /decide to Aura Engine
  -> receives ambience decision
  -> frontend applies soundscape through browser/mobile renderer
```

This keeps the product decoupled.

Aura Engine can run as:

- a sidecar service
- a small Node process
- a library inside the frontend
- a future Docker container
- a remote ambience API

## Privacy stance

Default integration should avoid sending full user messages.

Use symbolic signals whenever possible.
