import React from "react";
import { AppointmentDetail } from "../../../types/appointment";
import { getTimePosition, getBlockHeight } from "../utils/timeUtils";

interface AppointmentItemProps {
  appointment: AppointmentDetail;
  onClick: () => void;
  scheduleStartTime: string;
}

export const AppointmentItem: React.FC<AppointmentItemProps> = ({
  appointment,
  onClick,
  scheduleStartTime,
}) => {
  const startTime = appointment.sectionStartTime.slice(0, 5);
  const endTime = appointment.sectionEndTime.slice(0, 5);

  return (
    <div
      onClick={onClick}
      className="absolute w-[calc(100%-8px)] left-1 px-2 py-1 bg-blue-500 text-white text-xs rounded cursor-pointer hover:bg-blue-600"
      style={{
        top: getTimePosition(appointment.sectionStartTime, scheduleStartTime),
        height: getBlockHeight(
          appointment.sectionStartTime,
          appointment.sectionEndTime
        ),
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium flex items-center gap-1">
            {appointment.ownerName} - {appointment.petName}
            {appointment.updateTime === null && (
              <span className="bg-red-400 text-white px-1.5 py-0.5 rounded text-[10px]">
                未確認
              </span>
            )}
          </div>
          <div className="text-blue-100">
            {startTime}-{endTime} | {appointment.doctorName}
          </div>
        </div>
      </div>
    </div>
  );
};
