import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
} from "@tanstack/react-table";
import TableHeader from "../../components/table/TableHeader";
import TableRow from "../../components/table/TableRow";

interface TableProps<T> {
  columns: ColumnDef<T>[];
  dataSource: T[];
  isLoading?: boolean;
  selectable?: boolean;
  onSelectItemChange?: (selectedKeys: string[]) => void;
  isRowSelectable?: (rowData: T) => boolean;
}

const Table = <T extends { id: string }>({
  columns,
  dataSource = [],
  isLoading,
  selectable = false,
  onSelectItemChange,
  isRowSelectable = () => true,
}: TableProps<T>) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const table = useReactTable({
    data: dataSource,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCheckboxChange = (checked: boolean, id?: string) => {
    if (!selectable) return;

    let newSelectedIds: string[] = [];

    if (id) {
      // 處理單筆選擇
      newSelectedIds = checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id);
    } else {
      // 處理全選
      const selectableRows = dataSource.filter(isRowSelectable);
      newSelectedIds = checked ? selectableRows.map((row) => row.id) : [];
    }

    setSelectedIds(newSelectedIds);
    onSelectItemChange?.(newSelectedIds);
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const isAllSelected =
    dataSource.length > 0 &&
    dataSource
      .filter(isRowSelectable)
      .every((row) => selectedIds.includes(row.id));

  return (
    <table className="w-full border-collapse bg-white">
      <TableHeader
        headerGroups={table.getHeaderGroups()}
        selectable={selectable}
        isAllSelected={isAllSelected}
        onSelectAllChange={(checked) => handleCheckboxChange(checked)}
      />
      <tbody>
        {isLoading ? (
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              className="text-center p-4"
            >
              Loading...
            </td>
          </tr>
        ) : dataSource.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              className="text-center p-4"
            >
              無資料
            </td>
          </tr>
        ) : (
          table
            .getRowModel()
            .rows.map((row, idx) => (
              <TableRow
                key={row.id}
                row={row}
                idx={idx}
                selectable={selectable}
                isSelected={isSelected(row.original.id)}
                onRowSelectChange={(checked) =>
                  handleCheckboxChange(checked, row.original.id)
                }
                isRowSelectable={() => isRowSelectable(row.original)}
              />
            ))
        )}
      </tbody>
    </table>
  );
};

export default Table;
