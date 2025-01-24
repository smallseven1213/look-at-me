import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import PagePadding from "../../components/PagePadding";
import { useDoctors } from "../../hooks/useDoctors";
import {
  DoctorDetail,
  DoctorStatus,
  CreateDoctorPayload,
  UpdateDoctorPayload,
  VetSpecialty,
  VetSpecialtyChineseMap,
} from "../../types/doctor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "../../components/Dialog";
import Input from "../../components/Input";
import {
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../services/doctorService";
import { useForm, Controller } from "react-hook-form";
import Dropdown from "../../components/Dropdown";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import Avatar from "../../components/Avatar";
import {
  ToastProvider,
  Toast,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "../../components/Toast";
import ErrorDialog from "../../components/ErrorDialog";
import Badge from "../../components/Badge";
import { useUserStore } from "../../hooks/useUserStore";
import { useHospitalStore } from "../../stores/hospitalStore";

const specialtyOptions = [
  { value: VetSpecialty.FamilyMedicine, label: "家醫科" },
  { value: VetSpecialty.InternalMedicine, label: "內科" },
  { value: VetSpecialty.Surgery, label: "外科" },
  { value: VetSpecialty.Oncology, label: "腫瘤" },
  { value: VetSpecialty.RegenerativeMedicine, label: "再生醫學治療" },
  { value: VetSpecialty.ExoticPets, label: "特寵" },
];

const statusOptions = [
  { value: DoctorStatus.Active, label: "啟用" },
  { value: DoctorStatus.Inactive, label: "未啟用" },
  // { value: DoctorStatus.Deleted, label: "已刪除" },
];

const HospitalDoctors: React.FC = () => {
  const { user } = useUserStore();
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { doctors, isLoading, error, refresh } = useDoctors(hospitalId);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetail | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorDetail | null>(
    null
  );
  const [apiError, setApiError] = useState(null);
  const [showNameChangeDialog, setShowNameChangeDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorDetail>();

  const watchedName = "";

  const onSubmit = async (data: any) => {
    try {
      // 確保 specialties 是有效的數字陣列
      const specialties = Array.isArray(data.specialties)
        ? data.specialties.filter(Boolean).map(Number)
        : [];

      const formattedData = {
        ...data,
        specialties,
        status: Number(data.status),
      };

      setFormDataToSubmit(formattedData);

      // 如果是編輯模式且醫師姓名有變更，顯示確認對話框
      if (
        selectedDoctor &&
        selectedDoctor.id &&
        selectedDoctor.name !== formattedData.name
      ) {
        setShowNameChangeDialog(true);
        return;
      }

      // 如果是新增或沒有修改姓名，直接提交
      await submitDoctorData(formattedData);
    } catch (error) {
      console.error("Error saving doctor:", error);
      // setApiError(error);
      setShowErrorDialog(true);
    }
  };

  const submitDoctorData = async (formattedData: any) => {
    try {
      if (selectedDoctor && selectedDoctor.id) {
        const updatePayload: UpdateDoctorPayload = formattedData;
        await updateDoctor(
          hospitalId || "",
          selectedDoctor.id,
          updatePayload,
          user?.token
        );
      } else {
        const createPayload: CreateDoctorPayload = formattedData;
        if (hospitalId) {
          await createDoctor(hospitalId, createPayload, user?.token);
        }
      }

      await refresh();
      setShowSuccessToast(true);
      handleDialogClose();
    } catch (error) {
      console.error("Error submitting doctor data:", error);
    }
  };

  const handleCardClick = (doctor: DoctorDetail) => {
    setSelectedDoctor(doctor);
    initializeForm(doctor);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedDoctor(null);
    reset();
  };

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    initializeForm(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (doctor: DoctorDetail) => {
    setDoctorToDelete(doctor);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (doctorToDelete) {
      try {
        await deleteDoctor(hospitalId || "", doctorToDelete.id, user?.token);
        await refresh();
        setShowSuccessToast(true);
        setShowDeleteDialog(false);
      } catch (error) {
        console.error("刪除失敗：", error);
        setShowErrorDialog(true);
      }
    }
  };

  const getCardClassName = (status: DoctorStatus): string => {
    switch (status) {
      case DoctorStatus.Active:
        return "";
      case DoctorStatus.Inactive:
        return "opacity-70";
      case DoctorStatus.Deleted:
        return "opacity-50 bg-secondary-gray-light";
      default:
        return "";
    }
  };

  // 新增狀態標籤的函數
  const getStatusBadge = (
    status: DoctorStatus
  ): { label: string; variant: "success" | "warning" | "error" } => {
    switch (status) {
      case DoctorStatus.Active:
        return { label: "啟用", variant: "success" };
      case DoctorStatus.Inactive:
        return { label: "未啟用", variant: "warning" };
      case DoctorStatus.Deleted:
        return { label: "已刪除", variant: "error" };
      default:
        return { label: "未知", variant: "warning" };
    }
  };

  const initializeForm = (doctor: DoctorDetail | null) => {
    if (doctor) {
      // 編輯模式：將現有資料轉換為表單格式
      reset({
        name: doctor.name,
        licenseNo: doctor.licenseNo,
        specialties: doctor.specialties.map((code) => code),
        status: doctor.status,
      });
    } else {
      // 新增模式：設定預設值
      reset({
        name: "",
        licenseNo: "",
        specialties: [],
        status: DoctorStatus.Active,
      });
    }
  };

  useEffect(() => {
    initializeForm(selectedDoctor);
  }, [selectedDoctor]);

  if (isLoading) {
    return (
      <PagePadding>
        <p>載入中...</p>
      </PagePadding>
    );
  }

  return (
    <ToastProvider>
      <PagePadding>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleAddDoctor}>
              新增醫師
            </Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <p>載入中...</p>
            ) : doctors.filter((doctor) => doctor.status !== -1).length ===
              0 ? (
              <p>暫無醫師資訊</p>
            ) : (
              doctors
                .filter((doctor) => doctor.status !== -1)
                .map((doctor) => {
                  const statusBadge = getStatusBadge(doctor.status);
                  return (
                    <div
                      key={doctor.id}
                      className={`flex items-center space-x-4 p-4 border rounded-lg ${getCardClassName(
                        doctor.status
                      )}`}
                    >
                      <div className="flex-1 flex space-x-4">
                        <Avatar
                          name={doctor.name}
                          imageUrl={"/path/to/profile-image.jpg"}
                          size={48}
                        />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-h5 font-bold text-primary-600">
                              {doctor.name}
                            </span>
                          </div>
                          <span className="text-body2 text-primary-600">
                            專科:{" "}
                            {doctor.specialties
                              .map(
                                (code) =>
                                  VetSpecialtyChineseMap[code as VetSpecialty]
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                      <div className="w-40 flex items-end space-x-4 text-primary-400">
                        <button onClick={() => handleCardClick(doctor)}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(doctor)}>
                          <Trash2 size={16} />
                        </button>
                        {/* <button>
                        <MoreHorizontal size={16} />
                      </button> */}
                        <Badge
                          label={statusBadge.label}
                          variant={statusBadge.variant}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <form
                id="doctorForm"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>
                    {selectedDoctor && selectedDoctor.id
                      ? "編輯醫師資料"
                      : "新增醫師"}
                  </DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "請輸入醫師姓名" }}
                    render={({ field }) => (
                      <Input
                        label="醫師姓名"
                        {...field}
                        error={errors.name?.message}
                      />
                    )}
                  />
                  <Controller
                    name="licenseNo"
                    control={control}
                    rules={{ required: "請輸入執照號碼" }}
                    render={({ field }) => (
                      <Input
                        label="執照號碼"
                        {...field}
                        error={errors.licenseNo?.message}
                      />
                    )}
                  />
                  <Controller
                    name="specialties"
                    control={control}
                    rules={{ required: "請選擇專長" }}
                    render={({ field }) => {
                      // 將 specialties array 轉換為 dropdown 需要的格式
                      const value = Array.isArray(field.value)
                        ? field.value
                        : [];

                      return (
                        <Dropdown
                          label="專長"
                          options={specialtyOptions}
                          isMulti
                          value={value}
                          onChange={(codes) => {
                            field.onChange(codes);
                          }}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        label="狀態"
                        options={statusOptions}
                        {...field}
                      />
                    )}
                  />
                </DialogBody>
                <DialogFooter>
                  <Button
                    variant="tertiary"
                    onClick={handleDialogClose}
                    className="w-24"
                  >
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    form="doctorForm"
                    className="w-24"
                  >
                    儲存
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DeleteConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDeleteConfirm}
            description="確定要刪除這位醫師嗎？此操作無法復原。"
          />

          {/* 確認修改醫師姓名的對話框 */}
          <Dialog
            open={showNameChangeDialog}
            onOpenChange={setShowNameChangeDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>確認修改醫師姓名</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p>
                  您確定要將醫師姓名從「{selectedDoctor?.name}」改為「
                  {formDataToSubmit?.name}」嗎？
                </p>
                <p className="text-red-500 mt-2">
                  注意：修改醫師姓名可能會影響到相關的預約記錄。
                </p>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="tertiary"
                  onClick={() => setShowNameChangeDialog(false)}
                  className="w-24"
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    submitDoctorData(formDataToSubmit);
                    setShowNameChangeDialog(false);
                  }}
                  className="w-24"
                >
                  確認
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
        </div>
      </PagePadding>
    </ToastProvider>
  );
};

export default HospitalDoctors;
