import { Plus } from "lucide-react";
import React, { useEffect, useImperativeHandle, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../../../components/Button";
import Dropdown from "../../../components/Dropdown";
import Input from "../../../components/Input";
import TimeDropdown from "../../../components/TimeDropdown";
import TimeInput from "../../../components/TimeInput";
import { getDayOfWeekText } from "../../../hooks/useHospitalScheduleTemplate";
import { ScheduleDay, ScheduleWork } from "../../../types/schedule";
import WorkItem from "./WorkItem";

export interface ScheduleFormRef {
  submit: () => void;
}

interface ScheduleFormProps {
  schedule: ScheduleDay | null;
  isNew: boolean;
  isMonthly?: boolean;
  date?: string;
  onClose: () => void;
  onSave: (schedule: ScheduleDay) => void;
}

const ScheduleForm = React.forwardRef<ScheduleFormRef, ScheduleFormProps>(
  ({ schedule, isNew, isMonthly, date, onClose, onSave }, ref) => {
    const formRef = useRef<HTMLFormElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const defaultWork: ScheduleWork = {
      name: "",
      doctor: undefined,
    };

    const formatTimeForDisplay = (time: string | undefined) => {
      if (!time) return "00:00";
      return time.substring(0, 5); // 只取前5個字符 (HH:mm)
    };

    const { control, handleSubmit, watch, setValue, reset } =
      useForm<ScheduleDay>({
        defaultValues: {
          date: isMonthly ? date : schedule?.date,
          dayOfWeek: !isMonthly ? schedule?.dayOfWeek ?? 0 : undefined,
          section: {
            name: schedule?.section.name ?? "",
            startTime:
              formatTimeForDisplay(schedule?.section.startTime) ?? "00:00",
            endTime: formatTimeForDisplay(schedule?.section.endTime) ?? "00:00",
          },
          works: schedule?.works ?? [],
        },
      });

    // 當 schedule 改變時重置表單
    useEffect(() => {
      if (schedule) {
        reset({
          date: isMonthly ? date : schedule.date,
          dayOfWeek: !isMonthly ? schedule.dayOfWeek : undefined,
          section: {
            name: schedule.section.name,
            startTime: schedule.section.startTime,
            endTime: schedule.section.endTime,
          },
          works: schedule.works,
        });
      }
    }, [schedule, isMonthly, date, reset]);

    const works = watch("works");
    const currentDayOfWeek = watch("dayOfWeek");
    const startTime = watch("section.startTime");
    const endTime = watch("section.endTime");

    const handleAddWork = () => {
      setValue("works", [...works, defaultWork]);
    };

    const handleDeleteWork = (index: number) => {
      const newWorks = works.filter((_, i) => i !== index);
      setValue("works", newWorks);
    };

    // ScheduleForm.tsx 中的 onSubmit 函數修改
    // ScheduleForm.tsx 中的 onSubmit 函數修改
    const onSubmit = (data: ScheduleDay) => {
      // 處理時間格式的函數
      const formatTimeForApi = (time: string): string => {
        if (!time) return "00:00:00";
        // 如果已經是 HH:mm:ss 格式就直接返回
        if (time.length === 8) return time;
        // 如果是 HH:mm 格式就加上 :00
        return `${time}:00`;
      };

      // 確保所有必要的欄位都有值
      const sanitizedData = {
        ...data,
        id: !isNew ? schedule?.id : undefined,
        section: {
          ...data.section,
          id: !isNew ? schedule?.section.id : undefined,
          name: data.section.name || "",
          startTime: formatTimeForApi(data.section.startTime),
          endTime: formatTimeForApi(data.section.endTime),
        },
        works: data.works.map((work, index) => ({
          ...work,
          id: !isNew ? schedule?.works[index]?.id : undefined,
          name: work.name || "",
          doctor: work.doctor ?? null,
        })),
      };
      onSave(sanitizedData);
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        formRef.current?.requestSubmit();
      },
    }));

    return (
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="h-full">
        <div className="flex gap-8 h-[calc(80vh-120px)]">
          <div
            ref={contentRef}
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {/* 班次資訊 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">班次資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* 時段資訊 */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {/* 班次名稱 */}
                    <Controller
                      name="section.name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="班次名稱"
                          placeholder="請輸入班次名稱"
                          required
                          className="flex-1"
                        />
                      )}
                    />

                    {/* 星期幾 */}
                    {!isMonthly && (
                      <Controller
                        name="dayOfWeek"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            label="星期"
                            options={Array.from({ length: 7 }).map(
                              (_, index) => ({
                                value: index,
                                label: getDayOfWeekText(index),
                              })
                            )}
                            required
                            disabled
                          />
                        )}
                      />
                    )}
                  </div>

                  <div className="flex gap-4">
                    {/* 開始時間 */}
                    <div className="flex-1">
                      <Controller
                        name="section.startTime"
                        control={control}
                        render={({ field }) => (
                          <TimeInput {...field} label="開始時間" />
                          // <TimeDropdown
                          //   {...field}
                          //   label="開始時間"
                          //   required
                          //   maxTime={endTime}
                          // />
                        )}
                      />
                    </div>

                    {/* 結束時間 */}
                    <div className="flex-1">
                      <Controller
                        name="section.endTime"
                        control={control}
                        render={({ field }) => (
                          <TimeInput {...field} label="結束時間" />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 診間資訊 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">診間資訊</h3>
                <Button
                  type="button"
                  onClick={handleAddWork}
                  variant="tertiary"
                  size="sm"
                  outline
                  className="flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增診間
                </Button>
              </div>

              <div ref={contentRef} className="flex-1 pr-2">
                <Controller
                  control={control}
                  name="works"
                  render={({ field }) => (
                    <div className="space-y-4">
                      {field.value.length === 0 ? (
                        <div
                          className="p-8 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                          onClick={handleAddWork}
                        >
                          <p className="text-gray-500">
                            尚無診間設定，點擊新增診間
                          </p>
                        </div>
                      ) : (
                        field.value.map((work, index) => (
                          <WorkItem
                            key={index}
                            index={index}
                            control={control}
                            onDelete={() => handleDeleteWork(index)}
                          />
                        ))
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
);

export default ScheduleForm;
