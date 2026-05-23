# Aura Protocol v1

Aura Engine is designed to be connectable from any system, written in any language.

The stable boundary is not TypeScript.

The stable boundary is JSON over HTTP.

## Author

Original concept by **Álvaro Alencar**.

Use freely. Cite the origin.

## Base URL

When running locally:

```txt
http://localhost:8787
```

## Health check

```http
GET /health
```

Response:

```json
{
  "ok": true,
  "protocol": "aura.v1"
}
```

## Decide ambience without mutating state

```http
POST /decide
Content-Type: application/json
```

Request:

```json
{
  "mode": "text_conversation",
  "topic": "philosophy",
  "emotionalTone": "lonely_reflective",
  "intensity": 0.72,
  "silenceDurationMs": 8500,
  "userTypingSpeed": "slow",
  "agentName": "Tutor",
  "metadata": {
    "userId": "anonymous-user",
    "screen": "chat"
  }
}
```

Response:

```json
{
  "protocol": "aura.v1",
  "soundscape": "deep_room_low_warm_drone",
  "volume": 0.32,
  "baseFrequency": 127.28,
  "modulationRate": 0.235,
  "textureAmount": 0.69,
  "pulseAmount": 0.324,
  "transitionMs": 4200,
  "explanation": "Mapped lonely_reflective tone in text_conversation mode to deep_room_low_warm_drone with intensity 0.72."
}
```

## Update state and decide ambience

```http
POST /update
Content-Type: application/json
```

Same request body as `/decide`.

Response:

```json
{
  "state": {},
  "decision": {}
}
```

## Current state

```http
GET /state
```

## Reset state

```http
POST /reset
```

## Integration idea

Any external app can periodically send conversational context to Aura Engine.

The app does not need to expose private messages. It can send only symbolic signals:

```json
{
  "emotionalTone": "focused",
  "intensity": 0.6,
  "silenceDurationMs": 3000,
  "topic": "study"
}
```

This keeps the integration lightweight, language-agnostic and privacy-aware.

## Supported enums

### mode

- `text_conversation`
- `voice_conversation`
- `coding_session`
- `study_session`
- `creative_session`
- `meditation`
- `unknown`

### emotionalTone

- `neutral`
- `lonely_reflective`
- `focused`
- `curious`
- `excited`
- `tense`
- `sad`
- `calm`
- `playful`
- `mystical`

### userTypingSpeed

- `idle`
- `slow`
- `medium`
- `fast`
