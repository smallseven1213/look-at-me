import React, { useState, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { usePetCards } from "../../hooks/usePetCards";
import Button from "../../components/Button";
import Dropdown, { DropdownRef } from "../../components/Dropdown";
import { ApiPaginationParams, CardConditionParams } from "../../types";
import { useOpenCardsQueue } from "./OpenCardsQueueContext";
import CardActivationDialog from "./CardActivationDialog";
import BatchOperationButton from "./BatchOperationButton";
import { usePetCardStore } from "./usePetCardStore";
import Pagination from "../../components/Pagination";
import Table from "./Table";
import PageHeaderTitle from "../../components/PageHeaderTitle";
import PagePadding from "../../components/PagePadding";
import PageHeader from "../../components/PageHeader";

const options = [
  { value: 0, label: "未開卡" },
  { value: 1, label: "已開卡" },
];

type ConditionField = "status" | "columnName" | "direction" | "skip" | "take";

const mockData = {
  totalCount: 3,
  results: [
    {
      id: "guid-123",
      petName: "Fido",
      ownerName: "John Doe",
      idcard: "A123456789",
      phone: "0912345678",
      other: "No allergies",
      status: 1,
    },
    {
      id: "guid-456",
      petName: "Whiskers",
      ownerName: "Jane Smith",
      idcard: "B987654321",
      phone: "0987654321",
      other: "Requires special diet",
      status: 0,
    },
    {
      id: "guid-789",
      petName: "Buddy",
      ownerName: "Alice Johnson",
      idcard: "C135792468",
      phone: "0922334455",
      other: "Friendly with children",
      status: 1,
    },
  ],
};

const PetCard = () => {
  const statusRef = useRef<DropdownRef>(null);
  const [condition, setCondition] = useState<
    CardConditionParams & ApiPaginationParams
  >({
    status: 0,
    columnName: "cardNo",
    direction: 0,
    skip: 0,
    take: 10,
  });
  const [openActivationDialog, setOpenActivationDialog] = useState(false);
  const { addToQueue } = useOpenCardsQueue();
  const { selectedIds, setSelected } = usePetCardStore();

  // for batch select
  const handleBatchOperation = () => {
    const selectedKeys = Object.keys(selectedIds);
    if (selectedKeys.length === 0) return;

    // 將選中的卡片加入隊列
    addToQueue(selectedKeys);
    // 打開開卡流程 Dialog
    setOpenActivationDialog(true);
  };

  // for select one
  const handleActivateCard = (cardId: string) => {
    // Add the specific card ID to the queue
    addToQueue([cardId]);
    // Open the activation dialog
    setOpenActivationDialog(true);
  };

  const handleSelectItemChange = (selectedKeys: string[]) => {
    setSelected(selectedKeys);
  };

  const handleSearch = () => {
    const statusValue = statusRef.current?.getValue();
    setCondition((prev) => ({
      ...prev,
      status: statusValue,
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
      ...(resetPage ? { skip: 0 } : {}), // 當 resetPage 為 true 時，重置頁碼
    }));
  };

  const { data, isLoading } = usePetCards(condition);

  const tableData = data ? data.results : mockData.results;
  const columns: ColumnDef<any>[] = [
    { accessorKey: "petName", header: "寵物名稱" },
    { accessorKey: "ownerName", header: "主人姓名" },
    { accessorKey: "idcard", header: "身分證" },
    { accessorKey: "phone", header: "手機" },
    { accessorKey: "other", header: "其他" },
    {
      accessorKey: "status",
      header: "狀態",
      cell: ({ row }: { row: any }) =>
        row.original.status === 1 ? "已開卡" : "未開卡",
    },
    {
      id: "activate",
      header: "操作",
      cell: ({ row }) =>
        row.original.status === 1 ? null : (
          <Button
            onClick={() => handleActivateCard(row.original.id)}
            disabled={row.original.status === 1}
            size="md"
          >
            開卡
          </Button>
        ),
    },
  ];

  const currentPage = condition.skip / condition.take + 1;
  const totalPages = data
    ? Math.ceil(data.totalCount / condition.take)
    : Math.ceil(mockData.totalCount / 1);

  return (
    <div>
      <PageHeader>
        <PageHeaderTitle title="寵物卡管理" />
      </PageHeader>
      <PagePadding>
        <div className="flex gap-4 mb-4 justify-between items-center">
          <div className="flex items-baseline gap-2 w-full">
            <Dropdown
              ref={statusRef}
              options={options}
              defaultValue={condition.status}
            />
            <div className="flex-1" />
            <Button onClick={handleSearch}>查詢</Button>
          </div>
        </div>

        {/** Table Controller */}
        <div className="mb-4 flex justify-end items-center">
          <BatchOperationButton onBatchOperation={handleBatchOperation} />
          <div className="mx-2 h-6 border-l border-gray-300" />
          <p className="text-xs text-gray">等待開卡數量: 10</p>
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          isLoading={isLoading}
          onSelectItemChange={handleSelectItemChange}
          isRowSelectable={(rowData) => rowData.status !== 1} // Only unactivated cards are selectable
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

      <CardActivationDialog
        open={openActivationDialog}
        onOpenChange={setOpenActivationDialog}
      />
    </div>
  );
};

export default PetCard;
