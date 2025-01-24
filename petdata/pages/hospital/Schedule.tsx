import React, { useState, useRef, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import Calendar from "../../components/Calendar";
import PagePadding from "../../components/PagePadding";
import { useHospitalSchedule } from "../../hooks/useHospitalSchedule";
import { ScheduleDay } from "../../types/schedule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogBody,
  DialogClose,
} from "../../components/Dialog";
import Button from "../../components/Button";
import { updateMonthlySchedule } from "../../services/hospitalMonthlyScheduleService";
import MonthlyScheduleForm from "./schedule/MonthlyScheduleForm";
import { useHospital } from "../../hooks/useHospital";
import { Power } from "lucide-react";
import { useHospitalStore } from "../../stores/hospitalStore";
import { useUserStore } from "../../hooks/useUserStore";
import { ScheduleItem } from "./schedule/ScheduleItem";
import { formatTime } from "../../utils/time";
import { QuickFilter } from "./schedule/QuickFilter";

const COLOR_SCHEMES = [
  { bg: "bg-yellow-100", text: "text-yellow-800" },
  { bg: "bg-green-100", text: "text-green-800" },
  { bg: "bg-pink-100", text: "text-pink-800" },
  { bg: "bg-blue-100", text: "text-blue-800" },
  { bg: "bg-purple-100", text: "text-purple-800" },
  { bg: "bg-orange-100", text: "text-orange-800" },
];

export interface ScheduleFormRef {
  submit: () => void;
}

interface ScheduleItemProps {
  schedule: ScheduleDay;
  date: string;
  index: number;
  colorClasses: string;
  onSelect: (schedule: ScheduleDay, date: string) => void;
}

