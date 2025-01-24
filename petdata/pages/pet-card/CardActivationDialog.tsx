// components/CardActivationDialog.tsx
import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "../../components/Dialog";
import { useOpenCardsQueue } from "./OpenCardsQueueContext";

// 這裡假設有這個服務
// import { cardService } from '../services/cardService';

enum Step {
  CONFIRM = 0,
  FORM = 1,
}

interface CardActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CardActivationDialog: React.FC<CardActivationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CONFIRM);
  const { currentCard, removeFromQueue, queue, clearQueue } =
    useOpenCardsQueue();

  // 重置步驟
  useEffect(() => {
    if (open) {
      setCurrentStep(Step.CONFIRM);
    }
  }, [open, currentCard()]);

  const handleNext = () => {
    setCurrentStep(Step.FORM);
  };

  const handleActivate = async () => {
    try {
      // TODO: 實作開卡邏輯
      // await cardService.createCard(currentCard());
      console.log("開卡成功:", currentCard());

      // 從隊列中移除當前卡片
      removeFromQueue();

      // 檢查隊列是否還有卡片
      if (queue.length <= 1) {
        onOpenChange(false);
      } else {
        // 重置到第一步，準備處理下一張卡
        setCurrentStep(Step.CONFIRM);
      }
    } catch (error) {
      console.error("開卡失敗:", error);
      // TODO: 處理錯誤
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        if (!open) {
          clearQueue();
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="min-h-[300px]">
        <DialogHeader>
          <DialogTitle>
            開卡流程 ({queue.indexOf(currentCard() || "") + 1}/{queue.length})
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {currentStep === Step.CONFIRM ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-body1 text-primary-400 mb-8">
                準備開始處理卡片：{currentCard()}
              </p>
              <Button onClick={handleNext}>下一步</Button>
            </div>
          ) : (
            <div className="h-40">
              <p className="text-body2 text-primary-300">
                這裡是表單內容（待實作）
              </p>
            </div>
          )}
        </DialogBody>

        {currentStep === Step.FORM && (
          <DialogFooter>
            <Button onClick={handleActivate}>標記開卡</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardActivationDialog;
