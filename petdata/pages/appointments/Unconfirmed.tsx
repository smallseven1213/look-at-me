import React, { useState } from "react";
import UnconfirmedSearchPanel from "./UnconfirmedSearchPanel";
import { useAppointments } from "../../hooks/useAppointments";
import {
  AppointmentDetail,
  AppointmentSearchKeyString,
} from "../../types/appointment";
import { useHospitalStore } from "../../stores/hospitalStore";
import AppointmentCard from "../../components/AppointmentCard";
import AppointmentDialog from "../../components/AppointmentDialog";
import PagePadding from "../../components/PagePadding";
import { Calendar } from "lucide-react";
import { CollapsiblePanel } from "../../components/CollapsiblePanel";
import dayjs from "dayjs";
import { SearchFormData } from "../../hooks/useFilteredAppointments";

// NoData component
const NoData: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center text-gray-500 pt-10">
    <Calendar className="w-16 h-16 mb-4 stroke-current" />
    <p className="text-lg font-medium mb-2">沒有待確認的預約</p>
    <p className="text-sm">所有的預約都已經確認完成了！</p>
  </div>
);

// AppointmentList component to keep the code organized
const AppointmentList: React.FC<{
  appointments: AppointmentDetail[];
  onAppointmentClick: (appointment: AppointmentDetail) => void;
  isLoading: boolean;
}> = ({ appointments, onAppointmentClick, isLoading }) => {
  if (!isLoading && appointments.length === 0) {
    return <NoData />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">未確認預約列表</h2>
        <div className="text-sm text-gray-500">
          共 {appointments.length} 筆未確認預約
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onClick={() => onAppointmentClick(appointment)}
          />
        ))}
      </div>
    </div>
  );
};

const Unconfirmed: React.FC = () => {
  const [searchConditions, setSearchConditions] = useState<SearchFormData>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hospitalId = useHospitalStore((state) => state.hospitalId);

  // 將搜尋條件轉換為 API 所需的格式
  const searches = [
    {
      searchKey: "HospitalId" as AppointmentSearchKeyString,
      searchValue: hospitalId!,
    },
    {
      searchKey: "IsConfirmed" as AppointmentSearchKeyString,
      searchValue: "false",
    },
    {
      searchKey: "StartTime" as AppointmentSearchKeyString,
      searchValue: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    ...Object.entries(searchConditions)
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([key, value]) => ({
        searchKey: key as AppointmentSearchKeyString,
        searchValue: value!,
      })),
  ];

  // 使用轉換後的搜尋條件呼叫 API
  const {
    appointments: fetchedAppointments,
    isLoading,
    refresh,
  } = useAppointments({
    take: 100,
    searches,
  });

  const currentTime = dayjs();

  const appointments = fetchedAppointments.filter((appointment) =>
    dayjs(`${appointment.date} ${appointment.appointmentEndTime}`).isAfter(
      currentTime
    )
  );

  const handleSearch = (data: SearchFormData) => {
    setSearchConditions(data);
  };

  const handleAppointmentClick = (appointment: AppointmentDetail) => {
    setSelectedAppointmentId(appointment.id);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <PagePadding>
          <AppointmentList
            appointments={appointments.filter((appointment) => {
              const appointmentDate = new Date(appointment.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return !appointment.updateTime && appointmentDate >= today;
            })}
            onAppointmentClick={handleAppointmentClick}
            isLoading={isLoading}
          />
        </PagePadding>
      </div>
      <CollapsiblePanel>
        <UnconfirmedSearchPanel onSearch={handleSearch} />
      </CollapsiblePanel>
      <AppointmentDialog
        appointmentId={selectedAppointmentId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirmed={() => {
          refresh();
        }}
      />
    </div>
  );
};

export default Unconfirmed;
