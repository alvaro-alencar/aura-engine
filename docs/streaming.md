# Streaming ambience

Aura Engine supports Server-Sent Events through:

```txt
GET /events
```

This lets a client keep a live connection open and receive ambience updates whenever the host system sends new signals.

## Why SSE first?

SSE is simple, HTTP-native and easy to plug into browsers.

It is ideal for one-way ambience updates:

```txt
Aura Engine -> client renderer
```

For bidirectional real-time control, a future version may add WebSocket.

## Events

### aura.update

Emitted after:

```txt
POST /update
```

Payload:

```json
{
  "protocol": "aura.v1",
  "type": "aura.update",
  "state": {},
  "decision": {},
  "timestamp": 1770000000000
}
```

### aura.reset

Emitted after:

```txt
POST /reset
```

### aura.heartbeat

Emitted every 30 seconds so clients know the connection is alive.

## Browser usage

```ts
const events = new EventSource("http://localhost:8787/events");

events.addEventListener("aura.update", (event) => {
  const payload = JSON.parse(event.data);
  console.log(payload.decision);
});

events.addEventListener("aura.heartbeat", (event) => {
  console.log("Aura heartbeat", JSON.parse(event.data));
});
```

## SDK usage

```ts
import { createAuraHttpClient } from "./packages/client/src";

const aura = createAuraHttpClient({ baseUrl: "http://localhost:8787" });

const subscription = aura.subscribe({
  onEvent(event) {
    if (event.decision) {
      console.log("Apply ambience", event.decision);
    }
  }
});

// later
subscription.close();
```

## Recommended integration

A host app can send updates whenever the conversation context changes:

```txt
User types -> host app derives symbolic signal -> POST /update -> Aura broadcasts aura.update -> renderer changes ambience
```

This pattern avoids polling and keeps ambience responsive.
