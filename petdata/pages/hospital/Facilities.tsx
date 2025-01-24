import React from "react";
import Button from "../../components/Button";
import PagePadding from "../../components/PagePadding";

const HospitalFacilities: React.FC = () => {
  return (
    <PagePadding>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary">新增設備</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* 示例設備卡片 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">X光機</h3>
              <div className="space-x-2">
                <button className="text-blue-500">編輯</button>
                <button className="text-red-500">刪除</button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">設備編號：</span>
                <span className="text-sm">XR-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">位置：</span>
                <span className="text-sm">放射科室</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">狀態：</span>
                <span className="text-sm text-green-500">正常運作</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">最後檢修：</span>
                <span className="text-sm">2024-01-15</span>
              </div>
            </div>
          </div>
          {/* 更多設備卡片 */}
        </div>
      </div>
    </PagePadding>
  );
};

export default HospitalFacilities;
