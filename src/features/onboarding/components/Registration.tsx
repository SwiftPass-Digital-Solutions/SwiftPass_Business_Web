import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Checkbox, Input, PageLoader, Select } from "@/components";
import { useBusinessTypes } from "../hooks";
import { useMemo } from "react";
import { useFormik } from "formik";
import { initiateBusinessSchema } from "@/validations";
import { useInitiateMutation } from "@/services";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "@/constants";

const initialValues = {
  businessName: "",
  registrationNumber: "",
  businessType: "",
  contactEmail: "",
  contactPhone: "",
  terms: false,
};

const Registration = () => {
  const { businessTypes, loading } = useBusinessTypes();
  const [triggerInitiate, { isLoading }] = useInitiateMutation();
  const navigate = useNavigate();

  const businessTypeList = useMemo(
    () =>
      businessTypes?.map((businessType) => ({
        label: businessType.typeDisplayName,
        value: businessType.typeId,
      })) ?? [],
    [businessTypes]
  );

  const initiateFormik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        const { terms, ...rest } = values;
        const response = await triggerInitiate(rest).unwrap();
        if (response?.status) {
          toast.success(response?.message || "Success");
          navigate(APP_PATHS.ONBOARDING_OTP, {
            state: { ...values, ...response.data },
          });
        } else {
          const message = getErrorMessage(response);
          toast.error(response?.message || message);
        }
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message || "An error occurred. Please try again.");
      }
    },
    validationSchema: initiateBusinessSchema,
  });

  const { isValid, dirty, values, handleSubmit } = initiateFormik;

  return (
    <>
      {loading && <PageLoader />}
      <div className="w-full h-screen grid grid-cols-1 md:grid-cols-6 font-archivo overflow-hidden">
        <div className="col-span-2 h-full overflow-y-auto w-full mx-auto py-7 md:pl-20 md:pr-0 pl-4 pr-4 bg-white rounded-2xl text-[#555555]">
          <SwiftPassLogo className="shrink-0" />

          <div className="space-y-1 mt-8">
            <h3 className="text-2xl font-normal">Welcome to SwiftPass</h3>
            <p className="text-base text-[#555555]">
              These details help us match your documents correctly. Make sure
              they align with your official registration
            </p>
          </div>

          <div className="mt-7.5 space-y-5">
            <Input
              name="businessName"
              label="Business Name"
              placeholder="Enter your business name"
              formik={initiateFormik}
            />

            <Input
              name="registrationNumber"
              label="Registration Number (CAC)"
              placeholder="BN: 8765432"
              formik={initiateFormik}
            />

            <Select
              name="businessType"
              label="Business Type"
              placeholder="Enter your business type e.g ltd"
              options={businessTypeList}
              formik={initiateFormik}
            />

            <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-3">
              <Input
                name="contactEmail"
                label="Contact Email"
                placeholder="Enter your email"
                formik={initiateFormik}
              />
              <Input
                name="contactPhone"
                label="Contact Phone"
                placeholder="Enter your phone number"
                formik={initiateFormik}
              />
            </div>

            <Checkbox
              name="terms"
              formik={initiateFormik}
              label={
                <>
                  I have read, understood and agree to the{" "}
                  <a className="text-primary" href="">
                    terms and conditions,{" "}
                  </a>
                  and{" "}
                  <a className="text-primary" href="">
                    privacy policy
                  </a>
                </>
              }
            />
          </div>

          <div className="mt-7.5">
            <Button
              text="Next"
              disabled={!(isValid && dirty && values?.terms) || isLoading}
              className="w-full!"
              loading={isLoading}
              onClick={handleSubmit}
            />
          </div>

          <div>
            <p className="text-[#555555] font-medium mt-8">
              Not new here?{" "}
              <a href={APP_PATHS.LOGIN} className="text-primary">
                Login
              </a>
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
    </>
  );
};

export default Registration;
