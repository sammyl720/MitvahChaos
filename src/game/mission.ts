import type { Level } from './model';

export interface MissionState {
  collected: boolean[];
  carried: number;
  deposited: number;
}

export function missionItems(level: Level): { x: number; y: number }[] {
  if (!level.mission) return [];
  return level.mission.kind === 'tzedakah' ? level.mission.coins : level.mission.items;
}

export function startMission(level: Level): MissionState {
  return { collected: missionItems(level).map(() => false), carried: 0, deposited: 0 };
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
  return !level.mission || state.deposited >= missionItems(level).length;
}
