import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../../types/appointment";
import { useHospitalStore } from "../../../../stores/hospitalStore";
import { useHospital } from "../../../../hooks/useHospital";
import { useAppointments } from "../../../../hooks/useAppointments";
import { useHospitalSchedule } from "../../../../hooks/useHospitalSchedule";
import { DayController } from "../DayController";
import { useViewModeStore } from "../../store/viewMode";
import DayScheduleChart from "../DayScheduleChart";

interface DayViewProps {
  searchConditions?: any;
  onAppointmentClick: (appointment: AppointmentDetail) => void;
}

const DayView: React.FC<DayViewProps> = ({
  searchConditions,
  onAppointmentClick,
}) => {
  const { selectedDate, setSelectedDate } = useViewModeStore();
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { hospital, isClosedOn } = useHospital(hospitalId || "");
  const dayOfWeek = selectedDate.day();
  const isClosedDay = isClosedOn(dayOfWeek);

  return (
    <div className="h-full">
      <DayController selectedDay={selectedDate} onDayChange={setSelectedDate} />
      <div className="h-[calc(100%-4rem)]">
        {isClosedDay ? (
          <div className="flex-1 flex items-center justify-center text-xl text-gray-500">
            休診日
          </div>
        ) : (
          <DayScheduleChart
            selectedDay={selectedDate}
            searchConditions={searchConditions}
            onAppointmentClick={onAppointmentClick}
          />
        )}
      </div>
    </div>
  );
};

export default DayView;
