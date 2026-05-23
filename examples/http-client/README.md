# HTTP client examples

Aura Engine can be plugged into any system through HTTP.

Run the server:

```bash
npm install
npm run server
```

Then call:

```txt
POST http://localhost:8787/decide
```

## cURL

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

## JavaScript / TypeScript

```ts
const response = await fetch("http://localhost:8787/decide", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    mode: "text_conversation",
    topic: "philosophy",
    emotionalTone: "lonely_reflective",
    intensity: 0.72,
    silenceDurationMs: 8500,
    userTypingSpeed: "slow",
    agentName: "Tutor"
  })
});

const ambience = await response.json();
console.log(ambience);
```

## Python

```python
import json
import urllib.request

payload = json.dumps({
    "mode": "study_session",
    "topic": "medical tutoring",
    "emotionalTone": "focused",
    "intensity": 0.64,
    "silenceDurationMs": 4200,
    "userTypingSpeed": "medium",
    "agentName": "Tutoria"
}).encode("utf-8")

request = urllib.request.Request(
    "http://localhost:8787/decide",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)

with urllib.request.urlopen(request) as response:
    ambience = json.loads(response.read().decode("utf-8"))
    print(ambience)
```

## PHP

```php
<?php
$payload = json_encode([
  "mode" => "text_conversation",
  "topic" => "support chat",
  "emotionalTone" => "calm",
  "intensity" => 0.4,
  "silenceDurationMs" => 2000,
  "userTypingSpeed" => "slow",
  "agentName" => "SupportAgent"
]);

$options = [
  "http" => [
    "header" => "Content-Type: application/json",
    "method" => "POST",
    "content" => $payload
  ]
];

$context = stream_context_create($options);
$result = file_get_contents("http://localhost:8787/decide", false, $context);

echo $result;
```

## Kotlin

```kotlin
// Any HTTP client works. The important part is the JSON contract.
// Send POST /decide with the symbolic ambience signal.
```

## Integration rule

Do not send private user messages unless your product explicitly needs that.

Prefer sending symbolic signals:

- topic
- tone
- intensity
- mode
- silence duration
- typing speed

Aura Engine should be easy to connect, safe to isolate and simple to replace.
