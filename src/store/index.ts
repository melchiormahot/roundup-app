import { create } from 'zustand';

interface AppState {
  // User
  userId: string | null;
  userName: string | null;
  userLevel: number;
  jurisdiction: string;
  incomeBracket: number;

  // Simulation
  isSimulating: boolean;
  simulationDate: string;

  // UI
  showWarmGlow: boolean;
  warmGlowMessage: string;
  warmGlowColor: string;

  // Notifications
  unreadCount: number;

  // Actions
  setUser: (user: {
    id: string;
    name: string;
    level: number;
    jurisdiction: string;
    incomeBracket: number;
  }) => void;
  clearUser: () => void;
  setSimulating: (isSimulating: boolean) => void;
  setSimulationDate: (date: string) => void;
  triggerWarmGlow: (message: string, color?: string) => void;
  dismissWarmGlow: () => void;
  setUnreadCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User defaults
  userId: null,
  userName: null,
  userLevel: 1,
  jurisdiction: 'FR',
  incomeBracket: 0,

  // Simulation defaults
  isSimulating: false,
  simulationDate: '',

  // UI defaults
  showWarmGlow: false,
  warmGlowMessage: '',
  warmGlowColor: 'var(--accent-green)',

  // Notifications
  unreadCount: 0,

  // Actions
  setUser: (user) =>
    set({
      userId: user.id,
      userName: user.name,
      userLevel: user.level,
      jurisdiction: user.jurisdiction,
      incomeBracket: user.incomeBracket,
    }),

  clearUser: () =>
    set({
      userId: null,
      userName: null,
      userLevel: 1,
      jurisdiction: 'FR',
      incomeBracket: 0,
    }),

  setSimulating: (isSimulating) => set({ isSimulating }),

  setSimulationDate: (date) => set({ simulationDate: date }),

  triggerWarmGlow: (message, color) =>
    set({
      showWarmGlow: true,
      warmGlowMessage: message,
      warmGlowColor: color ?? 'var(--accent-green)',
    }),

  dismissWarmGlow: () =>
    set({
      showWarmGlow: false,
      warmGlowMessage: '',
    }),

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
