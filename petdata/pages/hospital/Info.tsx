import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Input from "../../components/Input";
import PagePadding from "../../components/PagePadding";
import { useHospital } from "../../hooks/useHospital";
import { updateHospital, createHospital } from "../../services/hospitalService";
import Button from "../../components/Button";
import SectionTitle from "../../components/SectionTitle";
import Textarea from "../../components/TextArea";
import {
  ToastProvider,
  Toast,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "../../components/Toast";
import ErrorDialog from "../../components/ErrorDialog";
import { useHospitalStore } from "../../stores/hospitalStore";
import { useUserStore } from "../../hooks/useUserStore";

interface Section {
  name: string;
  startTime: string;
  endTime: string;
}

interface HospitalFormData {
  name: string;
  responsiblePerson?: string;
  email?: string;
  closeDays: number[];
  businessHours?: string;
  sections: Section[];
  addressCity?: string;
  addressDistrict?: string;
  address?: string;
  phoneNo?: string;
  remark?: string;
  licenseNo?: string;
}

const HospitalInfo: React.FC = () => {
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { user } = useUserStore();
  const { hospital, isLoading, error, refresh } = useHospital(hospitalId || "");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HospitalFormData>();

  useEffect(() => {
    if (hospital) {
      reset({
        ...hospital,
        closeDays: hospital?.closeDays?.map(Number) || [],
        businessHours: hospital.businessHours ?? undefined,
        addressCity: hospital.addressCity ?? undefined,
        addressDistrict: hospital.addressDistrict ?? undefined,
        address: hospital.address ?? undefined,
        phoneNo: hospital.phoneNo ?? undefined,
        remark: hospital.remark ?? undefined,
        licenseNo: hospital.licenseNo ?? undefined,
      });
    }
  }, [hospital, error, reset]);

  const onSubmit = async (data: HospitalFormData) => {
    try {
      if (hospitalId) {
        await updateHospital(hospitalId, data, user?.token);
      } else {
        await createHospital(data, user?.token);
      }
      setShowSuccessToast(true);
      refresh();
    } catch (error) {
      setShowErrorDialog(true);
    }
  };

  if (isLoading) return <div>加載中...</div>;

  return (
    <ToastProvider>
      <PagePadding>
        <SectionTitle title="基本資料" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 pb-14">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="醫院名稱"
                {...register("name", { required: "醫院名稱為必填項" })}
                error={errors.name?.message}
              />
              {/* <Input
                label="負責人"
                {...register("responsiblePerson")}
                error={errors.responsiblePerson?.message}
              /> */}
            </div>
            <Input
              label="執業證號"
              {...register("licenseNo")}
              disabled
              error={errors.licenseNo?.message}
            />
            <Input
              label="地址"
              {...register("address")}
              error={errors.address?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="電話"
                {...register("phoneNo")}
                error={errors.phoneNo?.message}
              />
              {/* <Input
                label="電子郵件"
                type="email"
                {...register("email")}
                error={errors.email?.message}
              /> */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="城市"
                {...register("addressCity")}
                error={errors.addressCity?.message}
              />
              <Input
                label="區域"
                {...register("addressDistrict")}
                error={errors.addressDistrict?.message}
              />
            </div>
            <Input
              label="營業時間描述"
              {...register("businessHours")}
              error={errors.businessHours?.message}
            />
            <Textarea label="備註" {...register("remark")} />
            <div className="text-right">
              <Button type="submit" variant="primary">
                儲存
              </Button>
            </div>
          </div>
        </form>
      </PagePadding>

      {/* Toast 提示 */}
      {showSuccessToast && (
        <Toast onOpenChange={setShowSuccessToast} variant="success">
          <ToastTitle>儲存成功</ToastTitle>
          <ToastDescription>資料已儲存完成！</ToastDescription>
        </Toast>
      )}
      <ToastViewport />

      {/* Dialog 錯誤提示 */}
      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        onClick={() => setShowErrorDialog(false)}
      />
    </ToastProvider>
  );
};

export default HospitalInfo;
