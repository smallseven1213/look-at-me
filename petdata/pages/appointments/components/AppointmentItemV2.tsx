import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AppointmentDetail } from "../../../types/appointment";
import { CheckCircle2, Clock } from "lucide-react";

interface AppointmentItemV2Props {
  appointment: AppointmentDetail;
  top?: number;
  height?: number;
  left?: number;
  width?: number;
  className?: string;
  onClick: (appointment: AppointmentDetail) => void;
}

export const AppointmentItemV2: React.FC<AppointmentItemV2Props> = ({
  appointment,
  top,
  height,
  left,
  width,
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
            id="appointment-item"
            className={`absolute bg-white border rounded-lg cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group ${className}`}
            style={{
              ...(top && { top: `${top}px` }),
              ...(height && { height: `${height}px` }),
              borderColor: isConfirmed ? "#10b981" : "#e5e7eb",
              ...(left && { left: `${left}px` }),
              ...(width && { width: `${width}px` }),
            }}
            onClick={() => onClick(appointment)}
          >
            <div className="p-1 text-xs space-y-1 h-full overflow-hidden whitespace-nowrap">
              {/* Status and Time */}
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <div className="flex items-center gap-1">
                  {isConfirmed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-[10px]">
                    {isConfirmed ? "已確認" : "待確認"}
                  </span>
                </div>
                <span className="text-[10px]">
                  {startTime}-{endTime}
                </span>
              </div>

              {/* Work Type */}
              <div className="text-[10px] bg-gray-50 text-gray-600 rounded px-1.5 py-0.5 w-fit">
                {appointment.workName}
              </div>

              {/* Pet & Owner Name */}
              <div className="font-medium truncate">{appointment.petName}</div>
              <div className="text-gray-600 truncate">
                {appointment.ownerName}
              </div>

              {/* Doctor Name */}
              <div className="text-gray-500 truncate text-[10px]">
                醫師：{appointment.doctorName}
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
              <div>
                <div className="text-gray-400">聯絡方式</div>
                <div>{appointment.ownerPhoneNo}</div>
                <div>{appointment.ownerEmail}</div>
              </div>
              {appointment.remark && (
                <div>
                  <div className="text-gray-400">備註</div>
                  <div>{appointment.remark}</div>
                </div>
              )}
            </div>
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
