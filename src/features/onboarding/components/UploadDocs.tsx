import { SwiftPassLogo } from "@/assets/svgs";
import { Button, UploadBox } from "@/components";
import { useFormik } from "formik";
import { useState } from "react";

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
  { key: "id", label: "Directors’ IDs (NIN, Passport, Driver’s License)" },
  {
    key: "licenses",
    label: "Licenses (SCUML, Industry License if applicable)",
  },
];

const UploadDocs = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex]!;

  const formik = useFormik({
    initialValues,
    onSubmit: () => {},
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

  return (
    <div className="w-full h-screen grid grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col justify-center w-full h-full mx-auto py-7 pl-20 pr-12 bg-white rounded-2xl text-[#555555]">
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
            accept="PNG, JPEG"
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
          />
        </div>

        <div className="mt-8">
          <p className="text-[#555555]">
            Want to upload this later?{" "}
            <a href="" className="text-primary">
              Skip...
            </a>
          </p>
        </div>
      </div>

      <div className="col-span-1 h-full px-16 py-10.5">
        <div
          className="w-full h-full flex justify-end bg-white"
          style={{
            backgroundImage: `url('/src/assets/pngs/onboarding-hero.png')`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPositionX: "right",
            // height: "740px",
            // width: "987px",
          }}
        />
      </div>
    </div>
  );
};

export default UploadDocs;
