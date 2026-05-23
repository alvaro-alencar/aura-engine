# Ambience Agent

The Ambience Agent converts context into symbolic ambience signals.

It is the bridge between messy human interaction and the clean Aura Protocol.

## Why this exists

Host apps should not be forced to understand sound design.

They should be able to say:

```json
{
  "text": "I feel alone writing to this AI in silence.",
  "silenceDurationMs": 9000,
  "userTypingSpeed": "slow"
}
```

And receive:

```json
{
  "signal": {
    "mode": "text_conversation",
    "topic": "general conversation",
    "emotionalTone": "lonely_reflective",
    "intensity": 0.52,
    "silenceDurationMs": 9000,
    "userTypingSpeed": "slow",
    "agentName": "AuraAgent"
  },
  "confidence": 0.64,
  "reasons": ["Detected sad tone from keyword cues."],
  "decision": {}
}
```

## Endpoints

### Infer only

```txt
POST /infer
```

Returns symbolic signal and ambience decision without changing the server state.

### Infer and update

```txt
POST /infer-update
```

Infers symbolic signal, updates Aura state and broadcasts `aura.update` to connected SSE clients.

## Rule-based first

The first Ambience Agent is intentionally rule-based.

This keeps Aura Engine:

- offline-capable
- inspectable
- cheap to run
- safe by default
- usable without API keys

## Future LLM mode

A future LLM-based agent may produce the same `AuraSignal` schema.

The protocol should remain stable.

Suggested LLM task:

```txt
Given the user interaction context, produce a privacy-preserving AuraSignal.
Do not generate sound. Do not manipulate emotion. Only classify ambience state.
```

## Ethical constraint

The agent must not be used to intensify fear, dependency, compulsion or purchasing pressure.

Aura is atmosphere, not emotional coercion.
