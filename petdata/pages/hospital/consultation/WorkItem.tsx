// File: WorkItem.tsx

import { Trash2 } from "lucide-react";
import { Control, Controller } from "react-hook-form";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { ScheduleDay, ScheduleDoctor } from "../../../types/schedule";
import DoctorSelector from "./DoctorSelector";

interface WorkItemProps {
  index: number;
  control: Control<ScheduleDay, any>;
  onDelete: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ index, control, onDelete }) => {
  return (
    <div className="p-4 bg-secondary-gray-light rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <Controller
          control={control}
          name={`works.${index}.name`}
          render={({ field }) => (
            <Input
              label="診間名稱"
              required
              {...field}
              className="flex-1 mr-4"
            />
          )}
        />
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="text-secondary-red hover:text-badgeText-error mt-6"
          onClick={onDelete}
        >
          <Trash2 size={20} />
        </Button>
      </div>

      <div>
        <Controller
          control={control}
          name={`works.${index}.doctor`}
          render={({ field }) => (
            <DoctorSelector
              doctor={field.value ?? null}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
};

export default WorkItem;
