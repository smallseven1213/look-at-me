import React from "react";
import Button from "../../components/Button";
import { shallow } from "zustand/shallow";
import { usePetCardStore } from "./usePetCardStore";

interface BatchOperationButtonProps {
  onBatchOperation: () => void;
}

const BatchOperationButton = ({
  onBatchOperation,
}: BatchOperationButtonProps) => {
  // 只訂閱 selectedCount，避免不必要的重新渲染
  const selectedCount = usePetCardStore((state) => state.selectedCount);

  return (
    <div className="relative">
      <Button variant="tertiary" outline onClick={onBatchOperation}>
        開卡作業
      </Button>
      {selectedCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-secondary-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {selectedCount}
        </span>
      )}
    </div>
  );
};

export default BatchOperationButton;
