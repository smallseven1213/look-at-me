import { GripVertical } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Button from "../../components/Button";
import { useHospitalScheduleTemplate } from "../../hooks/useHospitalScheduleTemplate";
import { useUserStore } from "../../hooks/useUserStore";
import { updateHospitalWeeklySchedule } from "../../services/hospitalScheduleService";
import { ScheduleDay, ScheduleWork } from "../../types/schedule";
import ShiftDrawer from "./clinic-hours/ShiftDrawer";

const MAX_MINUTES = 24 * 60 - 1; // 1439
const MAX_END_MINUTES = MAX_MINUTES; // 1439 分钟，即 23:59
const MIN_DURATION = 120; // 最小持续时间为 120 分钟，即 2 小时

interface TimeBlock {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const transformToScheduleDay = (
  dayOfWeek: number,
  timeBlocks: TimeBlock[]
): ScheduleDay => {
  return {
    dayOfWeek,
    section: {
      name: "全天",
      startTime: "00:00",
      endTime: "23:59",
    },
    works: timeBlocks.map((block) => ({
      name: block.name,
      doctor: {
        name: "", // 這裡可以根據需求設定預設值
        specialties: [],
      },
    })),
  };
};

// 时间转换工具函数
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  return Math.min(totalMinutes, MAX_MINUTES); // 限制在 1439 分钟以内
};

