import React, { useEffect, useRef } from "react";
import { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../types/appointment";
import { useHospitalStore } from "../../../stores/hospitalStore";
import { useAppointments } from "../../../hooks/useAppointments";
import { AppointmentSearchKeyString } from "../../../types/appointment";
import { AppointmentItemV2 } from "./AppointmentItemV2";
import { useWorksStore } from "../store/worksStore";

interface WeekScheduleChartProps {
  selectedWeek: Dayjs;
  searchConditions?: any;
  onAppointmentClick: (appointment: AppointmentDetail) => void;
  isClosedOn: (dayOfWeek: number) => boolean;
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

const WeekScheduleChart: React.FC<WeekScheduleChartProps> = ({
  selectedWeek,
  searchConditions,
  onAppointmentClick,
  isClosedOn,
}) => {
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    selectedWeek.startOf("week").add(i, "day")
  );

  const timeSlots = generateTimeSlots();
  const containerRef = useRef<HTMLDivElement>(null);
  const dayColumnsRef = useRef<(HTMLDivElement | null)[]>([]);

  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { setWorkNames, currentWorkName } = useWorksStore();

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

  // 同步 workNames
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

  // 自動捲到「現在時間 - 2 小時」
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
  }, [selectedWeek]);

  if (!appointments) {
    return null;
  }

  // 根據 currentWorkName 過濾預約
  const filteredAppointments = currentWorkName
    ? appointments.filter((appt) => appt.workName === currentWorkName)
    : appointments;

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {/* ------------- Header (日期列) ------------- */}
      <div className="sticky top-0 z-10 grid grid-cols-[60px_repeat(7,1fr)] bg-white border-b">
        {/* 左邊 60px 欄留白(或想放其他標題都可以) */}
        <div className="text-center text-sm font-medium text-gray-600 py-1">
          {/* 這裡也可以放個 "Time" 標題 */}
        </div>
        {/* 右邊 7 欄：星期幾 */}
        {weekDays.map((day) => (
          <div
            key={day.format("YYYY-MM-DD")}
            className="text-center text-sm font-medium text-gray-600 py-1 border-l"
          >
            {day.format("MM/DD")} ({day.format("ddd")})
          </div>
        ))}
      </div>

      {/* ------------- 主要內容: 左邊時間軸 + 右邊七天欄位 ------------- */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
        {/* ------ (1) 左邊: 時間軸 ------ */}
        <div className="relative border-r border-gray-200">
          {/* 背景 (顯示24小時刻度) */}
          <div className="pointer-events-none">
            {timeSlots.map((time, idx) => (
              <div key={time} className="h-[60px] relative">
                {/* 顯示小時文字，例如 01:00 */}
                <div className="absolute right-1 top-0 -translate-y-1/2 text-xs text-gray-400">
                  {time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------ (2) 右邊: 7 天欄位 ------ */}
        <div className="col-span-7 relative">
          {/* 時間軸背景線：放在絕對定位層 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-rows-[repeat(24,60px)] border-b border-gray-200">
              {/* 每小時一條水平線 */}
              {[...Array(24)].map((_, idx) => (
                <div key={idx} className="border-t border-gray-200" />
              ))}
            </div>
          </div>

          {/* 7 個 day column，使用 grid 或 flex 都可以 */}
          <div className="grid grid-cols-7 h-full relative">
            {weekDays.map((day, dayIndex) => {
              const dayOfWeek = day.day();
              const isClosedDay = isClosedOn(dayOfWeek);
              const dateStr = day.format("YYYY-MM-DD");

              // 過濾當天預約，並按 workId 分組
              const dayAppointments = filteredAppointments.filter(
                (appointment) => appointment.date === dateStr
              );
              const groupedAppointments = dayAppointments.reduce<{
                [key: string]: AppointmentDetail[];
              }>((acc, appointment) => {
                const { workId } = appointment;
                if (!acc[workId]) acc[workId] = [];
                acc[workId].push(appointment);
                return acc;
              }, {});

              const workGroups = Object.entries(groupedAppointments);

              return (
                <div
                  key={day.format("YYYY-MM-DD")}
                  className="relative min-h-[1440px] border-l first:border-l-0"
                  ref={(el) => (dayColumnsRef.current[dayIndex] = el)}
                >
                  {isClosedDay ? (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-gray-50/50">
                      休診日
                    </div>
                  ) : (
                    <div className="relative h-full">
                      {workGroups.map(
                        ([workId, groupAppointments], groupIndex) => {
                          // 取得當天 column 寬度 (ref)
                          const columnWidth =
                            dayColumnsRef.current[dayIndex]?.clientWidth || 0;

                          // 依 workGroups 數量均分該欄寬度
                          const groupWidth = columnWidth / workGroups.length;
                          // 該 group 在欄位中的 left 起始位置
                          const left = groupIndex * groupWidth;

                          return groupAppointments.map((appt) => {
                            const [startHours, startMinutes] =
                              appt.appointmentStartTime.split(":").map(Number);
                            const [endHours, endMinutes] =
                              appt.appointmentEndTime.split(":").map(Number);

                            const startTime = startHours * 60 + startMinutes;
                            const endTime = endHours * 60 + endMinutes;
                            const top = startTime;
                            const height = endTime - startTime;

                            return (
                              <AppointmentItemV2
                                key={appt.id}
                                appointment={appt}
                                top={top}
                                height={height}
                                onClick={onAppointmentClick}
                                left={left}
                                // 如果你的 AppointmentItemV2 能接收 width，就一起給他
                                width={groupWidth}
                              />
                            );
                          });
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekScheduleChart;
