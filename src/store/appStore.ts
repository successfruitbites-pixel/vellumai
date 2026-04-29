import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  name: string;
  email: string | null;
  avatar: string | null;
}

export interface RecentFile {
  id?: string;
  name: string;
  type: string;
  size: string;
  tool: string;
  timestamp: number;
  dataUrl?: string;
}

interface AppState {
  darkMode: boolean;
  isPro: boolean;
  user: User | null;
  recentFiles: RecentFile[];
  dailyTaskCount: number;
  lastTaskDate: string;
  MAX_FREE_TASKS: number;
  
  toggleDarkMode: () => void;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  addRecentFile: (file: RecentFile) => void;
  removeRecentFile: (id: string) => void;
  clearRecentFiles: () => void;
  checkTaskLimit: () => { allowed: boolean; remaining: number };
  incrementTaskCount: () => void;
  upgradeToPro: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      isPro: false,
      user: { name: 'Emmanuel', email: null, avatar: null }, // Demo user
      recentFiles: [
        { id: '1', name: 'Q3_Financial_Report.pdf', tool: 'Merge PDF', size: '2.4 MB', type: 'application/pdf', timestamp: Date.now() - 3600000 },
        { id: '2', name: 'Profile_Picture.png', tool: 'BG Removal', size: '1.1 MB', type: 'image/png', timestamp: Date.now() - 86400000 },
        { id: '3', name: 'Contract_Draft.pdf', tool: 'Compress PDF', size: '450 KB', type: 'application/pdf', timestamp: Date.now() - 172800000 }
      ],
      dailyTaskCount: 0,
      lastTaskDate: new Date().toDateString(),
      MAX_FREE_TASKS: 5,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      addRecentFile: (file) => set((state) => {
        const fileWithId = { ...file, id: file.id || Date.now().toString() + Math.random().toString() };
        const newFiles = [fileWithId, ...state.recentFiles].slice(0, 10);
        return { recentFiles: newFiles };
      }),
      removeRecentFile: (id) => set((state) => ({
        recentFiles: state.recentFiles.filter(f => f.id !== id)
      })),
      clearRecentFiles: () => set({ recentFiles: [] }),
      checkTaskLimit: () => {
        const state = get();
        if (state.isPro) return { allowed: true, remaining: Infinity };
        
        const today = new Date().toDateString();
        if (state.lastTaskDate !== today) {
          set({ dailyTaskCount: 0, lastTaskDate: today });
          return { allowed: true, remaining: state.MAX_FREE_TASKS };
        }
        
        const remaining = Math.max(0, state.MAX_FREE_TASKS - state.dailyTaskCount);
        return { allowed: remaining > 0, remaining };
      },
      incrementTaskCount: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastTaskDate !== today) {
          set({ dailyTaskCount: 1, lastTaskDate: today });
        } else {
          set({ dailyTaskCount: state.dailyTaskCount + 1 });
        }
      },
      upgradeToPro: () => set({ isPro: true }),
    }),
    {
      name: 'vellum-storage',
    }
  )
);
