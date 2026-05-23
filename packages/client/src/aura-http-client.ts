import type { AmbienceDecision, AuraSignal, AuraState } from "../../core/src";

export interface AuraHttpClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  eventSourceFactory?: (url: string) => EventSource;
}

export interface AuraUpdateResponse {
  state: AuraState;
  decision: AmbienceDecision;
}

export interface AuraHealthResponse {
  ok: boolean;
  protocol: "aura.v1";
  streaming?: boolean;
}

export type AuraStreamEventType = "aura.update" | "aura.reset" | "aura.heartbeat";

export interface AuraStreamEvent {
  protocol: "aura.v1";
  type: AuraStreamEventType;
  state?: AuraState;
  decision?: AmbienceDecision;
  timestamp: number;
}

export interface AuraSubscription {
  close(): void;
}

export interface AuraSubscribeOptions {
  onEvent(event: AuraStreamEvent): void;
  onError?(event: Event): void;
}

export class AuraHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly eventSourceFactory?: (url: string) => EventSource;

  constructor(options: AuraHttpClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:8787").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.eventSourceFactory = options.eventSourceFactory;
  }

  async health(): Promise<AuraHealthResponse> {
    return this.request<AuraHealthResponse>("/health", { method: "GET" });
  }

  async state(): Promise<AuraState> {
    return this.request<AuraState>("/state", { method: "GET" });
  }

  async decide(signal: AuraSignal): Promise<AmbienceDecision> {
    return this.request<AmbienceDecision>("/decide", {
      method: "POST",
      body: JSON.stringify(signal)
    });
  }

  async update(signal: AuraSignal): Promise<AuraUpdateResponse> {
    return this.request<AuraUpdateResponse>("/update", {
      method: "POST",
      body: JSON.stringify(signal)
    });
  }

  async reset(): Promise<{ ok: boolean; state: AuraState }> {
    return this.request<{ ok: boolean; state: AuraState }>("/reset", { method: "POST" });
  }

  subscribe(options: AuraSubscribeOptions): AuraSubscription {
    const factory = this.eventSourceFactory ?? ((url: string) => new EventSource(url));
    const source = factory(`${this.baseUrl}/events`);

    const handleMessage = (event: MessageEvent<string>) => {
      options.onEvent(JSON.parse(event.data) as AuraStreamEvent);
    };

    source.addEventListener("aura.update", handleMessage as EventListener);
    source.addEventListener("aura.reset", handleMessage as EventListener);
    source.addEventListener("aura.heartbeat", handleMessage as EventListener);

    if (options.onError) {
      source.addEventListener("error", options.onError);
    }

    return {
      close() {
        source.close();
      }
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Aura Engine request failed: ${response.status} ${message}`);
    }

    return response.json() as Promise<T>;
  }
}

export function createAuraHttpClient(options?: AuraHttpClientOptions): AuraHttpClient {
  return new AuraHttpClient(options);
}
