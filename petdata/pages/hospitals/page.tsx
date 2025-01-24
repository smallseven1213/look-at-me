import React, { useState, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import Dropdown, { DropdownRef } from "../../components/Dropdown";
import { useHospitals } from "../../hooks/useHospitals";
import { Hospital, HospitalBasic } from "../../types/hospital";
import PageHeader from "../../components/PageHeader";
import PageHeaderTitle from "../../components/PageHeaderTitle";
import PagePadding from "../../components/PagePadding";
import Table from "./Table";
import Pagination from "../../components/Pagination";
import { useHospitalStore } from "../../stores/hospitalStore";

const cityOptions = [
  { value: "", label: "全部城市" },
  { value: "taipei", label: "台北市" },
  { value: "newtaipei", label: "新北市" },
];

type ConditionField =
  | "addressCity"
  | "columnName"
  | "direction"
  | "skip"
  | "take";

const Hospitals = () => {
  const navigate = useNavigate();
  const cityRef = useRef<DropdownRef>(null);
  const [condition, setCondition] = useState({
    addressCity: "",
    columnName: "name",
    direction: 0,
    skip: 0,
    take: 10,
  });

  const { hospitals = [], isLoading } = useHospitals();

  const handleSearch = () => {
    const cityValue = cityRef.current?.getValue();
    setCondition((prev) => ({
      ...prev,
      addressCity: cityValue,
      skip: 0,
    }));
  };

  const handleConditionChange = (
    field: ConditionField,
    value: string | number,
    resetPage: boolean = false
  ) => {
    setCondition((prev) => ({
      ...prev,
      [field]: value,
      ...(resetPage ? { skip: 0 } : {}),
    }));
  };

  const columns: ColumnDef<HospitalBasic>[] = [
    {
      accessorKey: "name",
      header: "醫院名稱",
      cell: ({ row }) => (
        <div
          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
          onClick={() => {
            useHospitalStore
              .getState()
              .setHospital(row.original.id, row.original.name);
            navigate("/app/hospital/info");
          }}
        >
          {row.original.name}
        </div>
      ),
    },
  ];

  // 計算分頁
  const startIndex = condition.skip;
  const endIndex = startIndex + condition.take;
  const paginatedData = hospitals.slice(startIndex, endIndex);

  const currentPage = condition.skip / condition.take + 1;
  const totalPages = Math.ceil(hospitals.length / condition.take);

  return (
    <div>
      <PageHeader>
        <PageHeaderTitle title="醫院列表" />
      </PageHeader>

      <PagePadding>
        {/* <div className="flex gap-4 mb-4 justify-between items-center">
          <div className="flex items-baseline gap-2 w-full">
            <Dropdown ref={cityRef} options={cityOptions} defaultValue={condition.addressCity} />
            <div className="flex-1" />
            <Button onClick={handleSearch}>查詢</Button>
          </div>
        </div> */}

        <Table<HospitalBasic>
          columns={columns}
          dataSource={paginatedData}
          isLoading={isLoading}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={condition.take}
          onPageChange={(page: number) =>
            handleConditionChange("skip", (page - 1) * condition.take)
          }
          onItemsPerPageChange={(items: number) =>
            handleConditionChange("take", items, true)
          }
        />
      </PagePadding>
    </div>
  );
};

export default Hospitals;
