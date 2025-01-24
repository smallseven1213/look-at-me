// import React, { useRef, useState } from "react";
// import Button from "../../components/Button";
// import {
//   getDayOfWeekText,
//   useHospitalScheduleTemplate,
// } from "../../hooks/useHospitalScheduleTemplate";
// import { ScheduleDay } from "../../types/schedule";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogBody,
//   DialogClose,
// } from "../../components/Dialog";
// import { useParams } from "react-router-dom";
// import { updateHospitalWeeklySchedule } from "../../services/hospitalScheduleService";
// import ScheduleForm, { ScheduleFormRef } from "./consultation/ScheduleForm";
// import PagePadding from "../../components/PagePadding";
// import ScheduleCard from "./consultation/ScheduleCard";
// import { generateMonthlySchedule } from "../../services/hospitalMonthlyScheduleService";
// import {
//   Toast,
//   ToastDescription,
//   ToastProvider,
//   ToastTitle,
//   ToastViewport,
// } from "../../components/Toast";
// import generateSchedulePDF from "./consultation/SchedulePDFGenerator";
// import { useHospital } from "../../hooks/useHospital";
// import { updateHospital } from "../../services/hospitalService";
// import { Settings } from "lucide-react";
// import CloseDaysDialog from "./consultation/CloseDaysDialog";
// import { useHospitalStore } from "../../stores/hospitalStore";
// import Switch from "../../components/Switch";
// import { useUserStore } from "../../hooks/useUserStore";
// import ShiftItem from "./consultation/ShiftItem";

// const SHIFT_TYPES = [
//   { name: "早班", defaultStartTime: "08:00", defaultEndTime: "12:00" },
//   { name: "午班", defaultStartTime: "14:00", defaultEndTime: "17:00" },
//   { name: "晚班", defaultStartTime: "18:00", defaultEndTime: "22:00" },
// ] as const;

