import React from "react";
import { Clock, Users } from "lucide-react";
import { ScheduleDay } from "../../../types/schedule";

interface ScheduleCardProps {
  schedule: ScheduleDay;
  onClick?: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onClick }) => {
  const formatTime = (time?: string) => {
    if (!time) return "00:00";
    const [hours, minutes] = time.split(":");
    return `${hours?.padStart(2, "0") || "00"}:${
      minutes?.padStart(2, "0") || "00"
    }`;
  };

  return (
    <div
      onClick={onClick}
      className="group w-full bg-true-white rounded-lg p-4 cursor-pointer 
                 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-100 
                 hover:border-primary-300 relative overflow-hidden"
    >
      {/* 裝飾性背景元素 */}
      <div
        className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-full 
                    transform translate-x-12 -translate-y-12 
                    group-hover:bg-primary-200 transition-colors duration-200 opacity-10"
      />

      {/* 內容區塊 */}
      <div className="relative z-10 space-y-3">
        {/* 班次名稱與時間 */}
        <div className="flex items-center justify-between">
          <h3
            className="text-primary-400 font-medium group-hover:text-primary-500 
                        transition-colors duration-200"
          >
            {schedule.section.name || "未命名班次"}
          </h3>
          <div
            className="flex items-center text-gray-500 group-hover:text-primary-400 
                         transition-colors duration-200"
          >
            <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="text-sm">
              {formatTime(schedule.section.startTime)} -{" "}
              {formatTime(schedule.section.endTime)}
            </span>
          </div>
        </div>

        {/* 診間與醫生列表 */}
        <div className="space-y-2">
          {schedule.works.map((work, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-md 
                         bg-gray-50 group-hover:bg-primary-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-primary-400">
                  {work.name || "未設定診間"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {work.doctor?.name || "未指派醫師"}
                </span>
              </div>
            </div>
          ))}
          {schedule.works.length === 0 && (
            <div className="text-center py-2 text-gray-400 text-sm">
              尚未設定診間
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
