import { create } from 'zustand'

interface PetCardState {
  selectedIds: { [key: string]: boolean }
  selectedCount: number
  setSelected: (ids: string[]) => void
  clearSelected: () => void
  toggleSelected: (id: string, checked: boolean) => void
  isSelected: (id: string) => boolean
  toggleSelectAll: (ids: string[], checked: boolean) => void
}

export const usePetCardStore = create<PetCardState>((set, get) => ({
  selectedIds: {},
  selectedCount: 0,
  setSelected: (ids: string[]) => {
    const newSelectedIds: { [key: string]: boolean } = {};
    ids.forEach(id => {
      newSelectedIds[id] = true;
    });
    set({
      selectedIds: newSelectedIds,
      selectedCount: ids.length
    });
  },
  clearSelected: () => set({ selectedIds: {}, selectedCount: 0 }),
  toggleSelected: (id: string, checked: boolean) => {
    set(state => {
      const newSelectedIds = { ...state.selectedIds };
      if (checked) {
        newSelectedIds[id] = true;
      } else {
        delete newSelectedIds[id];
      }
      return {
        selectedIds: newSelectedIds,
        selectedCount: Object.keys(newSelectedIds).length
      };
    });
  },
  isSelected: (id: string) => {
    return !!get().selectedIds[id];
  },
  toggleSelectAll: (ids: string[], checked: boolean) => {
    const newSelectedIds = { ...get().selectedIds };
    ids.forEach(id => {
      if (checked) {
        newSelectedIds[id] = true;
      } else {
        delete newSelectedIds[id];
      }
    });
    set({
      selectedIds: newSelectedIds,
      selectedCount: Object.keys(newSelectedIds).length
    });
  }
}));