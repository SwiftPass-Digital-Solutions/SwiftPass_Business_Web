import { CurvedArrow } from "@/assets/svgs";
import { DocumentStatus } from "../../dashboard/types";
import { CATEGORY_LABELS, DocumentStatusEnum } from "@/constants";
import StatusBadge from "./StatusBadge";
import { toast } from "react-toastify";
import { getErrorMessage, getSubCategoryName } from "@/utils";
import { useUploadDocsMutation } from "@/services";
import { useFormik } from "formik";
import { useState } from "react";
import { useAppSelector } from "@/store";
import { Button, Drawer, UploadBox } from "@/components";

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

const SUB_CATEGORY_LABELS: Record<string, string> = {
  CACCertificate: "CAC Certificate",
  CACForm: "CAC Form",
  VATCertificate: "VAT Certificate",
  TINCertificate: "TIN Certificate",
  DriversLicense: "Drivers License",
  IndustryLicense: "Industry License",
};

const initialValues = {
  CACCertificate: "",
  CACForm: "",
  VATCertificate: "",
  TINCertificate: "",
  DriversLicense: "",
  IndustryLicense: "",
};

type FormKeys = keyof typeof initialValues;

const DocumentImageRow = ({
  category,
  documentSubType,
  verificationStatus,
  documentUrl,
  toggleDrawer,
  setSelectedDoc,
}: DocumentImageRowProps) => {
  const { email } = useAppSelector((state) => state.auth);
  const [triggerUpload, { isLoading }] = useUploadDocsMutation();
  const [uploadDrawer, toggleUploadDrawer] = useState(false);

  const subCategory = getSubCategoryName(category, documentSubType);
  const label = SUB_CATEGORY_LABELS[subCategory] ?? subCategory;

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        const file = values[subCategory as FormKeys];
        if (!file) {
          toast.error("Please select a file to upload");
          return;
        }

        const payload = {
          email: email,
          documentCategory: category,
          documentSubType,
          file,
        };

        const response = await triggerUpload(payload).unwrap();

        if (response?.status) {
          toast.success(response.message || "Document uploaded successfully");
          toggleUploadDrawer(false);
          formik.setFieldValue(subCategory, "");
        } else {
          const message = getErrorMessage(response);
          toast.error(response.message || message);
        }
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message || "An error occurred. Please try again.");
      }
    },
  });

  const handleClick = () => {
    const shouldUpload =
      verificationStatus === DocumentStatusEnum.NotSubmitted ||
      verificationStatus === DocumentStatusEnum.Rejected;

    if (shouldUpload) {
      toggleUploadDrawer(true);
      return;
    }

    if (documentUrl) {
      setSelectedDoc?.({
        documentUrl,
        name: getSubCategoryName(category, documentSubType),
      });
    }

    toggleDrawer?.();
  };

  return (
    <>
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
            <p className="text-base font-normal text-black">{label}</p>
            <StatusBadge status={verificationStatus} />
          </div>
          <div>
            <button
              onClick={handleClick}
              className="w-full cursor-pointer text-center rounded-xl bg-[#F5F7FE] border border-[#D8E0FD] text-primary py-4"
            >
              {verificationStatus === DocumentStatusEnum.NotSubmitted
                ? "Submit Documents"
                : verificationStatus === DocumentStatusEnum.Pending
                ? "Resubmit"
                : "View More"}
            </button>
          </div>
        </div>
      </div>

      <Drawer
        title={`Upload ${label}`}
        open={uploadDrawer}
        handleClose={() => toggleUploadDrawer(false)}
      >
        <div className="flex flex-col h-full">
          <UploadBox
            key={subCategory}
            name={subCategory}
            label={`${CATEGORY_LABELS[category]} (${label})`}
            onFile={(imgUrl) => formik.setFieldValue(subCategory, imgUrl)}
            shape="rect"
            holderShape="rectangle"
            accept=".png,.jpeg,.jpg"
            maxSize={1024}
            returnFile
            trim={false}
            useCropper={false}
          />

          <div className="mt-auto w-full flex gap-5 pt-6">
            <Button
              className="w-full!"
              text="Cancel"
              variant="outlined"
              onClick={() => toggleUploadDrawer(false)}
            />
            <Button
              className="w-full!"
              text="Upload"
              variant="contained"
              onClick={() => formik.submitForm()}
              loading={isLoading}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DocumentImageRow;
