import type { AmbienceDecision, AuraSignal, AuraState } from "./ambience-state";
import { DEFAULT_AURA_STATE, normalizeSignal } from "./ambience-state";
import { mapStateToAmbience } from "./mood-mapper";

export interface AuraEngine {
  getState(): AuraState;
  update(signal: AuraSignal): AmbienceDecision;
  decide(signal: AuraSignal): AmbienceDecision;
  reset(): void;
}

export function createAuraEngine(initialState: Partial<AuraState> = {}): AuraEngine {
  let state: AuraState = {
    ...DEFAULT_AURA_STATE,
    ...initialState,
    metadata: {
      ...DEFAULT_AURA_STATE.metadata,
      ...(initialState.metadata ?? {})
    }
  };

  return {
    getState() {
      return state;
    },

    update(signal: AuraSignal) {
      state = normalizeSignal(signal, state);
      return mapStateToAmbience(state);
    },

    decide(signal: AuraSignal) {
      return mapStateToAmbience(normalizeSignal(signal, state));
    },

    reset() {
      state = { ...DEFAULT_AURA_STATE, updatedAt: Date.now(), metadata: {} };
    }
  };
}
