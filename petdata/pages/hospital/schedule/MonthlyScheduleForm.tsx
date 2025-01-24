import { Plus } from "lucide-react";
import React, { useImperativeHandle, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../../../components/Button";
import Dropdown from "../../../components/Dropdown";
import Input from "../../../components/Input";
import TimeDropdown from "../../../components/TimeDropdown";
import TimeInput from "../../../components/TimeInput";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../../../components/Toast";
import { getDayOfWeekText } from "../../../hooks/useHospitalScheduleTemplate";
import { ScheduleDay, ScheduleWork } from "../../../types/schedule";
import WorkItem from "../consultation/WorkItem";

export interface ScheduleFormRef {
  submit: () => void;
}

interface ScheduleFormProps {
  schedule: ScheduleDay | null;
  isNew: boolean;
  isMonthly?: boolean; // 新增此屬性來區分月排班或週排班
  date?: string; // 月排班用
  onClose: () => void;
  onSave: (schedule: ScheduleDay) => void;
}

const formatTimeToHHMM = (time: string) => {
  if (!time) return "00:00";
  const matches = time.match(/^(\d{2}):(\d{2})/);
  return matches ? `${matches[1]}:${matches[2]}` : "00:00";
};

const formatTimeToHHMMSS = (time: string) => {
  if (!time) return "00:00:00";
  const [hours, minutes] = time.split(":");
  return `${hours || "00"}:${minutes || "00"}:00`;
};

const ScheduleForm = React.forwardRef<ScheduleFormRef, ScheduleFormProps>(
  ({ schedule, isNew, isMonthly, date, onClose, onSave }, ref) => {
    console.log("MonthlyScheduleForm isNew:", isNew);
    console.log("MonthlyScheduleForm schedule:", schedule);

    const formRef = useRef<HTMLFormElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
      title: string;
      description: string;
      variant: "success" | "error";
    }>({
      title: "",
      description: "",
      variant: "success",
    });

    const defaultWork: ScheduleWork = {
      name: "",
      doctor: undefined,
    };

    const defaultValues = {
      date: isMonthly ? date : undefined,
      dayOfWeek: !isMonthly ? 0 : undefined,
      section: {
        name: "",
        startTime: "00:00",
        endTime: "00:00",
      },
      works: [defaultWork],
      ...(schedule
        ? {
            ...schedule,
            section: {
              ...schedule.section,
              startTime: formatTimeToHHMM(schedule.section.startTime),
              endTime: formatTimeToHHMM(schedule.section.endTime),
            },
          }
        : {}),
    };

    const { control, handleSubmit, watch, setValue } = useForm<ScheduleDay>({
      defaultValues,
    });

    const works = watch("works");
    const startTime = watch("section.startTime");
    const endTime = watch("section.endTime");

    const handleAddWork = () => {
      setValue("works", [...works, defaultWork]);
    };

    const handleDeleteWork = (index: number) => {
      const newWorks = works.filter((_, i) => i !== index);
      console.log("newWorks:", newWorks);
      setValue("works", newWorks);
    };

    const onSubmit = (data: ScheduleDay) => {
      // 檢查是否有診間設定但沒有填寫醫生
      const hasEmptyDoctor = data.works.some(
        (work) => work.name && !work.doctor
      );
      if (hasEmptyDoctor) {
        setToastMessage({
          title: "無法儲存",
          description: "請為所有診間設定填寫執班醫生",
          variant: "error",
        });
        setShowToast(true);
        return;
      }

      const formattedData = {
        ...data,
        section: {
          ...data.section,
          startTime: formatTimeToHHMMSS(data.section.startTime),
          endTime: formatTimeToHHMMSS(data.section.endTime),
        },
      };
      onSave(formattedData);
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        formRef.current?.requestSubmit();
      },
    }));

    return (
      <ToastProvider>
        <>
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="h-full"
          >
            <div className="flex gap-8 h-[calc(80vh-120px)]">
              <div className="w-5/12 flex-shrink-0">
                {isMonthly ? (
                  <div className="mb-4">
                    <Input label="日期" value={date} disabled />
                  </div>
                ) : (
                  <div className="mb-4">
                    <Controller
                      control={control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <Dropdown
                          label="星期"
                          value={field.value}
                          variant="button"
                          onChange={field.onChange}
                          options={[
                            { value: 0, label: getDayOfWeekText(0) },
                            { value: 1, label: getDayOfWeekText(1) },
                            { value: 2, label: getDayOfWeekText(2) },
                            { value: 3, label: getDayOfWeekText(3) },
                            { value: 4, label: getDayOfWeekText(4) },
                            { value: 5, label: getDayOfWeekText(5) },
                            { value: 6, label: getDayOfWeekText(6) },
                          ]}
                        />
                      )}
                    />
                  </div>
                )}
                <div className="mb-4">
                  <Controller
                    control={control}
                    name="section.name"
                    render={({ field }) => (
                      <Input
                        label="班次名稱"
                        placeholder={isNew ? "請輸入班次名稱" : ""}
                        // disabled={!isNew}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                </div>
                <div className="mb-4">
                  <Controller
                    control={control}
                    name="section.startTime"
                    render={({ field }) => (
                      <TimeInput {...field} label="開始時間" />
                    )}
                  />
                </div>
                <div className="mb-4">
                  <Controller
                    control={control}
                    name="section.endTime"
                    render={({ field }) => (
                      <TimeInput {...field} label="結束時間" />
                    )}
                  />
                </div>
              </div>
              <div className="w-7/12 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-primary-400">
                    診間設定
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    outline
                    onClick={handleAddWork}
                  >
                    <div className="flex justify-center items-center">
                      <Plus size={18} className="mr-1" />
                      新增診間
                    </div>
                  </Button>
                </div>
                <div ref={contentRef} className="flex-1 overflow-y-auto pr-2">
                  <Controller
                    control={control}
                    name="works"
                    render={({ field }) => (
                      <div className="space-y-4">
                        {field.value.map((work, index) => (
                          <WorkItem
                            key={work.id || `temp-${index}`}
                            index={index}
                            control={control}
                            onDelete={() => handleDeleteWork(index)}
                          />
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
          <Toast
            open={showToast}
            onOpenChange={setShowToast}
            variant={toastMessage.variant}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>
          <ToastViewport />
        </>
      </ToastProvider>
    );
  }
);

export default ScheduleForm;
