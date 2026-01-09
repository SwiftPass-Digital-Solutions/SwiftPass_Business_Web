import { CurvedArrow } from "@/assets/svgs";
import { DocumentStatus } from "../../dashboard/types";
import { categories } from "@/constants";
import StatusBadge from "./StatusBadge";

type DocumentImageRowProps = {
  category: string;
  documentName?: string;
  documentSubType: number;
  documentUrl?: string;
  lastUpdated?: string | null;
  uploadedAt?: string | null;
  verificationStatus: DocumentStatus;
  toggleDrawer?: () => void;
  setSelectedDoc?: (doc: { documentUrl: string; name: string }) => void;
};

const DocumentImageRow = ({
  category,
  documentSubType,
  verificationStatus,
  documentUrl,
  toggleDrawer,
  setSelectedDoc,
}: DocumentImageRowProps) => {
  const getSubCategoryName = (categoryName: string, subCategoryId: number) => {
    const category = categories.find(
      (cat) => cat.categoryName === categoryName
    );
    if (!category) return "Unknown";

    const subCategory = category.subCategories.find(
      (sub) => sub.subCategoryId === subCategoryId
    );
    return subCategory?.subCategoryName ?? "Unknown";
  };

  return (
    <div className="ml-2 flex gap-2">
      <CurvedArrow />

      <div className="w-full rounded-lg border space-y-3 border-[#F3F3F3] px-3 py-3.75 bg-[#FCFCFC] shadow-[0_2px_12px_rgba(213,213,213,0.2)]">
        <div className="w-full">
          <img
            src={documentUrl}
            height={438}
            className="object-cover w-full rounded"
            alt=""
          />
        </div>
        <div className="flex justify-between w-full items-center gap-4">
          {/* connector / bullet */}
          {/* <span className="w-2 h-2 rounded-full bg-[#E6E6E6]" /> */}
          <p className="text-base font-normal text-black">
            {getSubCategoryName(category, documentSubType)}
          </p>
          <StatusBadge status={verificationStatus} />
        </div>
        <div>
          <button
            onClick={() => {
              documentUrl &&
                setSelectedDoc?.({
                  documentUrl: documentUrl,
                  name: getSubCategoryName(category, documentSubType),
                });
              toggleDrawer?.();
            }}
            className="w-full cursor-pointer text-center rounded-xl bg-[#F5F7FE] border border-[#D8E0FD] text-primary py-4"
          >
            View More
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentImageRow;
