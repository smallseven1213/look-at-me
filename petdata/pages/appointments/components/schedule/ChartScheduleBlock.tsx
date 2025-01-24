import React from "react";
import { ScheduleDay, ScheduleWork } from "../../../../types/schedule";
import { AppointmentDetail } from "../../../../types/appointment";
import { ChartScheduleWorkBlock } from "./ChartScheduleWorkBlock";

interface ChartScheduleBlockProps {
  schedule: ScheduleDay;
  appointments: AppointmentDetail[];
  onAppointmentClick: (appointment: AppointmentDetail) => void;
}

export const ChartScheduleBlock: React.FC<ChartScheduleBlockProps> = ({
  schedule,
  appointments,
  onAppointmentClick,
}) => {
  const works = schedule.works || [];
  const totalWidth = works.length > 0 ? 100 / works.length : 100;

  return (
    <div className="relative h-full">
      {works.map((work: ScheduleWork, index: number) => (
        <div
          key={work.id}
          className="absolute top-0 bottom-0 rounded-lg"
          style={{
            left: `calc(${index * totalWidth}% + ${index * 10}px)`,
            width: `calc(${totalWidth}% - ${
              ((works.length - 1) * 10) / works.length
            }px)`,
          }}
        >
          <ChartScheduleWorkBlock
            name={work.name}
            workId={work.id ?? ""}
            left="0"
            width="100%"
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            scheduleStartTime={schedule.section.startTime}
            scheduleEndTime={schedule.section.endTime}
          />
        </div>
      ))}
    </div>
  );
};
