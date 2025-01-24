import React from "react";
import { Clock, BedDouble } from "lucide-react";
import { DAYS_OF_WEEK } from "../../../hooks/useHospital";

interface DailyScheduleInfoProps {
  closeDays: number[];
}

const formatWeekDay = (label: string) => {
  return label.replace("週", "星期");
};

const DailyScheduleInfo: React.FC<DailyScheduleInfoProps> = ({ closeDays }) => {
  return (
    <div className="bg-white px-6 py-4">
      <h3 className="text-subtitle font-medium text-primary-400 mb-4">
        每日看診資訊
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map(({ value, label }) => {
          const isClosed = closeDays.includes(value);
          return (
            <div
              key={value}
              className={`
                relative flex flex-col items-center py-3
                h-20 w-20
                transition-colors duration-200 rounded-md
                ${
                  isClosed
                    ? "bg-primary-100"
                    : "bg-white border border-primary-100"
                }
              `}
            >
              <span className="text-body2 font-medium mb-3 text-primary-400">
                {formatWeekDay(label)}
              </span>
              {isClosed ? (
                <BedDouble
                  className="w-5 h-5 text-primary-300"
                  strokeWidth={1.5}
                />
              ) : (
                <Clock className="w-5 h-5 text-primary-400" strokeWidth={1.5} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyScheduleInfo;
