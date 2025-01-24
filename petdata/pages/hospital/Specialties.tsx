import React from "react";
import Button from "../../components/Button";
import PagePadding from "../../components/PagePadding";

const HospitalSpecialties: React.FC = () => {
  return (
    <PagePadding>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary">新增專科</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* 示例專科卡片 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">內科</h3>
              <div className="space-x-2">
                <button className="text-blue-500">編輯</button>
                <button className="text-red-500">刪除</button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">主治醫師：3人</p>
            <div className="mt-4">
              <span className="text-sm text-gray-600">可預約時段：</span>
              <div className="mt-2 space-y-1 text-sm">
                <div>週一至週五 上午</div>
                <div>週一至週五 下午</div>
              </div>
            </div>
          </div>
          {/* 更多專科卡片 */}
        </div>
      </div>
    </PagePadding>
  );
};

export default HospitalSpecialties;
