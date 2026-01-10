import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { APP_PATHS } from "@/constants";
import { useForgotPasswordMutation } from "@/services";
import { getErrorMessage } from "@/utils";
import { forgotPasswordValidationSchema } from "@/validations";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialValues = {
  email: "",
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [triggerForgotPassword, { isLoading }] = useForgotPasswordMutation();

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        const response = await triggerForgotPassword(values).unwrap();
        if (response?.status) {
          toast.success(
            response?.message || "Verification code sent to your email"
          );
          navigate(APP_PATHS.OTP, { state: { ...response?.data, ...values } });
        } else {
          const message = getErrorMessage(response);
          toast.error(message || response?.message || "An error occurred");
        }
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message || "An error occurred");
      }
    },
    validationSchema: forgotPasswordValidationSchema,
  });

  const { handleSubmit, isValid, dirty } = formik;

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-6 font-archivo overflow-hidden">
      <div className="col-span-2 h-screen flex flex-col md:justify-center w-full mx-auto py-7 md:pl-20 md:pr-0 pl-4 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal">Forgot password?</h3>
          <p className="text-base text-[#555555]">
            Enter your email address below to get a verification code
          </p>
        </div>

        <div className="mt-7.5 space-y-5">
          <div>
            <Input
              name="email"
              label="Email address"
              placeholder="Enter your email"
              formik={formik}
            />
          </div>
        </div>

        <div className="mt-12.5">
          <Button
            text="Next"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!(dirty && isValid) || isLoading}
            className="w-full!"
          />
        </div>

        <div>
          <p className="text-[#555555] font-medium mt-8">
            Remember password?{" "}
            <a href={APP_PATHS.LOGIN} className="text-primary">
              Log in
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
  );
};

export default ForgotPassword;
