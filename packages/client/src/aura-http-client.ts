import type { AmbienceDecision, AuraSignal, AuraState } from "../../core/src";

export interface AuraHttpClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface AuraUpdateResponse {
  state: AuraState;
  decision: AmbienceDecision;
}

export interface AuraHealthResponse {
  ok: boolean;
  protocol: "aura.v1";
}

export class AuraHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AuraHttpClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:8787").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
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
