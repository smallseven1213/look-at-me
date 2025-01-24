import React from "react";
import { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../types/appointment";
import { AppointmentItemForList } from "./AppointmentItemForList";
import { Calendar } from "lucide-react";

interface WeekScheduleChartListProps {
  weekDays: Dayjs[];
  appointments: AppointmentDetail[];
  onAppointmentClick: (appointment: AppointmentDetail) => void;
  isClosedOn: (dayOfWeek: number) => boolean;
}

export const WeekScheduleChartList: React.FC<WeekScheduleChartListProps> = ({
  weekDays,
  appointments,
  onAppointmentClick,
  isClosedOn,
}) => {
  const getDayAppointments = (day: Dayjs) => {
    return appointments
      .filter((appointment) => {
        return day.format("YYYY-MM-DD") === appointment.date;
      })
      .sort((a, b) =>
        a.appointmentStartTime.localeCompare(b.appointmentStartTime)
      );
  };

  return (
    <div className="space-y-4 py-4">
      {weekDays.map((day) => {
        const dayAppointments = getDayAppointments(day);
        const isClosed = isClosedOn(day.day());

        return (
          <div
            key={day.format("YYYY-MM-DD")}
            className={`rounded-lg border ${
              isClosed ? "bg-gray-50" : "bg-white"
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">
                    {day.format("M/D")} ({day.format("ddd")})
                  </div>
                  <div className="text-sm text-gray-500">
                    {isClosed ? "休診" : `${dayAppointments.length} 個預約`}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            {!isClosed && (
              <div className="p-2 space-y-4">
                {dayAppointments.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-4">
                    沒有預約
                  </div>
                ) : (
                  <>
                    {Object.entries(
                      dayAppointments.reduce((groups, appointment) => {
                        const workName = appointment.workName || "其他";
                        return {
                          ...groups,
                          [workName]: [
                            ...(groups[workName] || []),
                            appointment,
                          ],
                        };
                      }, {} as Record<string, AppointmentDetail[]>)
                    ).map(([workName, appointments]) => (
                      <div key={workName}>
                        <div className="font-bold text-sm text-gray-600 mb-2">
                          {workName}
                        </div>
                        <div className="flex flex-wrap">
                          {appointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="w-40 mr-2 mb-2"
                            >
                              <AppointmentItemForList
                                appointment={appointment}
                                onClick={onAppointmentClick}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
