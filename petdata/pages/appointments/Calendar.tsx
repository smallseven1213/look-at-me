import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../types/appointment";
import { SearchFormData } from "./CalendarSearchPanel";
import SearchPanel from "./CalendarSearchPanel";
import DayView from "./components/schedule/DayView";
import WeekView from "./components/schedule/WeekView";
import AppointmentDialog from "../../components/AppointmentDialog";
import { useViewModeStore } from "./store/viewMode";
import PagePadding from "../../components/PagePadding";
import { CollapsiblePanel } from "../../components/CollapsiblePanel";

const AppointmentCalendar: React.FC = () => {
  const { viewMode } = useViewModeStore();
  const [searchConditions, setSearchConditions] = useState<SearchFormData>();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  const handleAppointmentClick = (appointment: AppointmentDetail) => {
    setSelectedAppointmentId(appointment.id);
    setIsAppointmentDialogOpen(true);
  };

  const handleAppointmentDialogOpenChange = (open: boolean) => {
    setIsAppointmentDialogOpen(open);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1">
        <PagePadding className="h-full">
          {viewMode === "day" ? (
            <DayView
              searchConditions={searchConditions}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <WeekView
              searchConditions={searchConditions}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </PagePadding>
      </div>
      <CollapsiblePanel>
        <SearchPanel onSearch={setSearchConditions} />
      </CollapsiblePanel>
      <AppointmentDialog
        appointmentId={selectedAppointmentId}
        isOpen={isAppointmentDialogOpen}
        onOpenChange={handleAppointmentDialogOpenChange}
      />
    </div>
  );
};

export default AppointmentCalendar;
