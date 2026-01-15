import { ColumnDef } from "@tanstack/table-core";
import { Customers } from "../../types";

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
  },
];
