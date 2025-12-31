import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

// components/PaginationControls.tsx
interface TableProps<T> {
  columns?: ColumnDef<T>[];
  data: T[];
  manualPagination?: boolean;
  pageCount?: number;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  rowCount?: number;
  setPagination: React.Dispatch<
    React.SetStateAction<{ pageIndex: number; pageSize: number }>
  >;
}

export const PaginationControls = <T,>({
  columns,
  data,
  manualPagination = false,
  pageCount = 0,
  pagination, // default pagination values
  rowCount = 25,
  setPagination,
}: TableProps<T>) => {
  const [rowSelection, setRowSelection] = React.useState({});

  const [tempPageIndex, setTempPageIndex] = React.useState(pagination);
  const computedPageCount = manualPagination
    ? pageCount || Math.ceil(rowCount / pagination.pageSize)
    : undefined;

  const table = useReactTable({
    columns: columns ?? [],
    data,
    debugTable: true,
    enableRowSelection: true,
    manualPagination,
    pageCount: computedPageCount,
    rowCount: manualPagination ? rowCount : undefined,
    state: {
      rowSelection,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (pagination) => {
      setPagination(pagination);
      setTempPageIndex(pagination);
    },
  });

  const formatNumber = (n: number) => n.toString().padStart(2, "0");
  const formatPaginationText = (
    currentPageLength: number,
    totalRowCount: number,
    pageIndex: number,
    pageSize: number
  ) => {
    const start = formatNumber(pageIndex * pageSize + 1);
    const end = formatNumber(
      Math.min(pageIndex * pageSize + currentPageLength, totalRowCount)
    );
    const total = formatNumber(totalRowCount);

    return `${start} to ${end} of ${total} entries`;
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const pageIndex = Number(inputValue);
    if (!isNaN(pageIndex)) {
      setTempPageIndex({
        ...tempPageIndex,
        pageIndex: pageIndex - 1,
      });
    } else {
      setTempPageIndex({
        ...tempPageIndex,
        pageIndex: 0,
      });
    }
  };
  const handleGoClick: () => void = () => {
    table.setPageIndex(tempPageIndex.pageIndex);
  };
  const isValidPageIndex = () => {
    const pageIndex = tempPageIndex.pageIndex + 1;
    return pageIndex >= 1 && pageIndex <= table.getPageCount();
  };

  return (
    <div
      className="sticky -bottom-[1px] px-6 justify-center sm:justify-between flex items-center bg-white/50 min-h-16 border border-[#EBEFF2] text-xs font w-full"
      style={{ boxShadow: "0px -4px 12px 0px rgba(0, 0, 0, 0.04)" }}
    >
      <div className="hidden sm:block !text-[#4A4A4A] ">
        Showing{" "}
        {formatPaginationText(
          table.getPaginationRowModel().rows.length,
          table.getRowCount(),
          table.getState().pagination.pageIndex,
          table.getState().pagination.pageSize
        )}
      </div>
      <div className="hidden lg:flex gap-4 justify-center items-center ">
        <span className="!text-[#4A4A4A] ">Page</span>
        <input
          className={`flex items-center justify-center h-8 w-8  border border-[#BEBEBE] focus-within:border-[#6C6C6C] rounded`}
          max={table.getPageCount()}
          min={1}
          onChange={handlePageChange}
          style={{ textAlign: "center" }}
          type="number"
          value={tempPageIndex.pageIndex + 1}
        />
        <span>of</span>
        <div className="w-8 h-8 border border-[#BEBEBE] rounded flex items-center justify-center">
          <span>{formatNumber(table.getPageCount())}</span>
        </div>
        <button
          disabled={!isValidPageIndex()}
          className={`flex w-8 h-8 items-center justify-center border rounded bg-[#BF0926] text-white disabled:bg-[#a95a67]`}
          onClick={handleGoClick}
        >
          Go
        </button>
      </div>
      <div className="flex gap-4 text-[#606060]">
        <button
          className="disabled:opacity-50"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous
        </button>
        <div className="flex items-center justify-center w-8 h-8 border rounded bg-[#BF0926] ">
          <span className="text-white">
            {table.getState().pagination.pageIndex + 1}
          </span>
        </div>
        <button
          className="disabled:opacity-50"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
};
