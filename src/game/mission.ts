import type { Level } from './model';

export interface MissionState {
  collected: boolean[];
  carried: number;
  deposited: number;
}

export function startMission(level: Level): MissionState {
  return { collected: level.mission?.coins.map(() => false) ?? [], carried: 0, deposited: 0 };
}

export function collectCoin(state: MissionState, index: number): MissionState {
  if (index < 0 || index >= state.collected.length || state.collected[index]) return state;
  const collected = [...state.collected];
  collected[index] = true;
  return { ...state, collected, carried: state.carried + 1 };
}

export function depositCoins(state: MissionState): MissionState {
  if (!state.carried) return state;
  return { ...state, deposited: state.deposited + state.carried, carried: 0 };
}

export function missionComplete(level: Level, state: MissionState): boolean {
  return !level.mission || state.deposited >= level.mission.coins.length;
}
