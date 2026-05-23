# Soundscape Registry

The Soundscape Registry is Aura Engine's sonic vocabulary.

It defines the available ambience presets, their meaning, rendering strategy and recommended usage.

## Why this exists

A decision like this is useful:

```json
{
  "soundscape": "soft_focus_current",
  "volume": 0.21,
  "baseFrequency": 232.5
}
```

But renderers need more context.

The registry gives every soundscape a stable identity:

- name
- description
- energy level
- textures
- render strategy
- tags
- recommended use cases
- avoid rules

## API

### List all soundscapes

```txt
GET /soundscapes
```

### Filter by tag

```txt
GET /soundscapes?tag=focus
```

### Get one soundscape

```txt
GET /soundscapes/soft_focus_current
```

## SDK

```ts
const all = await aura.soundscapes();
const focus = await aura.soundscapes("focus");
const preset = await aura.soundscape("soft_focus_current");
```

## Decision metadata

Ambience decisions may include `soundscapeMeta`:

```json
{
  "soundscape": "soft_focus_current",
  "soundscapeMeta": {
    "name": "Soft Focus Current",
    "description": "A stable current for studying, coding and concentrated reasoning.",
    "energy": "medium",
    "textures": ["clean", "pulsed"],
    "renderStrategy": "procedural_drone",
    "tags": ["focus", "study", "coding", "clarity"]
  }
}
```

This allows renderers to adapt without hardcoding every soundscape ID.

## Render strategies

### procedural_drone

Continuous generated tone or layered drone.

### procedural_particles

Small synthetic particles, motes, bells or randomized grains.

### procedural_pulse

Controlled rhythmic pulse.

### sample_loop

Pre-recorded loop managed by host renderer.

### external_renderer

A third-party or custom audio engine decides how to interpret the preset.

## Design rule

The registry is descriptive, not coercive.

A renderer may interpret presets creatively, but should preserve the emotional safety constraints.
