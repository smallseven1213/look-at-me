import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AppointmentDetail } from "../../../../types/appointment";
import { useHospitalStore } from "../../../../stores/hospitalStore";
import { useHospital } from "../../../../hooks/useHospital";
import WeekController from "../WeekController";
import WeekScheduleChart from "../WeekScheduleChart";
import { useViewModeStore } from "../../store/viewMode";
import { Clock, LayoutList } from "lucide-react";

interface WeekViewProps {
  searchConditions?: any;
  onAppointmentClick: (appointment: AppointmentDetail) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  searchConditions,
  onAppointmentClick,
}) => {
  const { weekViewMode, setWeekViewMode, selectedDate, setSelectedDate } =
    useViewModeStore();
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { hospital, isClosedOn } = useHospital(hospitalId || "");

  // 若想在進入 week 時就自動對齊到該週的開始（可選）
  // useEffect(() => {
  //   setSelectedDate(selectedDate.startOf("week"));
  //   // eslint-disable-next-line
  // }, []);
  console.log("selectedDate", selectedDate);

  return (
    <div className="h-full">
      <WeekController
        selectedWeek={selectedDate} // 用全域 selectedDate
        onWeekChange={setSelectedDate}
      />
      <div className="flex items-center justify-end">
        <button
          onClick={() =>
            setWeekViewMode(weekViewMode === "list" ? "timeline" : "list")
          }
          className="mb-2 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
              bg-gradient-to-r from-secondary-blue to-secondary-green
              hover:from-secondary-green hover:to-secondary-blue
              text-white shadow-md hover:shadow-lg"
        >
          <span className="text-sm">
            {weekViewMode === "list" ? "時間軸檢視" : "列表檢視"}
          </span>
          {weekViewMode === "list" ? (
            <Clock className="w-5 h-5" />
          ) : (
            <LayoutList className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="h-[calc(100%-4rem)]">
        <WeekScheduleChart
          selectedWeek={selectedDate}
          searchConditions={searchConditions}
          onAppointmentClick={onAppointmentClick}
          isClosedOn={isClosedOn}
        />
      </div>
    </div>
  );
};

export default WeekView;
