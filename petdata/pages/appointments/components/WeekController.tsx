import React from "react";
import { Dayjs } from "dayjs";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WeekControllerProps {
  selectedWeek: Dayjs;
  onWeekChange: (week: Dayjs) => void;
}

const WeekController: React.FC<WeekControllerProps> = ({
  selectedWeek,
  onWeekChange,
}) => {
  const weekStart = selectedWeek.startOf("week");
  const weekEnd = selectedWeek.endOf("week");

  return (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={() => onWeekChange(selectedWeek.subtract(1, "week"))}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="text-xl font-medium text-gray-800">
        {weekStart.format("YYYY年MM月DD日")} - {weekEnd.format("MM月DD日")}
      </div>
      <button
        onClick={() => onWeekChange(selectedWeek.add(1, "week"))}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default WeekController;
