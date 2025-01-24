import React, { useState, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import Dropdown, { DropdownRef } from "../../components/Dropdown";
import Input from "../../components/Input";
import { useSearchReservedCards } from "../../hooks/useSearchReservedCards";
import {
  ReservedCardDetail,
  ReservedCardSearchOrder,
  ReservedCardSearch,
} from "../../types/reserveCard";
import PageHeader from "../../components/PageHeader";
import PageHeaderTitle from "../../components/PageHeaderTitle";
import PagePadding from "../../components/PagePadding";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import Table from "./Table";
import * as Popover from "@radix-ui/react-popover";
import CreateReserveCardDialog from "./CreateReserveCardDialog";
import CreateBatchCardDialog from "./CreateBatchCardDialog";
import FormInputGroup from "../../components/FormInputGroup";

type ConditionField =
  | "searchKey"
  | "searchValue"
  | "columnName"
  | "direction"
  | "skip"
  | "take";

const searchKeyOptions = [
  { value: "", label: "全部" },
  { value: "ownerName", label: "飼主姓名" },
  { value: "petName", label: "寵物名稱" },
  { value: "hospitalName", label: "醫院名稱" },
  { value: "doctorName", label: "醫生姓名" },
];

const ReserveCards = () => {
  const navigate = useNavigate();
  const searchKeyRef = useRef<DropdownRef>(null);
  const [condition, setCondition] = useState({
    searchKey: "IsConfirmed",
    searchValue: "false",
    columnName: "Id",
    direction: 1,
    skip: 0,
    take: 10,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  const {
    reservedCards = [],
    isLoading,
    refresh,
  } = useSearchReservedCards({
    skip: condition.skip,
    take: condition.take,
    orders: [
      {
        columnName: condition.columnName,
        direction: condition.direction as 0 | 1,
      },
    ],
    searches: condition.searchKey
      ? [
          {
            searchKey: condition.searchKey,
            searchValue: condition.searchValue,
          },
        ]
      : [],
  });

  const handleSearch = () => {
    const searchKeyValue = searchKeyRef.current?.getValue();
    setCondition((prev) => ({
      ...prev,
      searchKey: searchKeyValue,
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

  const columns: ColumnDef<ReservedCardDetail>[] = [
    {
      accessorKey: "cardNo",
      header: "卡號",
    },
    {
      accessorKey: "presignPhoneNo",
      header: "手機號碼",
    },
    {
      accessorKey: "tier",
      header: "等級",
    },
    // {
    //   accessorKey: "hospitalId",
    //   header: "醫院ID",
    // },
  ];

  // 計算分頁
  const startIndex = condition.skip;
  const endIndex = startIndex + condition.take;
  const paginatedData = reservedCards.slice(startIndex, endIndex);

  const currentPage = condition.skip / condition.take + 1;
  const totalPages = Math.ceil(reservedCards.length / condition.take);

  return (
    <div>
      <PageHeader>
        <PageHeaderTitle title="預購卡列表" />
      </PageHeader>

      <PagePadding>
        {/* <div className="flex gap-4 mb-4 justify-between items-center">
          <div className="flex items-baseline gap-2 w-full">
            <FormInputGroup>
              <Dropdown
                ref={searchKeyRef}
                options={searchKeyOptions}
                defaultValue={condition.searchKey}
              />
              <Input
                placeholder="請輸入搜尋內容"
                value={condition.searchValue}
                onChange={(e) =>
                  handleConditionChange("searchValue", e.target.value)
                }
                className="flex-1"
              />
            </FormInputGroup>
            <Button onClick={handleSearch}>查詢</Button>
          </div>
        </div> */}

        {/**開卡 */}
        <div className="mb-4 flex justify-end items-center">
          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Popover.Trigger>
              <Button variant="tertiary" outline>
                新增卡片
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-white rounded-lg shadow-xl p-2 w-[200px] border border-gray-200"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <button
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-100"
                    onClick={() => {
                      setCreateDialogOpen(true);
                      setPopoverOpen(false);
                    }}
                  >
                    新增一張卡片
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-100"
                    onClick={() => {
                      setBatchDialogOpen(true);
                      setPopoverOpen(false);
                    }}
                  >
                    新增多張卡片
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        <Table data={paginatedData} columns={columns} isLoading={isLoading} />

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            共 {reservedCards.length} 筆資料
          </div>
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
        </div>
      </PagePadding>

      <CreateReserveCardDialog
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refresh}
      />

      <CreateBatchCardDialog
        isOpen={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        onSuccess={refresh}
      />
    </div>
  );
};

export default ReserveCards;
