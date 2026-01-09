import { Document } from "@/assets/svgs";
import { Button, Drawer } from "@/components";
import { DocumentGroup } from "@/features/shared";
import { useDashboardStatus } from "@/hooks";
import { DocumentCategory, UploadedDocument } from "@/types";
import { downloadFileFromUrl } from "@/utils";
import { useMemo, useState } from "react";

export type DocumentsByCategory = Record<DocumentCategory, UploadedDocument[]>;
type GroupedDocuments = {
  category: DocumentCategory;
  documents: UploadedDocument[];
};
type SelectedDoc = {
  documentUrl: string;
  name: string;
};

const DocumentCategories = () => {
  const { dashboardData } = useDashboardStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);

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
      <div className="font-archivo space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groupedDocs?.map((group) => (
            <DocumentGroup
              key={group.category}
              title={group.category}
              icon={<Document />}
              documents={group.documents}
              showDocumentImages={true}
              toggleDrawer={() => {
                setDrawerOpen(true);
              }}
              setSelectedDoc={setSelectedDoc}
            />
          ))}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        handleClose={() => setDrawerOpen(false)}
        title={selectedDoc?.name || "Document Preview"}
      >
        <div className="w-full">
          <img
            src={selectedDoc?.documentUrl}
            className="object-cover w-full rounded"
            height={726}
            alt=""
          />

          <div className="mt-5.5 flex justify-end">
            <Button
              text="Download document"
              className=""
              onClick={() => {
                if (!selectedDoc) return;
                downloadFileFromUrl(selectedDoc.documentUrl, selectedDoc.name);
              }}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DocumentCategories;
