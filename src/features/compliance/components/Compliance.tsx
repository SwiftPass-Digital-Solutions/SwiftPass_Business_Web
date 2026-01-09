import { Approve, Pending, Reject, Review, Score } from "@/assets/pngs";
import { Document } from "@/assets/svgs";
import { Button, StatsCard } from "@/components";
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
  const { dashboardData } = useDashboardStatus();
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
    { title: "Next Review Due", value: "", icon: Review },
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

      <div className="py-5 px-6 rounded-[44px] border border-[#F0F0F0] space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">Document Categories</h3>
          <Button
            text="View details"
            onClick={() => navigate(APP_PATHS.DOCUMENT_CATEGORIES)}
            disabled={!dashboardStatus?.uploadedDocuments?.length}
          />
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
  );
};

export default Compliance;
