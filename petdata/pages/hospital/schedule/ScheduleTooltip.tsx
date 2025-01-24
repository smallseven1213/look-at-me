import React from "react";
import { ScheduleDay } from "../../../types/schedule";
import { formatTime } from "../../../utils/time";

export interface ScheduleTooltipProps {
  schedule: ScheduleDay;
  colorClasses: string;
}

export const ScheduleTooltip: React.FC<ScheduleTooltipProps> = ({
  schedule,
  colorClasses,
}) => {
  return (
    <div className="p-3 rounded-lg bg-true-white shadow-custom max-w-xs">
      <div
        className={`inline-block px-2 py-1 rounded ${colorClasses} text-subtitle mb-2`}
      >
        {schedule.section.name}
      </div>
      <div className="text-body2 text-primary-400">
        {formatTime(schedule.section.startTime)} -{" "}
        {formatTime(schedule.section.endTime)}
      </div>
      <div className="mt-2 space-y-1">
        {schedule.works.map((work, idx) => (
          <div key={idx} className="text-body2">
            <span className="text-primary-300">{work.name}:</span>{" "}
            <span className="text-primary-400">{work.doctor?.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
