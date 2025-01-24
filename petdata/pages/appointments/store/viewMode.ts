import dayjs, { Dayjs } from 'dayjs'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ViewMode = 'day' | 'week' | 'month'
type WeekViewMode = 'timeline' | 'list'

interface ViewModeState {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  weekViewMode: WeekViewMode
  setWeekViewMode: (mode: WeekViewMode) => void
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set, get) => ({
      viewMode: "week",
      setViewMode: (nextMode) => {
        const { viewMode: prevMode, selectedDate } = get();
        let newDate = selectedDate;

        // 根據前一個模式 + 下一個模式，決定是否要對 selectedDate 做 startOf('week')
        if (prevMode === "day" && nextMode === "week") {
          // 從「單日」切到「週」，將日期轉成該日所在週的開頭
          newDate = newDate.startOf("week");
        }
        // 如果是從「週」切到「日」，理論上 selectedDate 已經是該週開頭，
        // 所以維持即可（或你想要「週的第一天」就固定顯示，那就不動即可）

        set({
          viewMode: nextMode,
          selectedDate: newDate,
        });
      },

      // 原本的 weekViewMode
      weekViewMode: "list",
      setWeekViewMode: (mode) => set({ weekViewMode: mode }),

      // 新增：全域的 selectedDate
      selectedDate: dayjs(), // 預設今天
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    {
      name: 'appointment-view-mode',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state, error) => {
        if (state && !error) {
          // (注意) 這裡的 state 不是 proxy，直接改值不會觸發 setState，
          // 但夠用來修正初始化資料
          if (state.selectedDate) {
            state.selectedDate = dayjs(state.selectedDate);
          }
        }
      },
    }
  )
)
