import type { Level } from './model';

export interface MissionState {
  collected: boolean[];
  served: boolean[];
  carried: number;
  deposited: number;
}

export function missionItems(level: Level): { x: number; y: number }[] {
  if (!level.mission) return [];
  if (level.mission.kind === 'tzedakah') return level.mission.coins;
  return level.mission.kind === 'delivery' || level.mission.kind === 'deliveries' ? level.mission.items : [];
}

export function missionGoalCount(level: Level): number {
  return level.mission?.kind === 'neighbors' || level.mission?.kind === 'deliveries' ? level.mission.people.length : missionItems(level).length;
}

export function startMission(level: Level): MissionState {
  return { collected: Array(missionItems(level).length || missionGoalCount(level)).fill(false), served: Array(level.mission?.kind === 'deliveries' ? level.mission.people.length : 0).fill(false), carried: 0, deposited: 0 };
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

export function assemblePart(state: MissionState): MissionState {
  if (!state.carried) return state;
  return { ...state, deposited: state.deposited + 1, carried: state.carried - 1 };
}

export function deliverGift(state: MissionState, person: number): MissionState {
  if (!state.carried || person < 0 || person >= state.served.length || state.served[person]) return state;
  const served = [...state.served]; served[person] = true;
  return { ...state, served, carried: state.carried - 1, deposited: state.deposited + 1 };
}

export function spillSupplies(state: MissionState): MissionState {
  if (!state.carried || state.deposited) return state;
  return { collected: state.collected.map(() => false), served: [...state.served], carried: 0, deposited: 0 };
}

export function helpNeighbor(state: MissionState, index: number, handoff?: { from: number; to: number }): MissionState {
  if (index < 0 || index >= state.collected.length || state.collected[index]) return state;
  if (handoff?.to === index && !state.carried) return state;
  const collected = [...state.collected];
  collected[index] = true;
  const carried = state.carried + Number(handoff?.from === index) - Number(handoff?.to === index);
  return { ...state, collected, carried, deposited: state.deposited + 1 };
}

export function missionComplete(level: Level, state: MissionState): boolean {
  return !level.mission || state.deposited >= missionGoalCount(level);
}
