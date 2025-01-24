import React from "react";

interface ShiftItemProps {
  onClick?: () => void;
}

const ShiftItem: React.FC<ShiftItemProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full h-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 
                flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 
                hover:bg-primary-50 transition-all duration-200 gap-2"
    >
      <span className="font-bold text-gray-700">新增班別</span>
      <span className="text-gray-500 hover:text-primary-500">
        沒有排診間，請點擊排班
      </span>
    </div>
  );
};

export default ShiftItem;