const HospitalSchedule: React.FC = () => {
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { hospital } = useHospital(hospitalId ?? "");
  const { user } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleDay[]>([]);
  const [isScheduleListOpen, setIsScheduleListOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDay | null>(
    null
  );
  const [isNewSchedule, setIsNewSchedule] = useState(false);
  const formRef = useRef<ScheduleFormRef>(null);
  const [filters, setFilters] = useState<{
    sectionName: string | null;
    doctorName: string | null;
  }>({
    sectionName: null,
    doctorName: null,
  });

  const currentYear = selectedDate.year();
  const currentMonth = selectedDate.month() + 1;

  console.log("currentYear", currentYear);
  console.log("currentMonth", currentMonth);

  const { schedule, isLoading, refresh } = useHospitalSchedule(
    {
      hospitalId: hospitalId ?? "",
      year: currentYear,
      month: currentMonth,
    }
    // {
    //   revalidateOnFocus: false,
    //   revalidateIfStale: false,
    //   refreshInterval: 0,
    //   revalidateOnReconnect: false,
    // }
  );

  // 過濾後的排班資料
  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      // 如果沒有過濾條件，返回所有資料
      if (!filters.sectionName && !filters.doctorName) {
        return true;
      }

      // 檢查科別條件
      const matchesSection =
        !filters.sectionName || item.section.name === filters.sectionName;

      // 檢查醫生條件
      const matchesDoctor =
        !filters.doctorName ||
        item.works.some((work) => work.doctor?.name === filters.doctorName);

      // 兩個條件都要符合（AND）
      return matchesSection && matchesDoctor;
    });
  }, [schedule, filters]);

  const sectionColorMap = useMemo(() => {
    const uniqueSections = new Set<string>();
    filteredSchedule.forEach((day) => {
      uniqueSections.add(day.section.name);
    });

    const colorMap = new Map<string, (typeof COLOR_SCHEMES)[0]>();
    Array.from(uniqueSections).forEach((sectionName, index) => {
      colorMap.set(sectionName, COLOR_SCHEMES[index % COLOR_SCHEMES.length]);
    });

    return colorMap;
  }, [filteredSchedule]);

  // 根據日期組織排班資料
  const scheduleMap = useMemo(() => {
    return filteredSchedule.reduce<{ [key: string]: ScheduleDay[] }>(
      (acc, item) => {
        const date = item.date;
        if (date) {
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        } else {
          return acc;
        }
      },
      {}
    );
  }, [filteredSchedule]);

  const handleDateCellClick = (date: Dayjs) => {
    setSelectedDate(date);
    const dateStr = date.format("YYYY-MM-DD");
    setSelectedSchedules(scheduleMap[dateStr] || []);
    setIsScheduleListOpen(true);
  };

  const handleSelectDate = (date: Dayjs) => {
    handleDateCellClick(date);
  };

  const handleSectionSelect = (scheduleDay: ScheduleDay) => {
    console.log("handleSectionSelect", scheduleDay);
    setSelectedSchedule(scheduleDay);
    setIsNewSchedule(false);
    setIsScheduleListOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleAddNewSchedule = () => {
    setSelectedSchedule(null);
    setIsNewSchedule(true);
    setIsScheduleListOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveSchedule = async (updatedSchedule: ScheduleDay) => {
    if (!hospitalId || !selectedDate) return;

    try {
      // 取得目前月份的所有排班
      const currentMonthSchedules = Object.values(scheduleMap).flat();

      let updatedSchedules: ScheduleDay[];

      if (isNewSchedule) {
        // 新增排班：直接加入新的排班資料
        updatedSchedules = [
          ...currentMonthSchedules,
          {
            ...updatedSchedule,
            date: selectedDate.format("YYYY-MM-DD"), // 確保新增時有正確的日期
          },
        ];
      } else {
        // 編輯排班：更新現有排班資料
        updatedSchedules = currentMonthSchedules.map((schedule) => {
          if (
            schedule.date === selectedSchedule?.date &&
            schedule.section.name === selectedSchedule?.section.name
          ) {
            return {
              ...updatedSchedule,
              date: selectedDate.format("YYYY-MM-DD"), // 確保更新時有正確的日期
            };
          }
          return schedule;
        });
      }

      // 整包更新資料
      await updateMonthlySchedule(
        hospitalId,
        {
          year: selectedDate.year(),
          month: selectedDate.month() + 1,
        },
        updatedSchedules,
        user?.token
      );

      setIsEditDialogOpen(false);
      setIsScheduleListOpen(false); // 關閉排班列表對話框
      refresh(); // 重新取得最新資料
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  };

  const getSectionColorClasses = (sectionName: string) => {
    const colorSet = sectionColorMap.get(sectionName) || COLOR_SCHEMES[0];
    return `${colorSet.bg} ${colorSet.text}`;
  };

  const renderClosedDay = () => (
    <div className="flex flex-col items-center justify-center h-full text-primary-300 pointer-events-none">
      <Power size={24} className="mb-1" />
      <span className="text-sm">休診中</span>
    </div>
  );

  const handleDeleteSchedule = async () => {
    if (!hospitalId || !selectedDate || !selectedSchedule) return;

    try {
      // 取得目前月份的所有排班，並過濾掉要刪除的排班
      const currentMonthSchedules = Object.values(scheduleMap).flat();
      const updatedSchedules = currentMonthSchedules.filter(
        (schedule) =>
          !(
            schedule.date === selectedSchedule.date &&
            schedule.section.name === selectedSchedule.section.name
          )
      );

      // 整包更新資料
      await updateMonthlySchedule(
        hospitalId,
        {
          year: selectedDate.year(),
          month: selectedDate.month() + 1,
        },
        updatedSchedules,
        user?.token
      );

      setIsEditDialogOpen(false);
      refresh();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  // 處理月份導航
  const handleMonthNavigation = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? selectedDate.subtract(1, "month")
        : selectedDate.add(1, "month");
    setSelectedDate(newDate);
  };

  return (
    <PagePadding>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">載入中...</div>
      ) : (
        <>
          <Calendar
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
            }}
            headerComponent={
              <QuickFilter schedules={schedule} onFilterChange={setFilters} />
            }
            onSelect={handleSelectDate}
            dateCellRender={(date: Dayjs) => {
              const dateStr = date.format("YYYY-MM-DD");
              const daySchedules: ScheduleDay[] = (
                scheduleMap[dateStr] || []
              ).sort((a, b) =>
                a.section.startTime.localeCompare(b.section.startTime)
              );

              // 檢查當天是否為休診日
              const dayOfWeek = date.day(); // 0-6, 0 為週日
              const isClosedDay = hospital?.closeDays.includes(dayOfWeek);

              if (isClosedDay) {
                return renderClosedDay();
              }

              return (
                <div
                  className="flex flex-col items-start h-full"
                  onClick={(e) => {
                    // Only handle click if it's directly on the container
                    if (e.target === e.currentTarget) {
                      handleDateCellClick(date);
                    }
                  }}
                >
                  {daySchedules.map((schedule, idx) => (
                    <ScheduleItem
                      key={`${schedule.section.name}-${idx}`}
                      schedule={schedule}
                      date={dateStr}
                      index={idx}
                      colorClasses={getSectionColorClasses(
                        schedule.section.name
                      )}
                      onSelect={(schedule, date) => {
                        setSelectedDate(dayjs(date));
                        setSelectedSchedule(schedule);
                        setIsNewSchedule(false);
                        setIsEditDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              );
            }}
          />

          <Dialog
            open={isScheduleListOpen}
            onOpenChange={setIsScheduleListOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedDate.format("YYYY-MM-DD")} 排班資訊
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                <div className="flex flex-col gap-4">
                  {selectedSchedules.length > 0 && (
                    <div className="space-y-4">
                      {selectedSchedules.map((scheduleDay, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSectionSelect(scheduleDay)}
                          className={`${getSectionColorClasses(
                            scheduleDay.section.name
                          )} p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">
                              {scheduleDay.section.name}
                            </h3>
                            <span className="text-sm">
                              {formatTime(scheduleDay.section.startTime)} -{" "}
                              {formatTime(scheduleDay.section.endTime)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center mt-4">
                    <Button type="button" onClick={handleAddNewSchedule}>
                      新增排班資料
                    </Button>
                  </div>
                </div>
              </DialogBody>
            </DialogContent>
          </Dialog>

          {/* Schedule Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent width="90%" height="90vh">
              <DialogHeader>
                <DialogTitle>
                  {isNewSchedule ? "新增排班" : "編輯排班"}
                </DialogTitle>
                <DialogClose />
              </DialogHeader>
              <DialogBody>
                <MonthlyScheduleForm
                  ref={formRef}
                  schedule={selectedSchedule}
                  isNew={isNewSchedule}
                  isMonthly={true}
                  date={selectedDate.format("YYYY-MM-DD")}
                  onSave={handleSaveSchedule}
                  onClose={() => setIsEditDialogOpen(false)}
                />
              </DialogBody>
              <DialogFooter>
                <div className="flex justify-between w-full">
                  <div>
                    {!isNewSchedule && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-red-500"
                        onClick={handleDeleteSchedule}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      outline
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button
                      type="button"
                      onClick={() => formRef.current?.submit()}
                    >
                      {isNewSchedule ? "新增" : "儲存"}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </PagePadding>
  );
};

export default HospitalSchedule;
