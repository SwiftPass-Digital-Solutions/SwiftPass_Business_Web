import { SwiftPassLogo } from "@/assets/svgs";
import { Button, UploadBox } from "@/components";
import { useUploadDocsMutation } from "@/services";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useBusinessCategory } from "../hooks";
import { APP_PATHS } from "@/constants";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils";

const initialValues = {
  cac: "",
  tin: "",
  id: "",
  licenses: "",
};

type FormKeys = keyof typeof initialValues;

const STEPS: readonly { key: FormKeys; label: string }[] = [
  { key: "cac", label: "Corporate Registration (CAC Certificate)" },
  { key: "tin", label: "Tax Compliance (TIN Certificate)" },
  { key: "id", label: "Directors' IDs (NIN, Passport, Driver's License)" },
  {
    key: "licenses",
    label: "Licenses (SCUML, Industry License if applicable)",
  },
];

type CategoryName =
  | "CorporateRegistration"
  | "TaxCompliance"
  | "DirectorId"
  | "License";

const STEP_TO_CATEGORY_MAP: Record<FormKeys, CategoryName> = {
  cac: "CorporateRegistration",
  tin: "TaxCompliance",
  id: "DirectorId",
  licenses: "License",
};

const UploadDocs = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [stepIndex, setStepIndex] = useState(0);
  const [triggerUpload, { isLoading }] = useUploadDocsMutation();
  const { businessCategories } = useBusinessCategory();

  const currentStep = STEPS[stepIndex]!;

  const getCategoryFromStep = (stepKey: FormKeys) => {
    return STEP_TO_CATEGORY_MAP[stepKey];
  };

  const currentCategory = useMemo(() => {
    if (!currentStep) return null;
    return getCategoryFromStep(currentStep.key);
  }, [currentStep]);

  const availableSubCategories = useMemo(
    () =>
      businessCategories
        ?.find((category) => category?.categoryName === currentCategory)
        ?.subCategories?.map((subcategory) => ({
          label: subcategory?.subCategoryDisplayName,
          value: subcategory?.subCategoryId,
        })) ?? [],
    [currentCategory, businessCategories]
  );

  console.log(availableSubCategories);

  const formik = useFormik({
    initialValues,
    onSubmit: async (value) => {
      try {
        const category = getCategoryFromStep(currentStep.key);

        const payload = {
          email: state?.contactEmail,
          documentCategory: category,
          documentSubType: null,
          file: value[currentStep.key as FormKeys],
        };

        const response = await triggerUpload(payload).unwrap();
        if (response?.status) {
          toast.success(response?.message || "Document uploaded successfully");
          if (stepIndex < STEPS.length - 1) {
            setStepIndex((prev) => prev + 1);
          } else {
            navigate(APP_PATHS.LOGIN);
          }
        } else {
          const message = getErrorMessage(response);
          toast.error(response?.message || message);
        }
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message || "An error occurred. Please try again.");
      }
    },
  });

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      formik.submitForm();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const { dirty, isValid } = formik;

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col md:justify-center w-full h-full mx-auto py-7 md:pl-20 pl-4 md:pr-12 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal">Upload Required Documents</h3>
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-15 h-0.75 ${
                  i <= stepIndex ? "bg-[#0D3AED]" : "bg-[#FAFAFA]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-7.5 space-y-5">
          <UploadBox
            name={currentStep.key}
            label={currentStep.label}
            onFile={(imgUrl) => formik.setFieldValue(currentStep.key, imgUrl)}
            shape="rect"
            holderShape="rectangle"
            accept=".png,.jpeg, .jpg"
            maxSize={1024}
            returnFile
            trim={false}
            useCropper={false}
            hasError={!!formik.errors?.[currentStep.key]}
            errorMessage={formik.errors?.[currentStep.key]}
          />
        </div>

        <div className="mt-12.5 flex gap-3 items-center">
          <Button
            variant="outlined"
            text="Back"
            className="w-full!"
            // disabled={stepIndex === 0}
            onClick={handleBack}
          />

          <Button
            text={stepIndex === STEPS.length - 1 ? "Submit" : "Next"}
            className="w-full!"
            onClick={handleNext}
            loading={isLoading}
            disabled={!(isValid && dirty) || isLoading}
          />
        </div>

        <div className="mt-8">
          <p className="text-[#555555]">
            Want to upload this later?{" "}
            <button
              onClick={() => navigate(APP_PATHS.LOGIN)}
              className="text-primary bg-transparent border-none cursor-pointer"
            >
              Skip...
            </button>
          </p>
        </div>
      </div>

      <div className="col-span-1 h-full px-16 py-10.5 hidden md:block">
        <div
          className="w-full h-full bg-white"
          style={{
            backgroundImage: `url('/images/onboarding-hero.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
          }}
        />
      </div>
    </div>
  );
};

export default UploadDocs;
