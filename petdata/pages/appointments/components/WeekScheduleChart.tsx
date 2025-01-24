import React, { useEffect, useMemo } from "react";
import { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../types/appointment";
import { useHospitalStore } from "../../../stores/hospitalStore";
import { useAppointments } from "../../../hooks/useAppointments";
import { AppointmentSearchKeyString } from "../../../types/appointment";
import { useWorksStore } from "../store/worksStore";
import { useViewModeStore } from "../store/viewMode";
import { WeekScheduleChartTimeLine } from "./WeekScheduleChartTimeLine";
import { WeekScheduleChartList } from "./WeekScheduleChartList";
import { LayoutList, Clock } from "lucide-react";

interface WeekScheduleChartProps {
  selectedWeek: Dayjs;
  searchConditions?: any;
  onAppointmentClick: (appointment: AppointmentDetail) => void;
  isClosedOn: (dayOfWeek: number) => boolean;
}

const WeekScheduleChart: React.FC<WeekScheduleChartProps> = ({
  selectedWeek,
  searchConditions,
  onAppointmentClick,
  isClosedOn,
}) => {
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { setWorkNames, workNames: currentWorkNames } = useWorksStore();
  const { weekViewMode, setWeekViewMode } = useViewModeStore();

  const { appointments } = useAppointments({
    searches: [
      {
        searchKey: AppointmentSearchKeyString.HospitalId,
        searchValue: hospitalId!,
      },
      {
        searchKey: AppointmentSearchKeyString.StartTime,
        searchValue: selectedWeek
          .startOf("week")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm"),
      },
      {
        searchKey: AppointmentSearchKeyString.EndTime,
        searchValue: selectedWeek
          .endOf("week")
          .endOf("day")
          .format("YYYY-MM-DD HH:mm"),
      },
      ...(searchConditions?.OwnerName
        ? [
            {
              searchKey: AppointmentSearchKeyString.OwnerName,
              searchValue: searchConditions.OwnerName,
            },
          ]
        : []),
      ...(searchConditions?.OwnerPhoneNo
        ? [
            {
              searchKey: AppointmentSearchKeyString.OwnerPhoneNo,
              searchValue: searchConditions.OwnerPhoneNo,
            },
          ]
        : []),
      ...(searchConditions?.OwnerEmail
        ? [
            {
              searchKey: AppointmentSearchKeyString.OwnerEmail,
              searchValue: searchConditions.OwnerEmail,
            },
          ]
        : []),
      ...(searchConditions?.DoctorName
        ? [
            {
              searchKey: AppointmentSearchKeyString.DoctorName,
              searchValue: searchConditions.DoctorName,
            },
          ]
        : []),
    ],
  });

  // Memoize weekDays to prevent unnecessary recalculations
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        selectedWeek.startOf("week").add(i, "day")
      ),
    [selectedWeek]
  );

  // Memoize workNames calculation
  const newWorkNames = useMemo(() => {
    if (!appointments) return [];
    return Array.from(
      new Set(appointments.map((appointment) => appointment.workName))
    ).sort();
  }, [appointments]);

  // Only update workNames if they've actually changed
  useEffect(() => {
    if (
      JSON.stringify(newWorkNames) !== JSON.stringify(currentWorkNames) &&
      newWorkNames.length > 0
    ) {
      setWorkNames(newWorkNames);
    }
  }, [newWorkNames, currentWorkNames, setWorkNames]);

  if (!appointments) {
    return null;
  }

  return (
    <>
      {/* View Mode Switch */}

      <div className="relative h-full overflow-y-auto pt-1">
        {/* Schedule View */}
        {weekViewMode === "timeline" ? (
          <WeekScheduleChartTimeLine
            weekDays={weekDays}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            isClosedOn={isClosedOn}
          />
        ) : (
          <WeekScheduleChartList
            weekDays={weekDays}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            isClosedOn={isClosedOn}
          />
        )}
      </div>
    </>
  );
};

export default WeekScheduleChart;
