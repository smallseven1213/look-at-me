import React, { useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ToastProvider,
  Toast,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "../../components/Toast";
import { useHospitalPromotion } from "../../hooks/useHospitalPromotion";
import { useHospitalStore } from "../../stores/hospitalStore";
import { setHospitalPromotion } from "../../services/hospitalPromotionService";
import Input from "../../components/Input";
import TextArea from "../../components/TextArea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import PageHeaderTitle from "../../components/PageHeaderTitle";
import PagePadding from "../../components/PagePadding";
import { HospitalPromotion } from "../../types/hospitalPromotion";
import { useUserStore } from "../../hooks/useUserStore";

export default function PromotionPage() {
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { promotion, isLoading, refresh } = useHospitalPromotion(hospitalId);
  const { user } = useUserStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HospitalPromotion>({
    defaultValues: {
      title: promotion?.title || "",
      description: promotion?.description || "",
    },
  });

  useEffect(() => {
    if (promotion) {
      reset({
        title: promotion.title,
        description: promotion.description,
      });
    }
  }, [promotion, reset]);

  const [open, setOpen] = React.useState(false);
  const [toastData, setToastData] = React.useState<{
    title: string;
    description: string;
    variant: "success" | "error";
  }>({
    title: "",
    description: "",
    variant: "success",
  });

  const onSubmit = useCallback(
    async (data: HospitalPromotion) => {
      if (!hospitalId) return;

      try {
        await setHospitalPromotion(
          hospitalId,
          {
            title: data.title,
            description: data.description,
          },
          user?.token
        );
        setToastData({
          title: "成功",
          description: "已成功儲存促銷資訊",
          variant: "success",
        });
        setOpen(true);
        refresh();
      } catch (error) {
        setToastData({
          title: "錯誤",
          description: "儲存促銷資訊失敗",
          variant: "error",
        });
        setOpen(true);
      }
    },
    [hospitalId, user, setToastData, setOpen, refresh]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ToastProvider swipeDirection="right">
      <div className="flex flex-col h-full">
        <PageHeader>
          <PageHeaderTitle title="優惠說明" />
        </PageHeader>
        <div className="flex-1 overflow-y-scroll">
          <PagePadding>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-primary-400">註冊優惠</label>
                <div className="py-2 px-3 bg-gray-100 mt-1 rounded">
                  免掛號費
                </div>
              </div>
              <div>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "請輸入綁定優惠" }}
                  render={({ field }) => (
                    <Input
                      label="綁定優惠"
                      {...field}
                      error={errors.title?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "請輸入限時優惠" }}
                  render={({ field }) => (
                    <TextArea
                      label="限時優惠"
                      rows={15}
                      {...field}
                      error={errors.description?.message}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-primary-400">免責聲明</label>
                <p className="py-2 px-3 bg-gray-100 mt-1 rounded whitespace-normal break-words">
                  平台責任限制
                  <br />•
                  用戶瞭解並同意，本平台內容可能涉及本公司之合作夥伴所擁有、控制或營運之其他網站（連結）；本公司不保證該等網站上任何資訊之準確性、有效性、安全性和完整性，亦不保證該等網站之隱私權保障；該等網站之內容、產品、廣告和其他任何資訊，均應由用戶自行判斷並承擔風險，而與本公司無涉。
                  <br />•
                  用戶瞭解並同意，經由本平台下載或取得之任何資料，應由用戶自行考量且自負風險，用戶因資料下載而導致之任何損失應由用戶自行承擔；本平台不保證外部連結之準確性、有效性、安全性和完整性；本平台對於該等外部連結指向之網頁內容，不承擔任何責任。
                  <br />•
                  用戶瞭解並同意，於任何情況下，本平台因用戶於本平台上進行服務交易所承擔之責任總額，應以用戶所給付之該次服務費用為上限（即不超過用戶所給付之當次服務費用）。
                  <br />•
                  用戶瞭解並同意，自本公司及本公司之人員或經由本平台服務取得之建議或資訊（如依程式所搜尋或推薦之服務人員資訊等），無論係書面或口頭，均不構成本平台對用戶之任何承諾或保證。
                  <br />•
                  用戶瞭解並同意，本平台僅提供用戶連結至第三方，以達協助推銷第三方商品之目的，交易關係係直接成立於會員與第三方之間，一切交易糾紛均與本平台無涉。
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit">儲存</Button>
              </div>
              <div className="h-20"></div>
            </form>
          </PagePadding>
        </div>
      </div>
      <Toast onOpenChange={setOpen} open={open} variant={toastData.variant}>
        <div className="grid gap-1">
          <ToastTitle>{toastData.title}</ToastTitle>
          <ToastDescription>{toastData.description}</ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
