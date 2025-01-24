import React from "react";
import { ScheduleDay } from "../../../types/schedule";
import { formatTime } from "../../../utils/time";

export interface ScheduleItemProps {
  schedule: ScheduleDay;
  date: string;
  index: number;
  colorClasses: string;
  onSelect: (schedule: ScheduleDay, date: string) => void;
}

export const ScheduleItem: React.FC<ScheduleItemProps> = ({
  schedule,
  date,
  index,
  colorClasses,
  onSelect,
}) => {
  return (
    <div
      data-schedule-item
      data-schedule-index={index}
      className="w-full mb-2 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(schedule, date);
      }}
    >
      {/* 標題區塊 */}
      <div className={`px-3 py-2 ${colorClasses}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">{schedule.section.name}</span>
          <span className="text-xs opacity-75">
            {formatTime(schedule.section.startTime)} -{" "}
            {formatTime(schedule.section.endTime)}
          </span>
        </div>
      </div>

      {/* 工作列表區塊 */}
      <div className="px-3 py-2 space-y-1.5">
        {schedule.works.map((work, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-primary-400 font-medium">{work.name}</span>
            </div>
            <span className="text-primary-500">
              {work.doctor?.name || "未指派"}
            </span>
          </div>
        ))}
      </div>

      {/* 底部邊框 */}
      <div className={`h-1 ${colorClasses}`} />
    </div>
  );
};
