import { create } from "zustand";

interface WorksState {
  workNames: string[];
  currentWorkName: string | null;
  setWorkNames: (workNames: string[]) => void;
  setCurrentWorkName: (workName: string | null) => void;
}

export const useWorksStore = create<WorksState>((set) => ({
  workNames: [],
  currentWorkName: null,
  setWorkNames: (workNames) => set({ workNames }),
  setCurrentWorkName: (workName) => set({ currentWorkName: workName }),
}));
