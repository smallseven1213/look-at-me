import React from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "../../components/Button";
import ViewModeSwitch from "./components/ViewModeSwitch";
import Dropdown from "../../components/Dropdown";
import { useWorksStore } from "./store/worksStore";

export interface SearchFormData {
  OwnerName?: string;
  OwnerPhoneNo?: string;
  OwnerEmail?: string;
  DoctorName?: string;
  StartTime?: string;
  EndTime?: string;
}

interface SearchPanelProps {
  onSearch: (data: SearchFormData) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch }) => {
  const { control, handleSubmit, reset } = useForm<SearchFormData>();
  const { workNames, currentWorkName, setCurrentWorkName } = useWorksStore();

  const options = [
    { label: "全部", value: null },
    ...workNames.map((name) => ({ label: name, value: name })),
  ];

  const onSubmit = (data: SearchFormData) => {
    onSearch(data);
  };

  const handleReset = () => {
    reset();
    // 清空後立即觸發搜尋，傳入空的搜尋條件
    onSearch({
      OwnerName: "",
      OwnerPhoneNo: "",
      OwnerEmail: "",
      DoctorName: "",
    });
  };

  return (
    <div className="h-full w-80 bg-white p-4 border-l border-gray-200 overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">視圖模式</h2>
      <ViewModeSwitch />
      <div className="my-4 border-t border-gray-200" />
      <h2 className="text-lg font-medium mb-4">搜尋條件</h2>
      {/* <div className="w-40 mb-4">
        <Dropdown
          value={currentWorkName}
          onChange={setCurrentWorkName}
          options={options}
        />
      </div> */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              醫生姓名
            </label>
            <Controller
              name="DoctorName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="請輸入醫生姓名"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              飼主姓名
            </label>
            <Controller
              name="OwnerName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="請輸入飼主姓名"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              飼主電話
            </label>
            <Controller
              name="OwnerPhoneNo"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="請輸入飼主電話"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              飼主Email
            </label>
            <Controller
              name="OwnerEmail"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="請輸入飼主Email"
                />
              )}
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日期
            </label>
            <Controller
              name="StartTime"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DateDropdown value={value} onChange={onChange} />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              結束日期
            </label>
            <Controller
              name="EndTime"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DateDropdown value={value} onChange={onChange} />
              )}
            />
          </div> */}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleReset}
            className="flex-1"
          >
            清空查詢條件
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            查詢
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchPanel;
