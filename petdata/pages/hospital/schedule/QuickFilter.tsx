import React, { useMemo, useState } from "react";
import Dropdown from "../../../components/Dropdown";
import { ScheduleDay } from "../../../types/schedule";

interface QuickFilterProps {
  schedules: ScheduleDay[];
  onFilterChange: (filters: {
    sectionName: string | null;
    doctorName: string | null;
  }) => void;
}

export const QuickFilter: React.FC<QuickFilterProps> = ({
  schedules,
  onFilterChange,
}) => {
  // 從 schedules 中提取唯一的科別名稱和醫生名稱
  const { sectionOptions, doctorOptions } = useMemo(() => {
    const sections = new Set<string>();
    const doctors = new Set<string>();

    schedules.forEach((schedule) => {
      sections.add(schedule.section.name);
      schedule.works.forEach((work) => {
        if (work.doctor?.name) {
          doctors.add(work.doctor.name);
        }
      });
    });

    return {
      sectionOptions: [
        { value: "", label: "全部班別" },
        ...Array.from(sections).map((name) => ({
          value: name,
          label: name,
        })),
      ],
      doctorOptions: [
        { value: "", label: "全部醫師" },
        ...Array.from(doctors).map((name) => ({
          value: name,
          label: name,
        })),
      ],
    };
  }, [schedules]);

  const [filters, setFilters] = useState<{
    sectionName: string | null;
    doctorName: string | null;
  }>({
    sectionName: null,
    doctorName: null,
  });

  const handleSectionChange = (value: string | null) => {
    const newSectionName = value ?? null;
    setFilters({
      sectionName: newSectionName,
      doctorName: filters.doctorName,
    });
    onFilterChange({
      sectionName: newSectionName,
      doctorName: filters.doctorName,
    });
  };

  const handleDoctorChange = (value: string | null) => {
    setFilters({
      sectionName: filters.sectionName,
      doctorName: value,
    });
    onFilterChange({
      sectionName: filters.sectionName,
      doctorName: value,
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-32">
        <Dropdown
          options={sectionOptions}
          onChange={handleSectionChange}
          defaultValue={filters.sectionName || ""}
          variant="button"
        />
      </div>
      <div className="w-32">
        <Dropdown
          options={doctorOptions}
          onChange={handleDoctorChange}
          defaultValue={filters.doctorName || ""}
          variant="button"
        />
      </div>
    </div>
  );
};
