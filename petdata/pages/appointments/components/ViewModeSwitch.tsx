import React from "react";
import { useViewModeStore } from "../store/viewMode";

const ViewModeSwitch: React.FC = () => {
  const { viewMode, setViewMode } = useViewModeStore();

  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className={`text-sm ${
          viewMode === "day" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        日報表
      </span>
      <button
        onClick={() => setViewMode(viewMode === "day" ? "week" : "day")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
          ${viewMode === "week" ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${viewMode === "week" ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
      <span
        className={`text-sm ${
          viewMode === "week" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        週報表
      </span>
    </div>
  );
};

export default ViewModeSwitch;
