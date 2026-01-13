import { UploadedDocument } from "@/types";
import DocumentRow from "./DocumentRow";
import DocumentImageRow from "./DocumentImageRow";

type DocumentGroupProps = {
  title: string;
  documents: UploadedDocument[];
  icon?: React.ReactNode;
  showDocumentImages?: boolean;
  toggleDrawer?: () => void;
  setSelectedDoc?: (doc: { documentUrl: string; name: string }) => void;
};

const DocumentGroup = ({
  title,
  documents,
  icon,
  showDocumentImages = false,
  toggleDrawer,
  setSelectedDoc,
}: DocumentGroupProps) => {
  return (
    <div
      className="rounded-2xl border border-[#F7F7F7] p-4 bg-white font-archivo"
      style={{
        boxShadow: "0px 2px 12px 0px rgba(213, 213, 213, 0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-base font-medium text-[#222222]">{title}</h3>
        </div>

        <p className="text-sm italic text-[#A9A9A9]">
          {documents.length} documents
        </p>
      </div>

      <div className="space-y-3">
        {documents.map((doc, index) =>
          !showDocumentImages ? (
            <DocumentRow
              key={index}
              category={doc.category}
              documentSubType={doc.documentSubType}
              verificationStatus={doc.verificationStatus}
              documentUrl={doc.documentUrl}
            />
          ) : (
            <DocumentImageRow
              key={index}
              category={doc.category}
              documentSubType={doc.documentSubType}
              verificationStatus={doc.verificationStatus}
              documentUrl={doc.documentUrl}
              toggleDrawer={toggleDrawer}
              setSelectedDoc={setSelectedDoc}
            />
          )
        )}
      </div>
    </div>
  );
};

export default DocumentGroup;
