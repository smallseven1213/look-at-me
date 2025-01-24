import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/Dialog";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { createReserveCard } from "../../services/reserveCardService";
import { useHospitalStore } from "../../stores/hospitalStore";
import { useUserStore } from "../../hooks/useUserStore";

interface CreateReserveCardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormValues {
  customCardNo: string;
  phoneNumber: string;
}

const CreateReserveCardDialog: React.FC<CreateReserveCardDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const { hospitalId } = useHospitalStore();
  const { user } = useUserStore();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: {
      customCardNo: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      clearErrors();

      if (!data.phoneNumber) {
        setError("phoneNumber", { message: "請輸入手機號碼" });
        return;
      }

      if (!hospitalId) {
        setError("root", { message: "請先選擇醫院" });
        return;
      }

      await createReserveCard(
        {
          reservedCardNo: data.customCardNo,
          tier: "STANDARD",
          reservedForPhoneNumber: data.phoneNumber,
          hospitalId,
        },
        user?.token
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      setError("root", {
        message: error?.response?.data.message ?? "建立預購卡失敗",
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增預購卡</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="py-4 px-6">
            <div className="px-6 py-2">
              <Controller
                name="customCardNo"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Za-z0-9]{7}$/,
                    message: "卡號必須為7位英數字",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    maxLength={7}
                    label="自訂卡號(7位英數字)"
                    placeholder="請輸入自訂卡號"
                    error={errors.root?.message || errors.customCardNo?.message}
                  />
                )}
              />
            </div>

            <div className="px-6 py-2">
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  pattern: {
                    value: /^09\d{8}$/,
                    message: "手機號碼格式必須為09開頭加8碼數字",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    maxLength={10}
                    label="手機號碼"
                    placeholder="請輸入手機號碼"
                    error={errors.root?.message || errors.phoneNumber?.message}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" outline>
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              儲存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog.Root>
  );
};

export default CreateReserveCardDialog;
