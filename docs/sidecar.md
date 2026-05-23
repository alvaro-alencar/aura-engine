# Sidecar integration

Aura Engine can run beside any existing system as a small ambience sidecar.

This means the host app does not need to import Aura Engine internals.

It only sends symbolic state to the sidecar and receives an ambience decision.

## Why sidecar?

A sidecar keeps Aura Engine:

- language-agnostic
- easy to replace
- easy to deploy
- safer for privacy
- independent from the host app release cycle

## Docker Compose

```bash
docker compose up --build
```

The API will be available at:

```txt
http://localhost:8787
```

## Example with an existing tutoring system

```txt
Tutoria frontend/backend
  -> computes symbolic context
  -> POST http://aura-engine:8787/decide
  -> receives ambience decision
  -> browser/mobile client renders soundscape
```

## Minimal payload

```json
{
  "mode": "study_session",
  "topic": "lesson explanation",
  "emotionalTone": "focused",
  "intensity": 0.55
}
```

## Privacy-first pattern

Do not send raw messages by default.

Prefer symbolic ambience signals.

The host app may derive these signals locally using its own rules, model, classifier or agent.

## Deployment shape

```txt
[Host App] ---- HTTP JSON ----> [Aura Engine]
     |                              |
     |                              v
     |                       ambience decision
     v                              |
[Browser/Mobile Renderer] <---------
```

## Future extension

A future version can expose WebSocket or Server-Sent Events for continuous ambience streaming.
