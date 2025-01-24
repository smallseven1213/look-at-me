import React, { useState } from "react";
import dayjs from "dayjs";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Dialog,
} from "../../../components/Dialog";
import Button from "../../../components/Button";
import MonthInput from "../../../components/MonthInput";

interface MonthSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (year: number, month: number) => void;
  isLoading?: boolean;
}

const MonthSelectDialog: React.FC<MonthSelectDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
  });

  const handleConfirm = () => {
    onConfirm(selectedDate.year, selectedDate.month);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>選擇套用月份</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="py-6 flex items-center justify-center">
          <div className="space-y-4">
            <p className="text-gray-500">請選擇要套用週班表的月份：</p>
            <MonthInput
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={dayjs()}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              outline
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isLoading}>
              確認
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MonthSelectDialog;