// const Consultation: React.FC = () => {
//   const { user } = useUserStore();
//   const hospitalId = useHospitalStore((state) => state.hospitalId);
//   const {
//     hospital,
//     isLoading: isLoadingHospital,
//     refresh: refreshHospital,
//   } = useHospital(hospitalId ?? "");
//   const [isCloseDaysDialogOpen, setIsCloseDaysDialogOpen] = useState(false);
//   const currentDate = new Date();
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState({
//     title: "",
//     description: "",
//   });

//   const { template, isLoading, error, refresh } = useHospitalScheduleTemplate(
//     hospitalId ?? ""
//   );

//   const formRef = useRef<ScheduleFormRef>(null);

//   const [localSchedules, setLocalSchedules] = useState<ScheduleDay[]>(
//     template ?? []
//   );
//   const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDay | null>(
//     null
//   );
//   const [isEditDialogOpen, setEditDialogOpen] = useState(false);
//   const [isNewSchedule, setIsNewSchedule] = useState(false);

//   React.useEffect(() => {
//     if (template) {
//       setLocalSchedules(template);
//     }
//   }, [template]);

//   const [editingScheduleIndex, setEditingScheduleIndex] = useState<
//     number | null
//   >(null);

//   const handleEditClick = (schedule: ScheduleDay) => {
//     const indexInLocalSchedules = localSchedules.findIndex(
//       (s) => s.id === schedule.id
//     );
//     setSelectedSchedule(schedule);
//     setEditingScheduleIndex(indexInLocalSchedules);
//     setIsNewSchedule(false);
//     setEditDialogOpen(true);
//   };

//   const handleAddClick = (
//     dayOfWeek: number,
//     shiftType: (typeof SHIFT_TYPES)[number]
//   ) => {
//     setSelectedSchedule({
//       dayOfWeek,
//       section: {
//         name: shiftType.name,
//         startTime: shiftType.defaultStartTime,
//         endTime: shiftType.defaultEndTime,
//       },
//       works: [],
//     });
//     setEditingScheduleIndex(null);
//     setIsNewSchedule(true);
//     setEditDialogOpen(true);
//   };

//   const handleDelete = async () => {
//     if (selectedSchedule) {
//       const newSchedules = localSchedules.filter(
//         (schedule) => schedule.id !== selectedSchedule.id
//       );

//       await updateSchedules(newSchedules);

//       // Reset state variables
//       setEditDialogOpen(false);
//       setSelectedSchedule(null);
//       setIsNewSchedule(false);
//       setEditingScheduleIndex(null);
//     }
//   };

//   // 產生所有天數的陣列（0-6）
//   const allDays = Array.from({ length: 7 }, (_, i) => i);

//   // 根據現有資料分組
//   const groupedSchedules: { [key: number]: ScheduleDay[] } = {};
//   allDays.forEach((day) => {
//     groupedSchedules[day] = localSchedules.filter(
//       (schedule) => schedule.dayOfWeek === day
//     );
//   });

//   const handleSaveAll = async () => {
//     try {
//       const transformedSchedules = localSchedules.map((schedule) => ({
//         ...schedule,
//         works: schedule.works.map((work) => ({
//           ...work,
//           doctor: work.doctor ?? {
//             name: "",
//             specialties: [],
//           },
//         })),
//       }));

//       await updateHospitalWeeklySchedule(
//         hospitalId ?? "",
//         transformedSchedules,
//         user?.token
//       );

//       setToastMessage({
//         title: "儲存成功",
//         description: "排班設定已更新",
//       });
//       setShowToast(true);
//       refresh();
//     } catch (error) {
//       console.error("Error saving schedules:", error);
//       setToastMessage({
//         title: "儲存失敗",
//         description: "排班設定更新失敗",
//       });
//       setShowToast(true);
//     }
//   };

//   const handleGenerateMonthlySchedule = async () => {
//     if (!hospitalId) return;

//     setIsGenerating(true);
//     try {
//       await generateMonthlySchedule(
//         hospitalId,
//         {
//           year: currentDate.getFullYear(),
//           month: currentDate.getMonth() + 1,
//         },
//         user?.token
//       );

//       setToastMessage({
//         title: "套用成功",
//         description: "已成功套用本月班表",
//       });
//       setShowToast(true);

//       // 重新獲取資料
//       refresh();
//     } catch (error) {
//       setToastMessage({
//         title: "套用失敗",
//         description: "套用本月班表時發生錯誤",
//       });
//       setShowToast(true);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleSaveCloseDays = async (newCloseDays: number[]) => {
//     if (!hospital || !hospitalId) return;

//     try {
//       await updateHospital(
//         hospitalId,
//         {
//           ...hospital,
//           closeDays: newCloseDays,
//           businessHours: hospital.businessHours ?? undefined,
//           addressCity: hospital.addressCity ?? undefined,
//           addressDistrict: hospital.addressDistrict ?? undefined,
//           address: hospital.address ?? undefined,
//           phoneNo: hospital.phoneNo ?? undefined,
//           remark: hospital.remark ?? undefined,
//         },
//         user?.token
//       );
//       refreshHospital();
//     } catch (error: any) {
//       const message = error.response?.data?.message || "更新失敗";
//       setErrorMessage(message);
//       setIsErrorDialogOpen(true);
//     }
//   };

//   const handleConfirmCloseDayChange = () => {
//     if (!pendingCloseDayChange) return;

//     handleSaveCloseDays(pendingCloseDayChange.newCloseDays);
//     refreshHospital();
//     setIsConfirmDialogOpen(false);
//     setPendingCloseDayChange(null);
//   };

//   const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
//   const [pendingCloseDayChange, setPendingCloseDayChange] = useState<{
//     dayIndex: number;
//     newCloseDays: number[];
//   } | null>(null);

//   const handleCloseDayToggle = (dayIndex: number, checked: boolean) => {
//     if (!hospital || !hospitalId) return;

//     const newCloseDays = checked
//       ? hospital.closeDays.filter((day) => day !== dayIndex)
//       : [...hospital.closeDays, dayIndex];

//     // 如果是要設定為休診日，檢查是否有排班
//     if (!checked) {
//       const hasSchedules = localSchedules.some(
//         (schedule) => schedule.dayOfWeek === dayIndex
//       );

//       if (hasSchedules) {
//         setPendingCloseDayChange({ dayIndex, newCloseDays });
//         setIsConfirmDialogOpen(true);
//         return;
//       }
//     }

//     handleSaveCloseDays(newCloseDays);
//     refreshHospital();
//   };

//   // Add this function to your component
//   const updateSchedules = async (newSchedules: ScheduleDay[]) => {
//     setLocalSchedules(newSchedules);

//     try {
//       const transformedSchedules = newSchedules.map((schedule) => ({
//         ...schedule,
//         works: schedule.works.map((work) => ({
//           ...work,
//           doctor: work.doctor ?? {
//             name: "",
//             specialties: [],
//           },
//         })),
//       }));

//       await updateHospitalWeeklySchedule(
//         hospitalId ?? "",
//         transformedSchedules,
//         user?.token
//       );

//       setToastMessage({
//         title: "儲存成功",
//         description: "排班設定已更新",
//       });
//       setShowToast(true);
//       refresh();
//     } catch (error) {
//       console.error("Error saving schedules:", error);
//       setToastMessage({
//         title: "儲存失敗",
//         description: "排班設定更新失敗",
//       });
//       setShowToast(true);
//     }
//   };

//   const handleDeleteShift = (
//     dayIndex: number,
//     shiftType: (typeof SHIFT_TYPES)[number]
//   ) => {
//     console.log("dayIndex", dayIndex);
//     const updatedSchedules = localSchedules.filter(
//       (schedule) =>
//         !(
//           schedule.dayOfWeek === dayIndex &&
//           schedule.section.name === shiftType.name
//         )
//     );
//     setLocalSchedules(updatedSchedules);
//   };

//   return (
//     <ToastProvider>
//       <PagePadding>
//         {isLoading && <p>Loading...</p>}
//         {error && <p>Error loading schedule template</p>}
//         <div className="flex justify-between items-center">
//           {isLoadingHospital || !hospital ? (
//             <div className="animate-pulse flex space-x-4 w-full">
//               <div className="h-8 bg-gray-200 rounded w-1/2"></div>
//               <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//             </div>
//           ) : (
//             <></>
//           )}
//         </div>
//         <div className="mt-6 space-y-6">
//           {Array.from({ length: 7 }).map((_, dayIndex) => {
//             const daySchedules = localSchedules.filter(
//               (schedule) => schedule.dayOfWeek === dayIndex
//             );
//             const isClosedDay = hospital?.closeDays.includes(dayIndex) || false;

//             return (
//               <div key={dayIndex} className="space-y-2">
//                 <div className="flex items-center">
//                   <h3 className="text-lg font-medium text-gray-700">
//                     {getDayOfWeekText(dayIndex)}
//                   </h3>
//                   <div className="ml-5">
//                     <Switch
//                       checked={!isClosedDay}
//                       onChange={(checked) =>
//                         handleCloseDayToggle(dayIndex, checked)
//                       }
//                       size="sm"
//                     />
//                     <span className="ml-2 text-sm text-gray-500">
//                       {isClosedDay ? "休診日" : "看診日"}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                   {isClosedDay ? (
//                     <div
//                       className="col-span-3 h-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200
//                                  flex flex-col items-center justify-center"
//                     >
//                       <span className="text-lg text-gray-500">
//                         本日為休診日
//                       </span>
//                     </div>
//                   ) : (
//                     SHIFT_TYPES.map((shiftType) => (
//                       <div
//                         key={`${dayIndex}-${shiftType.name}`}
//                         className="w-full"
//                       >
//                         <ShiftItem
//                           shiftType={shiftType}
//                           onClick={() => handleAddClick(dayIndex, shiftType)}
//                           onDelete={() =>
//                             handleDeleteShift(dayIndex, shiftType)
//                           }
//                         />
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="mt-6 flex justify-between items-center">
//           <div className="flex">
//             <Button
//               onClick={() => generateSchedulePDF(localSchedules)}
//               variant="secondary"
//               outline
//             >
//               輸出班表至PDF(測試)
//             </Button>
//             <div className="w-4" />
//             <Button
//               onClick={handleGenerateMonthlySchedule}
//               variant="secondary"
//               disabled={isGenerating}
//             >
//               套用至本月班表
//             </Button>
//           </div>
//           {/* <Button onClick={handleSaveAll}>儲存</Button> */}
//         </div>

//         <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
//           <DialogContent width="90%" height="90vh">
//             <DialogHeader>
//               <DialogTitle>
//                 {isNewSchedule ? "新增班次" : "編輯排班"}
//               </DialogTitle>
//               <DialogClose />
//             </DialogHeader>
//             <DialogBody>
//               <ScheduleForm
//                 ref={formRef}
//                 schedule={selectedSchedule}
//                 isNew={isNewSchedule}
//                 isMonthly={false}
//                 onClose={() => {
//                   setEditDialogOpen(false);
//                   setSelectedSchedule(null);
//                   setIsNewSchedule(false);
//                   setEditingScheduleIndex(null);
//                 }}
//                 onSave={async (updatedSchedule) => {
//                   let newSchedules;

//                   if (isNewSchedule) {
//                     newSchedules = [...localSchedules, updatedSchedule];
//                   } else if (selectedSchedule) {
//                     newSchedules = localSchedules.map((schedule) =>
//                       schedule.id === updatedSchedule.id
//                         ? updatedSchedule
//                         : schedule
//                     );
//                   } else {
//                     newSchedules = localSchedules;
//                   }

//                   await updateSchedules(newSchedules);

//                   // Reset state variables
//                   setEditDialogOpen(false);
//                   setSelectedSchedule(null);
//                   setIsNewSchedule(false);
//                   setEditingScheduleIndex(null);
//                 }}
//               />
//             </DialogBody>
//             <DialogFooter className="flex justify-between">
//               <div>
//                 {!isNewSchedule && (
//                   <Button
//                     type="button"
//                     className="bg-secondary-red hover:bg-badgeText-error text-true-white"
//                     onClick={handleDelete}
//                   >
//                     刪除
//                   </Button>
//                 )}
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   type="button"
//                   variant="secondary"
//                   outline
//                   onClick={() => setEditDialogOpen(false)}
//                 >
//                   取消
//                 </Button>
//                 <Button type="button" onClick={() => formRef.current?.submit()}>
//                   儲存
//                 </Button>
//               </div>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//         {showToast && (
//           <Toast
//             variant={toastMessage.title.includes("成功") ? "success" : "error"}
//             open={showToast}
//             onOpenChange={setShowToast}
//           >
//             <ToastTitle>{toastMessage.title}</ToastTitle>
//             <ToastDescription>{toastMessage.description}</ToastDescription>
//           </Toast>
//         )}
//         <ToastViewport />
//         <CloseDaysDialog
//           open={isCloseDaysDialogOpen}
//           onOpenChange={setIsCloseDaysDialogOpen}
//           closeDays={hospital?.closeDays ?? []}
//           onSave={handleSaveCloseDays}
//         />
//         <Dialog
//           open={isConfirmDialogOpen}
//           onOpenChange={(open) => {
//             setIsConfirmDialogOpen(open);
//             if (!open) setPendingCloseDayChange(null);
//           }}
//         >
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>確認設定休診日</DialogTitle>
//             </DialogHeader>
//             <DialogBody>
//               <p>已有排班，是否要設定為休診日?</p>
//             </DialogBody>
//             <DialogFooter className="flex justify-end space-x-2">
//               <Button
//                 variant="secondary"
//                 onClick={() => setIsConfirmDialogOpen(false)}
//               >
//                 取消
//               </Button>
//               <Button variant="primary" onClick={handleConfirmCloseDayChange}>
//                 確認
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//         <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>錯誤</DialogTitle>
//             </DialogHeader>
//             <DialogBody>
//               <p>{errorMessage}</p>
//             </DialogBody>
//             <DialogFooter className="flex justify-end">
//               <Button
//                 variant="primary"
//                 onClick={() => setIsErrorDialogOpen(false)}
//               >
//                 確認
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </PagePadding>
//     </ToastProvider>
//   );
// };

// export default Consultation;

const EmptyComponent: React.FC = () => {
  return null;
};

export default EmptyComponent;
