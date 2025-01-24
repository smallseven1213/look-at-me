import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePetDiarySearch } from "../hooks/usePetDiarySearch";
import { usePetDiarySearchById } from "../hooks/usePetDiarySearchById";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/Dialog";
import Button from "../components/Button";

const SmartMonitorItemDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string | null;
  diaryId: string | null;
}> = ({ open, onOpenChange, petId, diaryId }) => {
  const { care, isLoading } = usePetDiarySearchById(petId, diaryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="80vw">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">照護詳情</DialogTitle>
          <DialogClose asChild />
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-gray-500">載入中...</div>
            </div>
          ) : care ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">
                  {new Date(care.date).toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {care.title}
                </h3>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">
                {care.content || "無內容"}
              </p>
              {care.files && care.files.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {care.files.map((file, index) => (
                    <div
                      key={index}
                      className="cursor-pointer px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                      onClick={() => {
                        window.open(file.presignedUrl, "_blank");
                      }}
                    >
                      📎 附件 {index + 1} {file.fileName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">找不到照護記錄</div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

const SmartMonitor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const petId = searchParams.get("petId");
  const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(null);

  const { cares } = usePetDiarySearch(petId, {
    skip: 0,
    take: 10,
    orders: [
      {
        columnName: "Id",
        direction: 1,
      },
    ],
    searches: [],
  });

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-primary-400 mb-8">寵物照護日誌</h1>

      <div className="space-y-4">
        {cares?.map((care) => (
          <div
            key={care.id}
            className="p-4 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedDiaryId(care.id)}
          >
            <div className="mb-2">
              <div className="text-sm text-gray-500">
                {new Date(care.date).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {care.title}
              </h3>
            </div>

            {/* <p className="text-gray-600 mb-3">{care.content || "無內容"}</p> */}

            {care.files && care.files.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {care.files.map((file, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    📎 附件 {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {(!cares || cares.length === 0) && (
          <div className="text-center py-8 text-gray-500">尚無照護記錄</div>
        )}
      </div>

      <SmartMonitorItemDialog
        open={!!selectedDiaryId}
        onOpenChange={(open) => !open && setSelectedDiaryId(null)}
        petId={petId}
        diaryId={selectedDiaryId}
      />
    </div>
  );
};

export default SmartMonitor;
