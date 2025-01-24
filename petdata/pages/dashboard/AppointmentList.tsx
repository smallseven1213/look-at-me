import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { useHospitalStore } from "../../stores/hospitalStore";
import DashboardCard from "../../components/DashboardCard";
import dayjs from "dayjs";
import { useFilteredAppointments } from "../../hooks/useFilteredAppointments";

// NoData component
const NoData: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-gray-500 h-[140px]">
    <Calendar className="w-16 h-16 mb-4 stroke-current" />
    <p className="text-sm font-medium">沒有待確認的預約</p>
  </div>
);

const AppointmentList: React.FC = () => {
  const navigate = useNavigate();

  const { appointments, isLoading, refresh } = useFilteredAppointments({
    isConfirmed: false,
    searchConditions: {
      StartTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
  });

  const handleViewMore = () => {
    navigate("/app/appointments/unconfirmed");
  };

  return (
    <DashboardCard
      title="未確認預約"
      footer={
        <button
          onClick={handleViewMore}
          className="w-full flex items-center justify-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>查看更多</span>
          <ChevronRight size={16} />
        </button>
      }
    >
      <div className="h-[200px] overflow-auto">
        {!isLoading && appointments.length === 0 ? (
          <NoData />
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 10).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                onClick={() => navigate(`/app/appointments/unconfirmed`)}
              >
                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {appointment.ownerName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {appointment.appointmentStartTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {appointment.doctorName}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                      {appointment.appointmentStartTime.substring(11, 16)} -{" "}
                      {appointment.appointmentEndTime.substring(11, 16)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default AppointmentList;