const minutesToTime = (minutes: number): string => {
  minutes = Math.min(minutes, MAX_MINUTES); // 限制分钟数在 1439 以内
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

// 计算时间位置的工具函数
const calculateTimeFromPosition = (
  clientX: number,
  barRect: DOMRect
): string => {
  const relativeX = clientX - barRect.left;
  const percentage = relativeX / barRect.width;
  const totalMinutes = percentage * 24 * 60;
  const roundedMinutes = Math.round(totalMinutes / 10) * 10; // 10 分钟为增量
  const clampedMinutes = Math.min(Math.max(0, roundedMinutes), MAX_MINUTES);
  return minutesToTime(clampedMinutes);
};

// 单日时间轴组件
const DayScheduleBar: React.FC<{
  dayOfWeek: number;
  timeBlocks: TimeBlock[];
  onTimeBlocksChange: (blocks: TimeBlock[]) => void;
  canCopyPrevious: boolean;
  previousDayBlocks?: TimeBlock[];
}> = ({
  dayOfWeek,
  timeBlocks,
  onTimeBlocksChange,
  canCopyPrevious,
  previousDayBlocks,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);
  const [dragState, setDragState] = useState<{
    active: boolean;
    blockId: string | null;
    type: "start" | "end" | "move" | null;
    initialX: number;
    initialStartTime?: string;
    initialEndTime?: string;
  }>({
    active: false,
    blockId: null,
    type: null,
    initialX: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.active || !dragState.blockId || !barRef.current) return;

      const barRect = barRef.current.getBoundingClientRect();
      const currentBlock = timeBlocks.find(
        (block) => block.id === dragState.blockId
      );
      if (!currentBlock) return;

      const currentX = e.clientX;
      const deltaX = currentX - dragState.initialX;
      const deltaMinutes =
        Math.round(((deltaX / barRect.width) * 24 * 60) / 10) * 10; // 10 分钟为增量

      const newBlocks = timeBlocks.map((block) => {
        if (block.id !== dragState.blockId) return block;

        let newStartTime = block.startTime;
        let newEndTime = block.endTime;

        if (dragState.type === "move") {
          // 移动整个区块
          const blockDuration =
            timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
          let newStartMinutes =
            timeToMinutes(dragState.initialStartTime!) + deltaMinutes;

          // 确保不超出边界
          newStartMinutes = Math.max(0, newStartMinutes);
          let newEndMinutes = newStartMinutes + blockDuration;

          if (newEndMinutes > MAX_END_MINUTES) {
            newEndMinutes = MAX_END_MINUTES;
            newStartMinutes = newEndMinutes - blockDuration;
          }

          newStartTime = minutesToTime(newStartMinutes);
          newEndTime = minutesToTime(newEndMinutes);
        } else if (dragState.type === "end") {
          // 调整结束时间
          let newTime = calculateTimeFromPosition(currentX, barRect);
          let newEndMinutes = timeToMinutes(newTime);

          // 确保结束时间不超过 MAX_END_MINUTES
          newEndMinutes = Math.min(newEndMinutes, MAX_END_MINUTES);

          // 确保持续时间不少于 2 小时
          const minEndMinutes = timeToMinutes(block.startTime) + MIN_DURATION;
          newEndMinutes = Math.max(newEndMinutes, minEndMinutes);

          newEndTime = minutesToTime(newEndMinutes);
        } else if (dragState.type === "start") {
          // 调整开始时间
          let newTime = calculateTimeFromPosition(currentX, barRect);
          let newStartMinutes = timeToMinutes(newTime);

          // 确保开始时间不小于 0
          newStartMinutes = Math.max(0, newStartMinutes);

          // 确保持续时间不少于 2 小时
          const maxStartMinutes = timeToMinutes(block.endTime) - MIN_DURATION;
          newStartMinutes = Math.min(newStartMinutes, maxStartMinutes);

          newStartTime = minutesToTime(newStartMinutes);
        }

        newStartTime = minutesToTime(timeToMinutes(newStartTime));
        newEndTime = minutesToTime(timeToMinutes(newEndTime));

        return { ...block, startTime: newStartTime, endTime: newEndTime };
      });

      // 检查是否与其他区块重叠
      const currentNewBlock = newBlocks.find(
        (block) => block.id === dragState.blockId
      );
      const hasOverlap = newBlocks.some((block) => {
        if (block.id === dragState.blockId) return false;
        return (
          timeToMinutes(currentNewBlock!.startTime) <
            timeToMinutes(block.endTime) &&
          timeToMinutes(currentNewBlock!.endTime) >
            timeToMinutes(block.startTime)
        );
      });

      if (!hasOverlap) {
        onTimeBlocksChange(newBlocks);
      }
    };

    const handleMouseUp = () => {
      setJustFinishedDragging(true);
      setDragState({
        active: false,
        blockId: null,
        type: null,
        initialX: 0,
      });

      // 延迟重置 justFinishedDragging 状态
      setTimeout(() => {
        setJustFinishedDragging(false);
      }, 100);
    };

    if (dragState.active) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, timeBlocks, onTimeBlocksChange]);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.active || justFinishedDragging) return;

    const barRect = e.currentTarget.getBoundingClientRect();
    const newTime = calculateTimeFromPosition(e.clientX, barRect);

    const startMinutes = timeToMinutes(newTime);
    const minEndMinutes = startMinutes + MIN_DURATION;
    const endMinutes = Math.min(minEndMinutes, MAX_END_MINUTES);

    // 如果无法创建至少 2 小时的班次，则不创建
    if (endMinutes - startMinutes < MIN_DURATION) {
      return;
    }

    const endTime = minutesToTime(endMinutes);

    // 检查是否与现有区段重叠
    const hasOverlap = timeBlocks.some((block) => {
      return (
        startMinutes < timeToMinutes(block.endTime) &&
        endMinutes > timeToMinutes(block.startTime)
      );
    });

    if (!hasOverlap) {
      const newBlock: TimeBlock = {
        id: Math.random().toString(36).substr(2, 9),
        name: `班次${timeBlocks.length + 1}`,
        startTime: newTime,
        endTime,
      };
      onTimeBlocksChange([...timeBlocks, newBlock]);
    }
  };

  const handleDragStart = (
    e: React.MouseEvent,
    blockId: string,
    type: "start" | "end" | "move"
  ) => {
    e.stopPropagation();
    const block = timeBlocks.find((b) => b.id === blockId);
    if (!block) return;

    setDragState({
      active: true,
      blockId,
      type,
      initialX: e.clientX,
      initialStartTime: block.startTime,
      initialEndTime: block.endTime,
    });
  };

  const handleCopyPrevious = () => {
    if (previousDayBlocks && previousDayBlocks.length > 0) {
      const copiedBlocks = previousDayBlocks.map((block) => ({
        ...block,
        id: Math.random().toString(36).substr(2, 9),
      }));
      onTimeBlocksChange(copiedBlocks);
    }
  };

  const handleBlockClick = (block: any) => {
    if (justFinishedDragging) return; // 防止拖动后立即打开 Drawer
    setSelectedBlock(block);
    setShowDrawer(true);
  };

  const handleSaveBlock = (updatedBlock: TimeBlock) => {
    const newBlocks = timeBlocks.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    onTimeBlocksChange(newBlocks);
  };

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = timeBlocks.filter((block) => block.id !== blockId);
    onTimeBlocksChange(newBlocks);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <span className="font-medium w-16">
          {["週日", "週一", "週二", "週三", "週四", "週五", "週六"][dayOfWeek]}
        </span>
        {canCopyPrevious &&
          previousDayBlocks &&
          previousDayBlocks.length > 0 && (
            <button
              onClick={handleCopyPrevious}
              className="px-2 py-1 text-xs text-secondary-red border border-secondary-red rounded hover:bg-secondary-red/10"
            >
              複製前一日時間
            </button>
          )}
      </div>
      <div
        ref={barRef}
        className="relative flex-1 h-20 bg-primary-100 rounded-lg overflow-visible"
        onClick={handleBarClick}
      >
        {timeBlocks.map((block) => {
          const startPercent = Math.max(
            0,
            Math.min(100, (timeToMinutes(block.startTime) / MAX_MINUTES) * 100)
          );
          const endPercent = Math.max(
            0,
            Math.min(100, (timeToMinutes(block.endTime) / MAX_MINUTES) * 100)
          );
          const width = endPercent - startPercent;

          return (
            <div
              key={block.id}
              className="absolute h-16 top-2 bg-secondary-orange rounded-lg group overflow-hidden"
              style={{
                left: `${startPercent}%`,
                width: `${width}%`,
              }}
              onClick={() => handleBlockClick(block)}
            >
              {/* 添加拖动图标 */}
              <div
                className="absolute right-2 top-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleDragStart(e, block.id, "move")}
              >
                <GripVertical className="w-4 h-4 text-true-white" />
              </div>

              {/* 左边调整手柄 */}
              <div
                className={`absolute -left-1 top-2 bottom-2 w-2 cursor-ew-resize transition-opacity ${
                  dragState.active &&
                  dragState.blockId === block.id &&
                  dragState.type === "start"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
                onMouseDown={(e) => handleDragStart(e, block.id, "start")}
              >
                <div className="w-full h-full bg-true-white rounded-full" />
              </div>

              {/* 内容区域 */}
              <div className="w-full h-full flex flex-col items-center justify-center select-none">
                <div className="text-true-white text-center text-xs whitespace-nowrap overflow-hidden">
                  {block.name}
                </div>
                <div className="text-xs text-true-white">
                  {block.startTime}-{block.endTime}
                </div>
              </div>

              {/* 右边调整手柄 */}
              <div
                className={`absolute -right-1 top-2 bottom-2 w-2 cursor-ew-resize transition-opacity ${
                  dragState.active &&
                  dragState.blockId === block.id &&
                  dragState.type === "end"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
                onMouseDown={(e) => handleDragStart(e, block.id, "end")}
              >
                <div className="w-full h-full bg-true-white rounded-full" />
              </div>
            </div>
          );
        })}
        {timeBlocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-secondary-gray">
            休診日 <span className="text-xs ml-4">(或點擊新增班次)</span>
          </div>
        )}
      </div>
      <ShiftDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        shiftData={selectedBlock}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
      />
    </div>
  );
};

