import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/Dialog";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { batchCreateReserveCard } from "../../services/reserveCardService";
import { useHospitalStore } from "../../stores/hospitalStore";
import { useUserStore } from "../../hooks/useUserStore";

interface CreateBatchCardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateBatchCardDialog: React.FC<CreateBatchCardDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const [count, setCount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hospitalId } = useHospitalStore();
  const { user } = useUserStore();

  const handleSubmit = async () => {
    try {
      setError("");
      setIsSubmitting(true);

      const reserveCount = parseInt(count);
      if (isNaN(reserveCount) || reserveCount < 1 || reserveCount > 50) {
        setError("請輸入1-50之間的數字");
        return;
      }

      if (!hospitalId) {
        setError("請先選擇醫院");
        return;
      }

      await batchCreateReserveCard(
        {
          reserveCount,
          hospitalId,
          tier: "STANDARD",
        },
        user?.token
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "批次建立預購卡失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d{1,3}$/.test(value)) {
      setCount(value);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批次新增預購卡</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Input
            label="預購卡數量"
            type="number"
            value={count}
            onChange={handleCountChange}
            placeholder="請輸入數量 (1-50)"
            min={1}
            max={50}
            error={error}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button outline>取消</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog.Root>
  );
};

export default CreateBatchCardDialog;
