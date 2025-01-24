import React, { useEffect, useRef } from "react";
import { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../types/appointment";
import { AppointmentItemV2 } from "./AppointmentItemV2";

interface WeekScheduleChartTimeLineProps {
  weekDays: Dayjs[];
  appointments: AppointmentDetail[];
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

export const WeekScheduleChartTimeLine: React.FC<
  WeekScheduleChartTimeLineProps
> = ({ weekDays, appointments, onAppointmentClick, isClosedOn }) => {
  const timeSlots = generateTimeSlots();
  const containerRef = useRef<HTMLDivElement>(null);
  const dayColumnsRef = useRef<(HTMLDivElement | null)[]>([]);

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
  }, []);

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

              // 過濾當天預約
              const dayAppointments = appointments.filter(
                (appointment) => day.format("YYYY-MM-DD") === appointment.date
              );

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
                      {(() => {
                        // 1. 先按「起始時間」分組
                        const groupedByStartTime = dayAppointments.reduce(
                          (acc, appt) => {
                            const key = appt.appointmentStartTime;
                            if (!acc[key]) {
                              acc[key] = [];
                            }
                            acc[key].push(appt);
                            return acc;
                          },
                          {} as Record<string, AppointmentDetail[]>
                        );

                        // 2. 逐組繪製: 同起始時間的 Appointment side-by-side
                        return Object.entries(groupedByStartTime).map(
                          ([startTime, group]) => {
                            // 這組有幾筆
                            const totalCount = group.length;

                            // 排序一下 (可選)，如果要依照 endTime 或其他屬性
                            // group.sort((a, b) => {
                            //   ... 如果需要再做排序 ...
                            // });

                            return group.map((appt, index) => {
                              const [startHours, startMinutes] =
                                appt.appointmentStartTime
                                  .split(":")
                                  .map(Number);
                              const [endHours, endMinutes] =
                                appt.appointmentEndTime.split(":").map(Number);

                              const startTimeInMin =
                                startHours * 60 + startMinutes;
                              const endTimeInMin = endHours * 60 + endMinutes;
                              const top = startTimeInMin;
                              const height = endTimeInMin - startTimeInMin;

                              // 取得當天 column 寬度
                              const columnWidth =
                                dayColumnsRef.current[dayIndex]?.clientWidth ||
                                0;

                              // 同組並排顯示 => 寬度除以該組數量
                              const itemWidth = columnWidth / totalCount;
                              const leftOffset = index * itemWidth;

                              return (
                                <AppointmentItemV2
                                  key={appt.id}
                                  appointment={appt}
                                  onClick={onAppointmentClick}
                                  top={top}
                                  height={height}
                                  // 同起始時間的 item，分配不同 left
                                  left={leftOffset}
                                  // 調整寬度讓它們並排
                                  width={itemWidth}
                                />
                              );
                            });
                          }
                        );
                      })()}
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
