// Table.tsx
import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
} from "@tanstack/react-table";
import TableHeader from "../../components/table/TableHeader";
import TableRow from "../../components/table/TableRow";

interface TableProps {
  columns: ColumnDef<any>[];
  dataSource: any[];
  onSelectItemChange?: (selectedKeys: string[]) => void;
  isLoading?: boolean;
  selectable?: boolean;
  isRowSelectable?: (rowData: any) => boolean; // New prop
}

const Table: React.FC<TableProps> = ({
  columns,
  dataSource,
  isLoading,
  onSelectItemChange,
  selectable = true,
  isRowSelectable = () => true, // Default to all rows selectable
}) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const selectableRowIds = dataSource
    .filter((item) => isRowSelectable(item))
    .map((item) => item.id);

  const table = useReactTable({
    data: dataSource || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCheckboxChange = (checked: boolean, id?: string) => {
    let newSelectedIds: string[] = [];

    if (id) {
      const item = dataSource.find((item) => item.id === id);

      if (!item || !isRowSelectable(item)) {
        // Ignore selection for non-selectable rows
        return;
      }

      // Handle individual row selection
      newSelectedIds = checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id);
    } else {
      // Handle select/deselect all for selectable rows
      newSelectedIds = checked ? selectableRowIds : [];
    }

    setSelectedIds(newSelectedIds);

    if (onSelectItemChange) {
      onSelectItemChange(newSelectedIds);
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const isAllSelected =
    dataSource.length > 0 && dataSource.every((row) => isSelected(row.id));

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
        ) : (
          table.getRowModel().rows.map((row, idx) => (
            <TableRow
              key={row.id}
              row={row}
              idx={idx}
              selectable={selectable}
              isSelected={isSelected(row.original.id)}
              onRowSelectChange={(checked, id) =>
                handleCheckboxChange(checked, id)
              }
              isRowSelectable={isRowSelectable} // Pass down the function
            />
          ))
        )}
      </tbody>
    </table>
  );
};

export default Table;
