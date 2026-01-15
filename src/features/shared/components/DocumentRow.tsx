import { CurvedArrow } from "@/assets/svgs";
import { DocumentStatus } from "../../dashboard/types";
import {
  CATEGORY_LABELS,
  DocumentStatusEnum,
  SUB_CATEGORY_LABELS,
} from "@/constants";
import StatusBadge from "./StatusBadge";
import { Button, Drawer, UploadBox } from "@/components";
import { useState } from "react";
import { useFormik } from "formik";
import { useUploadDocsMutation } from "@/services";
import { toast } from "react-toastify";
import { getErrorMessage, getSubCategoryName } from "@/utils";
import { useAppSelector } from "@/store";

type DocumentRowProps = {
  category: string;
  documentName?: string;
  documentSubType: number;
  documentUrl?: string;
  lastUpdated?: string | null;
  uploadedAt?: string | null;
  verificationStatus: DocumentStatus;
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

const DocumentRow = ({
  category,
  documentSubType,
  verificationStatus,
}: DocumentRowProps) => {
  const { email } = useAppSelector((state) => state.auth);
  const [drawer, toggleDrawer] = useState(false);
  const [triggerUpload, { isLoading }] = useUploadDocsMutation();
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
          toggleDrawer(false);
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

  return (
    <>
      <div className="ml-2 flex gap-2">
        <CurvedArrow />
        <div className="w-full flex items-center justify-between rounded-lg border border-[#F3F3F3] px-3 py-3.75 bg-[#FCFCFC] shadow-[0_2px_12px_rgba(213,213,213,0.2)]">
          <div className="flex items-center gap-4">
            {/* connector / bullet */}
            {/* <span className="w-2 h-2 rounded-full bg-[#E6E6E6]" /> */}
            <p className="text-base font-normal text-black">{label}</p>
          </div>
          <div>
            {verificationStatus === DocumentStatusEnum.NotSubmitted ? (
              <Button
                variant="outlined"
                size="small"
                textClass="text-sm!"
                text="Upload Document"
                onClick={() => toggleDrawer(true)}
              />
            ) : (
              <StatusBadge status={verificationStatus} />
            )}
          </div>
        </div>
      </div>

      <Drawer
        title={`Upload ${label}`}
        open={drawer}
        handleClose={() => toggleDrawer(false)}
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
              onClick={() => toggleDrawer(false)}
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

export default DocumentRow;
