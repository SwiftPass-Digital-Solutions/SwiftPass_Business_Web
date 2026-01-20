import { ColumnDef } from "@tanstack/table-core";
import { Customers } from "../../types";
import { dayJs } from "@/utils";

export const columns: ColumnDef<Customers>[] = [
  {
    header: "Customer name",
    accessorKey: "customerName",
    id: "customerName",
  },
  {
    header: "SPSN",
    accessorKey: "spsn",
    id: "spsn",
  },
  {
    header: "Onboarded On",
    accessorKey: "onboardedOn",
    id: "onboardedOn",
    cell: ({ row }) => {
      const date = row.original.onboardedOn;
      return <span>{dayJs(date).format("MMM D, YYYY")}</span>;
    },
  },
];
