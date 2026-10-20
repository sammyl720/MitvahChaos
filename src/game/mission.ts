import type { Level } from './model';

export interface MissionState {
  collected: boolean[];
  carried: number;
  deposited: number;
}

export function missionItems(level: Level): { x: number; y: number }[] {
  if (!level.mission) return [];
  if (level.mission.kind === 'tzedakah') return level.mission.coins;
  return level.mission.kind === 'delivery' ? level.mission.items : [];
}

export function missionGoalCount(level: Level): number {
  return level.mission?.kind === 'neighbors' ? level.mission.people.length : missionItems(level).length;
}

export function startMission(level: Level): MissionState {
  return { collected: Array(missionGoalCount(level)).fill(false), carried: 0, deposited: 0 };
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

export function spillSupplies(state: MissionState): MissionState {
  if (!state.carried || state.deposited) return state;
  return { collected: state.collected.map(() => false), carried: 0, deposited: 0 };
}

export function helpNeighbor(state: MissionState, index: number): MissionState {
  if (index < 0 || index >= state.collected.length || state.collected[index]) return state;
  const collected = [...state.collected];
  collected[index] = true;
  return { ...state, collected, deposited: state.deposited + 1 };
}

export function missionComplete(level: Level, state: MissionState): boolean {
  return !level.mission || state.deposited >= missionGoalCount(level);
}
