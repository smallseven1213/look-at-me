import React, { useEffect, useMemo, useRef } from "react";
import { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../types/appointment";
import { useHospitalStore } from "../../../stores/hospitalStore";
import { useAppointments } from "../../../hooks/useAppointments";
import { AppointmentSearchKeyString } from "../../../types/appointment";
import { AppointmentItemV2 } from "./AppointmentItemV2";
import { useWorksStore } from "../store/worksStore";

interface DayScheduleChartProps {
  selectedDay: Dayjs;
  searchConditions?: any;
  onAppointmentClick: (appointment: AppointmentDetail) => void;
}

// Generate time slots for 24 hours
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0");
    slots.push(`${hour}:00`);
  }
  return slots;
};

const DayScheduleChart: React.FC<DayScheduleChartProps> = ({
  selectedDay,
  searchConditions,
  onAppointmentClick,
}) => {
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { setWorkNames, currentWorkName } = useWorksStore();

  const dateSearches = [
    {
      searchKey: AppointmentSearchKeyString.StartTime,
      searchValue: selectedDay.startOf("day").format("YYYY-MM-DD HH:mm"),
    },
    {
      searchKey: AppointmentSearchKeyString.EndTime,
      searchValue: selectedDay.endOf("day").format("YYYY-MM-DD HH:mm"),
    },
  ];

  const { appointments } = useAppointments({
    searches: [
      {
        searchKey: AppointmentSearchKeyString.HospitalId,
        searchValue: hospitalId!,
      },
      ...dateSearches,
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

  // 使用 useMemo 優化 workNames 的計算
  const uniqueWorkNames = useMemo(() => {
    if (!appointments) return [];
    return Array.from(
      new Set(appointments.map((appointment) => appointment.workName))
    ).sort();
  }, [appointments]);

  // 只在 appointments 改變時更新 workNames
  useEffect(() => {
    if (appointments) {
      const newWorkNames = Array.from(
        new Set(appointments.map((appointment) => appointment.workName))
      ).sort();

      // 比較新舊值，只有在真正改變時才更新
      const currentWorkNames = useWorksStore.getState().workNames;
      if (JSON.stringify(currentWorkNames) !== JSON.stringify(newWorkNames)) {
        setWorkNames(newWorkNames);
      }
    }
  }, [appointments]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Add auto-scroll effect when date changes
  useEffect(() => {
    if (containerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const scrollToMinutes = Math.max(
        0,
        (currentHour - 2) * 60 + currentMinute
      );
      containerRef.current.scrollTop = scrollToMinutes;
    }
  }, [selectedDay]);

  if (!appointments) {
    return null;
  }

  // 根據 currentWorkName 過濾預約
  const filteredAppointments = currentWorkName
    ? appointments.filter(
        (appointment) => appointment.workName === currentWorkName
      )
    : appointments;

  const timeSlots = generateTimeSlots();

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto pt-5">
      {/* Time axis background */}
      <div className="absolute left-0 right-0 bottom-0 top-5 pointer-events-none pt-4">
        <div className="w-full h-full grid grid-cols-1 divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="h-[60px] relative">
              <div className="absolute left-4 top-0 -translate-y-1/2 text-sm text-gray-400">
                {time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule content */}
      <div className="relative h-full pl-[60px] pt-4">
        <div className="relative h-full pr-4">
          {/* Appointments */}
          {(() => {
            // Group appointments by workId
            const groupedAppointments = filteredAppointments.reduce(
              (acc, appointment) => {
                const workId = appointment.workId;
                if (!acc[workId]) {
                  acc[workId] = [];
                }
                acc[workId].push(appointment);
                return acc;
              },
              {} as { [key: string]: AppointmentDetail[] }
            );

            // Convert to array and sort by workId to maintain consistent ordering
            const workGroups = Object.entries(groupedAppointments);

            return workGroups
              .map(([workId, groupAppointments], groupIndex) => {
                const left = groupIndex * 130; // 每組間隔 130px

                return groupAppointments.map((appointment) => {
                  const [startHours, startMinutes] =
                    appointment.appointmentStartTime.split(":").map(Number);
                  const [endHours, endMinutes] = appointment.appointmentEndTime
                    .split(":")
                    .map(Number);
                  const startTime = startHours * 60 + startMinutes;
                  const endTime = endHours * 60 + endMinutes;
                  const top = startTime;
                  const height = endTime - startTime;

                  return (
                    <div className="w-40">
                      <AppointmentItemV2
                        key={appointment.id}
                        appointment={appointment}
                        top={top}
                        height={height}
                        onClick={onAppointmentClick}
                        left={left}
                      />
                    </div>
                  );
                });
              })
              .flat();
          })()}
        </div>
      </div>
    </div>
  );
};

export default DayScheduleChart;
