import { APis, Card, Customer } from "@/assets/pngs";
import { Button, StatsCard } from "@/components";
import { useDashboardStatus } from "@/hooks";
import { useMemo } from "react";
import { Document } from "@/assets/svgs";
import { DocumentCategory, UploadedDocument } from "@/types";
import { DocumentGroup } from "@/features/shared";

export type DocumentsByCategory = Record<DocumentCategory, UploadedDocument[]>;
type GroupedDocuments = {
  category: DocumentCategory;
  documents: UploadedDocument[];
};

const statsData = [
  { title: "Credits Balance", value: "0", icon: Card },
  { title: "Customers Onboarded", value: "0", icon: Customer },
  { title: "API Calls (Last 24 hrs)", value: "0", icon: APis },
];

const Dashboard = () => {
  const { dashboardData, loading } = useDashboardStatus();
  const dashboardStatus = useMemo(() => dashboardData || null, [dashboardData]);

  console.log(dashboardStatus, loading);

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
      {/* {loading && <PageLoader />} */}
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
            <h3 className="text-xl font-medium">Document Categories</h3>
            <Button text="View details" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {groupedDocs?.map((group) => (
              <DocumentGroup
                key={group.category}
                title={group.category}
                icon={<Document />}
                documents={group.documents}
                showDocumentImages={false}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
