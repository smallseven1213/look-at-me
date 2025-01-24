import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AppointmentDetail } from "../../../types/appointment";
import { CheckCircle2, Clock, Calendar } from "lucide-react";

interface AppointmentItemForListProps {
  appointment: AppointmentDetail;
  className?: string;
  onClick: (appointment: AppointmentDetail) => void;
}

export const AppointmentItemForList: React.FC<AppointmentItemForListProps> = ({
  appointment,
  className,
  onClick,
}) => {
  const isConfirmed = !!appointment.updateTime;
  const startTime = appointment.appointmentStartTime.substring(0, 5); // HH:mm
  const endTime = appointment.appointmentEndTime.substring(0, 5); // HH:mm

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={`group relative overflow-hidden rounded-xl border transition-all 
                      hover:shadow-lg cursor-pointer ${className}
                      ${
                        isConfirmed
                          ? "border-secondary-green bg-gradient-to-r from-secondary-green/5 to-transparent"
                          : "border-secondary-yellow bg-gradient-to-r from-secondary-yellow/5 to-transparent"
                      }`}
            onClick={() => onClick(appointment)}
          >
            {/* Status Indicator */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1
                          ${
                            isConfirmed
                              ? "bg-secondary-green"
                              : "bg-secondary-yellow"
                          }`}
            />

            <div className="p-3 space-y-2">
              {/* Time and Status Section */}
              <div className="">
                {/* Time */}
                <div className="flex items-center gap-2 text-primary-400">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {startTime} - {endTime}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-sm px-3 py-1 rounded-full font-medium
                              ${
                                isConfirmed
                                  ? "bg-secondary-green/10 text-secondary-green"
                                  : "bg-secondary-yellow/10 text-secondary-yellow"
                              }`}
                    >
                      {appointment.workName}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
                              ${
                                isConfirmed
                                  ? "bg-badge-success text-badgeText-success"
                                  : "bg-badge-warning text-badgeText-warning"
                              }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{isConfirmed ? "已確認" : "待確認"}</span>
                  </div>
                </div>
              </div>

              {/* Work Type */}

              {/* Pet & Owner Info */}
              <div className="text-sm">
                <div className="space-y-0.5">
                  <div className="font-medium text-primary-400">
                    {appointment.petName}
                  </div>
                  <div className="text-primary-300">
                    {appointment.ownerName}
                  </div>
                </div>
                <div className="text-primary-300 text-xs">
                  醫師：{appointment.doctorName}
                </div>
              </div>
            </div>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs z-50"
            sideOffset={5}
          >
            <div className="space-y-2">
              <div>
                <div className="text-gray-400">寵物 / 飼主</div>
                <div>
                  {appointment.petName} / {appointment.ownerName}
                </div>
              </div>
              <div>
                <div className="text-gray-400">門診類型</div>
                <div>{appointment.workName}</div>
              </div>
              <div>
                <div className="text-gray-400">醫師</div>
                <div>{appointment.doctorName}</div>
              </div>
            </div>
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default AppointmentItemForList;
