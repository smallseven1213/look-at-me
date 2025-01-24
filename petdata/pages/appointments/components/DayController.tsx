import React from 'react';
import { Dayjs } from 'dayjs';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DayControllerProps {
  selectedDay: Dayjs;
  onDayChange: (day: Dayjs) => void;
}

export const DayController: React.FC<DayControllerProps> = ({ selectedDay, onDayChange }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => onDayChange(selectedDay.subtract(1, "day"))}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="text-xl font-medium text-gray-800">
        {selectedDay.format("YYYY年MM月DD日")}
      </div>
      <button
        onClick={() => onDayChange(selectedDay.add(1, "day"))}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