// 主要排班表组件
const HospitalSchedule: React.FC = () => {
  const hospitalId = "mock-hospital-id";
  const { user } = useUserStore();
  const {
    template: apiScheduleData,
    isLoading,
    error,
    refresh,
  } = useHospitalScheduleTemplate(hospitalId);

  const [scheduleData, setScheduleData] = useState(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      timeBlocks: [] as TimeBlock[],
      section: {
        name: "全天",
        startTime: "00:00",
        endTime: "23:59",
      },
      works: [] as ScheduleWork[],
    }))
  );

  const handleTimeBlocksChange = (dayOfWeek: number, blocks: TimeBlock[]) => {
    setScheduleData((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, timeBlocks: blocks } : day
      )
    );
  };

  useEffect(() => {
    if (apiScheduleData && apiScheduleData.length > 0) {
      const transformedData = apiScheduleData.map((day) => ({
        ...day,
        dayOfWeek: day.dayOfWeek ?? 0, // Ensure dayOfWeek is always a number
        timeBlocks: day.works.map((work: { name: any }, index: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: work.name,
          startTime: day.section.startTime,
          endTime: day.section.endTime,
        })),
      }));
      setScheduleData(transformedData);
    }
  }, [apiScheduleData]);

  const handleSave = async () => {
    try {
      const transformedSchedules: ScheduleDay[] = scheduleData.map((day) =>
        transformToScheduleDay(day.dayOfWeek, day.timeBlocks)
      );

      await updateHospitalWeeklySchedule(
        hospitalId,
        transformedSchedules,
        user?.token
      );
      await refresh();

      alert("排班表已儲存");
    } catch (error) {
      console.error("儲存失敗:", error);
      alert("儲存失敗，請稍後再試");
    }
  };

  // if (isLoading) {
  //   return <div className="p-6">載入中...</div>;
  // }

  // if (isError) {
  //   return <div className="p-6 text-red-500">載入失敗，請重新整理頁面</div>;
  // }

  return (
    <div className="p-6 space-y-6 relative">
      <div className="text-sm text-secondary-gray">
        *此為常態時間設定，如有特殊時間需求，可至排表修改
      </div>

      <div className="space-y-4">
        {scheduleData.map((day, index) => (
          <DayScheduleBar
            key={day.dayOfWeek}
            dayOfWeek={day.dayOfWeek}
            timeBlocks={day.timeBlocks}
            onTimeBlocksChange={(blocks) =>
              handleTimeBlocksChange(day.dayOfWeek, blocks)
            }
            canCopyPrevious={index > 0}
            previousDayBlocks={
              index > 0 ? scheduleData[index - 1].timeBlocks : undefined
            }
          />
        ))}
      </div>
      <div className="sticky bottom-5 flex justify-end pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <Button variant="primary" onClick={handleSave} className="mr-6">
          儲存排班表
        </Button>
      </div>
    </div>
  );
};

export default HospitalSchedule;
