import { Approve, Pending, Reject, Review, Score } from "@/assets/pngs";
import { Document } from "@/assets/svgs";
import { Button, PageLoader, ProgressBar, StatsCard } from "@/components";
import { APP_PATHS } from "@/constants";
import { DocumentGroup } from "@/features/shared";
import { useDashboardStatus } from "@/hooks";
import { DocumentCategory, UploadedDocument } from "@/types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export type DocumentsByCategory = Record<DocumentCategory, UploadedDocument[]>;
type GroupedDocuments = {
  category: DocumentCategory;
  documents: UploadedDocument[];
};

const Compliance = () => {
  const { dashboardData, loading } = useDashboardStatus();
  const dashboardStatus = useMemo(() => dashboardData || null, [dashboardData]);
  const navigate = useNavigate();

  const statsData = [
    {
      title: "Approved",
      value: dashboardStatus?.approvedDocumentsCount,
      icon: Approve,
    },
    {
      title: "Rejected",
      value: dashboardStatus?.rejectedDocumentsCount,
      icon: Reject,
    },
    {
      title: "Pending Review",
      value: dashboardStatus?.pendingDocumentsCount,
      icon: Pending,
    },
    {
      title: "Compliance Score",
      value: `${dashboardStatus?.complianceScore}%`,
      icon: Score,
    },
    { title: "Next Review Due", value: "N/A", icon: Review },
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
      {loading && <PageLoader />}
      <div className="font-archivo space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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

        <div className="flex flex-col md:flex-row md:items-center gap-3.75">
          <div className="md:w-[20%]">
            <ProgressBar value={dashboardStatus?.complianceScore || 0} />
          </div>
          <div
            className={`md:w-[80%] py-3 px-3 ${
              Number(dashboardStatus?.complianceScore) < 100
                ? "text-[#EDA20D] bg-[#FEFBF5]"
                : "bg-green-50 text-green-600"
            } text-lg rounded-xl text-center`}
          >
            {Number(dashboardStatus?.complianceScore) < 100
              ? "Your business is in good standing. Complete pending uploads to reach 100% compliance"
              : "Your business is fully compliant. You can now access all platform features."}
          </div>
        </div>

        <div className="py-5 px-6 rounded-[44px] border border-[#F0F0F0] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Document Categories</h3>
            <div>
              <Button
                text="View details"
                size="small"
                textClass="text-sm!"
                onClick={() => navigate(APP_PATHS.DOCUMENT_CATEGORIES)}
                disabled={!dashboardStatus?.uploadedDocuments?.length}
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
      </div>
    </>
  );
};

export default Compliance;