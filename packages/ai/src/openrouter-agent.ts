import { AMBIENCE_AGENT_SYSTEM_PROMPT } from "./prompt";
import type { AmbienceAgentResult, AmbienceContextInput } from "./ambience-agent";
import type { AuraSignal } from "../../core/src";

export interface OpenRouterAgentOptions {
  apiKey: string;
  model?: string;
  siteUrl?: string;
  appName?: string;
  fetchImpl?: typeof fetch;
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export function createOpenRouterAmbienceAgent(options: OpenRouterAgentOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const model = options.model ?? "openai/gpt-4o-mini";

  return {
    async inferSignal(input: AmbienceContextInput): Promise<AmbienceAgentResult> {
      const response = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${options.apiKey}`,
          ...(options.siteUrl ? { "HTTP-Referer": options.siteUrl } : {}),
          ...(options.appName ? { "X-Title": options.appName } : {})
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: AMBIENCE_AGENT_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: JSON.stringify({
                instruction: "Infer a privacy-preserving AuraSignal from this interaction context. Return JSON only.",
                context: input
              })
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`OpenRouter request failed: ${response.status} ${message}`);
      }

      const data = (await response.json()) as OpenRouterChatResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("OpenRouter response did not include message content.");
      }

      const signal = sanitizeSignal(JSON.parse(content) as AuraSignal);

      return {
        signal,
        confidence: 0.82,
        reasons: ["LLM OpenRouter classified the ambience state from interaction context."]
      };
    }
  };
}

function sanitizeSignal(signal: AuraSignal): AuraSignal {
  return {
    mode: signal.mode ?? "text_conversation",
    topic: typeof signal.topic === "string" ? signal.topic.slice(0, 80) : "general conversation",
    emotionalTone: signal.emotionalTone ?? "neutral",
    intensity: clamp01(Number(signal.intensity ?? 0.35)),
    silenceDurationMs: Math.max(0, Number(signal.silenceDurationMs ?? 0)),
    userTypingSpeed: signal.userTypingSpeed ?? "idle",
    agentName: "OpenRouterAuraAgent",
    metadata: {
      provider: "openrouter",
      ...(typeof signal.metadata?.reason === "string" ? { reason: signal.metadata.reason.slice(0, 240) } : {}),
      safety: "privacy-preserving symbolic signal only"
    }
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0.35;
  return Math.max(0, Math.min(1, value));
}
