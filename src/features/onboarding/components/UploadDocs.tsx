import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Select, UploadBox } from "@/components";
import { useUploadDocsMutation } from "@/services";
import { useFormik } from "formik";
import { useEffect, useMemo } from "react";
import { useBusinessCategory } from "../hooks";
import { APP_PATHS } from "@/constants";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils";

const STORAGE_KEY = "uploadDocsForm";

const STEP_FIELDS = {
  cac: "",
  tin: "",
  id: "",
  licenses: "",
} as const;

const initialValues = {
  ...STEP_FIELDS,
  documentSubType: "",
};

type FormKeys = keyof typeof initialValues;
type StepKey = keyof typeof STEP_FIELDS;

const STEPS: readonly { key: StepKey; label: string }[] = [
  { key: "cac", label: "Corporate Registration (CAC Certificate or CAC Form)" },
  { key: "tin", label: "Tax Compliance (TIN Certificate or VAT Certificate)" },
  { key: "id", label: "Directors' IDs (NIN, Passport, or Driver's License)" },
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

const STEP_TO_CATEGORY_MAP: Record<StepKey, CategoryName> = {
  cac: "CorporateRegistration",
  tin: "TaxCompliance",
  id: "DirectorId",
  licenses: "License",
};

const UploadDocs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLocation();
  const [triggerUpload, { isLoading }] = useUploadDocsMutation();
  const { businessCategories } = useBusinessCategory();

  const stepIndex = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const step = Number(params.get("step"));
    return Number.isNaN(step) ? 0 : Math.min(step, STEPS.length - 1);
  }, [location.search]);

  const goToStep = (nextStep: number) => {
    navigate(
      {
        pathname: location.pathname,
        search: `?step=${nextStep}`,
      },
      { replace: true, state: { ...state } }
    );
  };

  const currentStep = STEPS[stepIndex]!;

  const getCategoryFromStep = (stepKey: StepKey) => {
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

  const persistedValues = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : initialValues;
    } catch {
      return initialValues;
    }
  }, []);

  const formik = useFormik({
    initialValues: persistedValues,
    enableReinitialize: true,
    onSubmit: async (value) => {
      try {
        const category = getCategoryFromStep(currentStep.key);

        const payload = {
          email: state?.contactEmail,
          documentCategory: category,
          documentSubType: value?.documentSubType,
          file: value[currentStep.key as FormKeys],
        };

        const response = await triggerUpload(payload).unwrap();
        if (response?.status) {
          toast.success(response?.message || "Document uploaded");

          if (stepIndex < STEPS.length - 1) {
            goToStep(stepIndex + 1);
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

  const handleBack = () => {
    if (stepIndex > 0) {
      goToStep(stepIndex - 1);
    }
  };

  const hasFile = !!formik.values[currentStep.key];
  const hasSelectedSubType = Boolean(formik.values.documentSubType);
  const canProceed = hasSelectedSubType && hasFile;

  const { handleSubmit } = formik;

  useEffect(() => {
    sessionStorage.setItem("uploadStep", String(stepIndex));
  }, [stepIndex]);

  useEffect(() => {
    const savedStep = Number(sessionStorage.getItem("uploadStep"));
    if (!Number.isNaN(savedStep)) {
      goToStep(savedStep);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formik.values));
  }, [formik.values]);

  useEffect(() => {
    const missingStep = STEPS.findIndex(
      (step, index) => index < stepIndex && !formik.values[step.key]
    );

    if (missingStep !== -1) {
      goToStep(missingStep);
    }
  }, [stepIndex, formik.values]);

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-6 font-archivo overflow-hidden">
      <div className="col-span-2 h-full overflow-y-auto w-full mx-auto py-7 md:pl-20 md:pr-0 pl-4 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo className="shrink-0" />

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
          <Select
            name="documentSubType"
            // label="Select DOcument Type"
            options={availableSubCategories}
            formik={formik}
            placeholder="Select document type"
          />
          <UploadBox
            key={currentStep.key}
            name={currentStep.key}
            label={currentStep.label}
            onFile={(imgUrl) => {
              if (!hasSelectedSubType) {
                toast.error("Please select a document type");
                return;
              }
              formik.setFieldValue(currentStep.key, imgUrl);
            }}
            shape="rect"
            holderShape="rectangle"
            accept=".png,.jpeg, .jpg"
            maxSize={1024}
            returnFile
            trim={false}
            useCropper={false}
            hasError={!!formik.errors?.[currentStep.key]}
            // errorMessage={formik.errors?.[currentStep.key]}
          />
        </div>

        <div className="mt-12.5 flex gap-3 items-center">
          <Button
            variant="outlined"
            text="Back"
            className="w-full!"
            disabled={stepIndex === 0}
            onClick={handleBack}
          />

          <Button
            text={stepIndex === STEPS.length - 1 ? "Submit" : "Next"}
            className="w-full!"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!canProceed || isLoading}
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

      <div className="col-span-4 h-full px-16 py-10.5 hidden md:block">
        <div
          className="w-full h-full bg-white"
          style={{
            backgroundImage: `url('/images/sp-bg.png')`,
            backgroundSize: "790px auto",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
          }}
        />
      </div>
    </div>
  );
};

export default UploadDocs;
