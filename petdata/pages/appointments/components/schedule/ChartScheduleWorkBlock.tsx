import React from "react";
import { AppointmentDetail } from "../../../../types/appointment";
import { AppointmentItem } from "../AppointmentItem";

interface ChartScheduleWorkBlockProps {
  name: string;
  workId: string;
  left: string;
  width: string;
  appointments: AppointmentDetail[];
  onAppointmentClick: (appointment: AppointmentDetail) => void;
  scheduleStartTime: string;
  scheduleEndTime: string;
}

export const ChartScheduleWorkBlock: React.FC<ChartScheduleWorkBlockProps> = ({
  name,
  workId,
  left,
  width,
  appointments,
  onAppointmentClick,
  scheduleStartTime,
  scheduleEndTime,
}) => {
  const workAppointments = appointments.filter(
    (appointment) => appointment.workId === workId
  );

  console.log("workAppointments", workId, appointments, workAppointments);

  // Convert schedule time to minutes for positioning
  const scheduleStartMinutes =
    parseInt(scheduleStartTime.split(":")[0]) * 60 +
    parseInt(scheduleStartTime.split(":")[1]);
  const scheduleEndMinutes =
    parseInt(scheduleEndTime.split(":")[0]) * 60 +
    parseInt(scheduleEndTime.split(":")[1]);
  const scheduleDuration = scheduleEndMinutes - scheduleStartMinutes;

  return (
    <div className="absolute top-0 bottom-0 bg-gray-50" style={{ left, width }}>
      <div className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 border-b">
        {name}
      </div>
      <div className="relative h-[calc(100%-28px)]">
        {workAppointments.map((appointment) => {
          // Calculate appointment position
          const appointmentTime = appointment.appointmentStartTime.split(":");
          const appointmentMinutes =
            parseInt(appointmentTime[0]) * 60 + parseInt(appointmentTime[1]);
          const relativePosition = appointmentMinutes - scheduleStartMinutes;
          const positionPercentage =
            (relativePosition / scheduleDuration) * 100;

          return (
            <div
              key={appointment.id}
              className="absolute left-0 right-0"
              style={{ top: `${positionPercentage}%` }}
            >
              <AppointmentItem
                appointment={appointment}
                onClick={() => onAppointmentClick(appointment)}
                scheduleStartTime={scheduleStartTime}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
