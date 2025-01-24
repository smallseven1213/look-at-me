import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../components/Dialog";
import Button from "../../../components/Button";
import Switch from "../../../components/Switch";
import { DAYS_OF_WEEK } from "../../../hooks/useHospital";

interface CloseDaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeDays: number[];
  onSave: (closeDays: number[]) => void;
}

const CloseDaysDialog: React.FC<CloseDaysDialogProps> = ({
  open,
  onOpenChange,
  closeDays: initialCloseDays,
  onSave,
}) => {
  const [localCloseDays, setLocalCloseDays] =
    useState<number[]>(initialCloseDays);

  const handleToggleDay = (dayValue: number) => {
    setLocalCloseDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSave = () => {
    onSave(localCloseDays);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>看診休診日設定</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(({ value, label }) => (
              <div
                key={value}
                className="flex items-center justify-between px-4"
              >
                <span className="text-subtitle text-primary-400">{label}</span>
                <Switch
                  checked={!localCloseDays.includes(value)} // 反轉邏輯：不在 closeDays 中表示為開啟狀態
                  onChange={() => handleToggleDay(value)}
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              outline
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={handleSave}>
              儲存
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseDaysDialog;
