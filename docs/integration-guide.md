# Practical integration guide

This guide shows how to plug Aura Engine into an existing app.

## 1. Run Aura Engine

### Local development

```bash
npm install
npm run server
```

### Docker

```bash
docker compose up --build
```

## 2. Send symbolic context

Your app should convert its current interaction state into a compact symbolic signal.

```json
{
  "mode": "text_conversation",
  "topic": "onboarding",
  "emotionalTone": "curious",
  "intensity": 0.48,
  "silenceDurationMs": 1800,
  "userTypingSpeed": "medium",
  "agentName": "ProductAssistant"
}
```

## 3. Receive ambience decision

```json
{
  "protocol": "aura.v1",
  "soundscape": "curiosity_particles",
  "volume": 0.23,
  "baseFrequency": 305.52,
  "modulationRate": 0.174,
  "textureAmount": 0.43,
  "pulseAmount": 0.216,
  "transitionMs": 1800,
  "explanation": "Mapped curious tone in text_conversation mode to curiosity_particles with intensity 0.48."
}
```

## 4. Render the decision

Your app may render the decision using:

- Aura Web Audio renderer
- native mobile audio engine
- game audio engine
- pre-recorded loops
- procedural synthesis
- external music/soundscape system

The protocol intentionally does not force a single rendering strategy.

## 5. Suggested host-side mapper

If your app does not have an emotion classifier yet, begin with deterministic rules:

```txt
User is idle for more than 8 seconds -> increase silenceDurationMs
User types fast -> userTypingSpeed = fast
Lesson screen -> mode = study_session
Support screen -> mode = text_conversation
Code editor screen -> mode = coding_session
Positive reaction -> emotionalTone = excited or curious
Error/friction -> emotionalTone = tense
Long reflective prompt -> emotionalTone = lonely_reflective or mystical
```

## 6. Integration with an LLM

An LLM can produce symbolic signals instead of sound directly.

Recommended output schema:

```json
{
  "emotionalTone": "focused",
  "intensity": 0.61,
  "topic": "legal reasoning",
  "reason": "The user is asking for concentrated analytical support."
}
```

Then send that signal to Aura Engine.

## 7. Do not overdo it

Aura should not dominate the user.

Recommended default volume: low.

Recommended UX: always include a mute button.

Recommended ethics: do not use ambience to manipulate purchasing decisions, fear or dependency.

## 8. Citation

If Aura Engine inspires your project, cite:

**Álvaro Alencar — Aura Engine: responsive ambience engine for AI interfaces.**
