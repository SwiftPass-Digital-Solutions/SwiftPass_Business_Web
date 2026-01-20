import { Drawer, Input, PageLoader, Table } from "@/components";
import { columns } from "@/features/dashboard/components/table/columns";
import { DocumentStatus } from "@/features/dashboard/types";
import {
  StatusBadge,
  useCustomers,
  useCustomersDetails,
} from "@/features/shared";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

const initialValues = {
  searchParams: "",
};

type Document = {
  name: string;
  houseAddress: string;
  category: string;
  utilityBillUrl: string;
  documentUrl: string;
  verificationStatus: DocumentStatus;
  documentNumber: string;
  imageFileType: string;
};

type DocumentItem = Document & {
  documentName: string;
};

const Customers = () => {
  const [drawer, toggleDrawer] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const formik = useFormik({
    initialValues,
    onSubmit: async () => {},
  });

  const { customerData, loading } = useCustomers({
    searchParams: formik?.values?.searchParams,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const { customerDetails, loading: detailsLoading } =
    useCustomersDetails(customerId);

  const selectedCustomerDetails = useMemo(
    () => customerDetails?.data || null,
    [customerDetails]
  );

  const users = useMemo(
    () => ({
      users: customerData?.data?.data || [],
      pagination: customerData?.data || null,
    }),
    [customerData]
  );

  const documents = (selectedCustomerDetails?.documents ?? {}) as Record<
    string,
    Document
  >;

  const documentsArray = Object.entries(documents).reduce<DocumentItem[]>(
    (acc, [documentName, documentData]) => {
      acc.push({
        documentName,
        ...documentData,
      });
      return acc;
    },
    []
  );

  return (
    <>
      {loading && <PageLoader />}
      <div className="font-archivo space-y-5">
        <div className="py-5 px-6 rounded-[36px] border border-[#F0F0F0] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl w-full font-medium">Document Categories</h3>
            <div className="w-full">
              <Input
                name="searchParams"
                formik={formik}
                placeholder="Search Customer"
              />
            </div>
          </div>

          <div className="">
            <Table
              columns={columns}
              pagination={pagination}
              data={users?.users || []}
              setPagination={setPagination}
              showViewAll
              onRowClick={(row) => {
                setCustomerId(row?.customerId);
                toggleDrawer(true);
              }}
              showSN={false}
              emptyTitle=""
              emptyMessage="No approved customer yet"
            />
          </div>
        </div>
      </div>

      <Drawer
        title="Customer Details"
        open={drawer}
        handleClose={() => toggleDrawer(false)}
      >
        <div className="mt-8">
          {detailsLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="space-y-6">
              <div className="border border-[#DCDCDC] grid grid-cols-2 gap-2 rounded-3xl p-3">
                <div className="border border-[#F0F0F0] p-4 rounded-xl bg-[#FBFBFB] text-[#737373] text-xl">
                  Name
                </div>
                <div className="border border-[#F0F0F0] p-4 rounded-xl text-[#737373] text-xl">
                  {selectedCustomerDetails?.firstName +
                    " " +
                    selectedCustomerDetails?.lastName}
                </div>
                <div className="border border-[#F0F0F0] p-4 rounded-xl bg-[#FBFBFB] text-[#737373] text-xl">
                  SPSN
                </div>
                <div className="border border-[#F0F0F0] p-4 rounded-xl text-[#737373] text-xl">
                  {selectedCustomerDetails?.spsn}
                </div>
              </div>

              <div className="border border-[#DCDCDC] rounded-3xl p-3">
                <h4 className="text-xl mb-3 font-medium text-[#1A1A1A]">
                  Shared Documents
                </h4>

                <div className="space-y-3">
                  {documentsArray?.map((docs, index) => (
                    <div
                      key={index}
                      className="border border-[#F3F3F3] bg-[#FCFCFC] flex justify-between rounded-lg py-3.75 px-3"
                    >
                      <div>{docs?.documentName}</div>
                      <div className="space-x-5">
                        <StatusBadge status={docs?.verificationStatus} />
                        <button className="bg-transparent text-[#0C39ED] border-none cursor-pointer hover:underline">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Customers;
