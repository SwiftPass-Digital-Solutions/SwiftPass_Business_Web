import { APis, Card, Customer } from "@/assets/pngs";
import { Button, PageLoader, StatsCard, Table } from "@/components";
import { useDashboardStatus } from "@/hooks";
import { useMemo, useState } from "react";
import { Document } from "@/assets/svgs";
import { DocumentCategory, UploadedDocument } from "@/types";
import {
  CreditsBarChart,
  DocumentGroup,
  useCustomers,
  useDashboardAnalytics,
} from "@/features/shared";
import { APP_PATHS } from "@/constants";
import { useNavigate } from "react-router-dom";
import { columns } from "./table/columns";

export type DocumentsByCategory = Record<DocumentCategory, UploadedDocument[]>;
type GroupedDocuments = {
  category: DocumentCategory;
  documents: UploadedDocument[];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { dashboardData, loading } = useDashboardStatus();
  const { dashboardAnalytics, loading: isLoading } = useDashboardAnalytics();

  const { customerData, loading: customersLoading } = useCustomers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const users = useMemo(
    () => ({
      users: customerData?.data?.data?.slice(0, 3) || [],
      pagination: customerData?.data || null,
    }),
    [customerData]
  );

  const analytics = useMemo(
    () => dashboardAnalytics?.data || null,
    [dashboardAnalytics]
  );

  const statsData = [
    { title: "Credits Balance", value: analytics?.creditBalance, icon: Card },
    {
      title: "Customers Onboarded",
      value: analytics?.totalCustomersOnboarded,
      icon: Customer,
    },
    {
      title: "API Calls (Last 24 hrs)",
      value: analytics?.totalApiCalls,
      icon: APis,
    },
  ];

  const groupedDocs = useMemo<GroupedDocuments[]>(() => {
    if (!dashboardData?.uploadedDocuments?.length) return [];

    return dashboardData?.uploadedDocuments.reduce<GroupedDocuments[]>(
      (acc, doc) => {
        const group = acc.find((g) => g.category === doc.category);

        if (group) {
          group.documents.push(doc);
        } else {
          acc.push({
            category: doc.category,
            documents: [doc],
          });
        }

        return acc;
      },
      []
    );
  }, [dashboardData?.uploadedDocuments]);

  return (
    <>
      {(loading || isLoading || customersLoading) && <PageLoader />}
      <div className="font-archivo space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {statsData?.map((stat) => (
            <StatsCard
              key={stat?.title}
              title={stat?.title}
              value={stat?.value}
              icon={
                <img
                  src={stat?.icon}
                  alt="credits"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              }
            />
          ))}
        </div>

        <div className="py-5 px-6 rounded-[44px] border border-[#F0F0F0] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium mb-1.75">Document Categories</h3>
            <div>
              <Button
                text="View details"
                size="small"
                textClass="text-sm!"
                onClick={() => navigate(APP_PATHS.DOCUMENT_CATEGORIES)}
              />
            </div>
          </div>
          {groupedDocs?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {groupedDocs.map((group) => (
                <DocumentGroup
                  key={group.category}
                  title={group.category}
                  icon={<Document />}
                  documents={group.documents}
                  showDocumentImages={false}
                />
              ))}
            </div>
          ) : (
            <div className="w-full py-5 text-lg text-center text-gray-500">
              No data to show here
            </div>
          )}
        </div>

        <div className="">
          <div className="p-4 rounded-[44px] border border-[#F0F0F0]">
            <h3 className="text-xl font-medium">
              Credits purchased vs. consumed
            </h3>
            <CreditsBarChart
              max={10}
              data={[
                {
                  name: "Consumed",
                  value: analytics?.totalCreditsConsumed || 0,
                },
                {
                  name: "Purchased",
                  value: analytics?.totalCreditsPurchased || 0,
                },
              ]}
            />
          </div>
        </div>

        <div className="py-5 px-6 rounded-[44px] border border-[#F0F0F0] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium mb-1.75">
              Customer Activity Report
            </h3>
            <div>
              <Button
                text="View details"
                size="small"
                textClass="text-sm!"
                // onClick={() => navigate(APP_PATHS.DOCUMENT_CATEGORIES)}
              />
            </div>
          </div>
          <Table
            columns={columns}
            pagination={pagination}
            data={users?.users || []}
            setPagination={setPagination}
            showViewAll
            showSN={false}
            emptyTitle=""
            emptyMessage="No approved customer yet"
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
