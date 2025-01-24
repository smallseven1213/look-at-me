import React from "react";
import { ScheduleDay } from "../../../types/schedule";

interface ScheduleTooltipProps {
  schedule: ScheduleDay;
  colorClasses: string;
}

const formatTime = (time: string) => {
  if (!time) return "";
  const timeMatch = time.match(/^(\d{2}):(\d{2})/);
  if (!timeMatch) return "";
  return `${timeMatch[1]}:${timeMatch[2]}`;
};

const ScheduleTooltip: React.FC<ScheduleTooltipProps> = ({
  schedule,
  colorClasses,
}) => (
  <div className="p-3 rounded-lg bg-white shadow-lg max-w-xs">
    <div
      className={`inline-block px-2 py-1 rounded ${colorClasses} text-sm font-medium mb-2`}
    >
      {schedule.section.name}
    </div>
    <div className="text-sm text-gray-600">
      {formatTime(schedule.section.startTime)} -{" "}
      {formatTime(schedule.section.endTime)}
    </div>
    <div className="mt-2 space-y-1">
      {schedule.works.map((work, idx) => (
        <div key={idx} className="text-sm">
          <span className="text-gray-500">{work.name}:</span>{" "}
          <span className="text-gray-700">{work.doctor?.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ScheduleTooltip;
