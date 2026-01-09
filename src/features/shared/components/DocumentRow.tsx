import { CurvedArrow } from "@/assets/svgs";
import { DocumentStatus } from "../../dashboard/types";
import { categories } from "@/constants";
import StatusBadge from "./StatusBadge";

type DocumentRowProps = {
  category: string;
  documentName?: string;
  documentSubType: number;
  documentUrl?: string;
  lastUpdated?: string | null;
  uploadedAt?: string | null;
  verificationStatus: DocumentStatus;
};

const DocumentRow = ({
  category,
  documentSubType,
  verificationStatus,
}: DocumentRowProps) => {
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
      <div className="w-full flex items-center justify-between rounded-lg border border-[#F3F3F3] px-3 py-3.75 bg-[#FCFCFC] shadow-[0_2px_12px_rgba(213,213,213,0.2)]">
        <div className="flex items-center gap-4">
          {/* connector / bullet */}
          {/* <span className="w-2 h-2 rounded-full bg-[#E6E6E6]" /> */}
          <p className="text-base font-normal text-black">
            {getSubCategoryName(category, documentSubType)}
          </p>
        </div>

        <StatusBadge status={verificationStatus} />
      </div>
    </div>
  );
};

export default DocumentRow;
