# Web Audio Renderer

Aura Engine includes a browser renderer powered by the Web Audio API.

The renderer reads `AmbienceDecision` and interprets the `soundscapeMeta.renderStrategy` field.

## Strategies

### procedural_drone

A continuous oscillator-based drone with low-frequency modulation.

Best for:

- quiet presence
- reflection
- calm states
- mystical or philosophical ambience

### procedural_particles

Short synthetic tones spawned periodically as particles.

Best for:

- curiosity
- creative sparks
- playful interfaces
- light exploratory states

### procedural_pulse

A low controlled pulse with tremolo.

Best for:

- urgency awareness
- error states
- critical debugging

This strategy should remain subtle. It must acknowledge tension without amplifying panic.

### sample_loop

Reserved for future renderers that use pre-recorded loops.

### external_renderer

Reserved for host apps that want to map Aura decisions into their own audio engine.

## Internal voices

The current renderer uses four internal voices:

```txt
Drone voice     -> continuous tonal field
Noise voice     -> procedural texture
Pulse voice     -> tremolo-based pulse
Particle voice  -> small randomized tones
```

A decision can activate one strategy while still leaving a quiet background layer from other voices.

## User gesture requirement

Browsers require user interaction before audio can start.

Call:

```ts
await audio.start();
```

from a button click or similar user event.

## Example

```ts
import { createAuraEngine } from "../../packages/core/src";
import { createAuraAudioLayer } from "../../packages/web/src/audio-layer";

const aura = createAuraEngine();
const audio = createAuraAudioLayer();

await audio.start();

const decision = aura.update({
  emotionalTone: "curious",
  intensity: 0.6
});

audio.apply(decision);
```

## Design rule

The renderer should never fight the user's cognition.

The ambience must remain low, soft and optional.

Always provide mute/stop controls in real products.
