import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { confirmPasswordSchema } from "@/validations";
import { useFormik } from "formik";
import { CheckItem } from "./CheckItem";
import { useLocation, useNavigate } from "react-router-dom";
import { usePasswordResetMutation } from "@/services";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/constants";
import { getErrorMessage } from "@/utils";

const initialValues = {
  password: "",
  password2: "",
};

const ConfirmPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [triggerReset, { isLoading }] = usePasswordResetMutation();

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        const payload = {
          email: state?.email,
          token: state?.token,
          password: values?.password,
        };
        const response = await triggerReset(payload).unwrap();
        if (response?.status) {
          toast.success(response?.message || "Password reset successfully");
          navigate(APP_PATHS.LOGIN);
        } else {
          const message = getErrorMessage(response);
          toast.error(message);
        }
      } catch (error: any) {
        const message = getErrorMessage(error);
        toast.error(message || "Something went wrong, try again");
      }
    },
    validationSchema: confirmPasswordSchema,
  });

  const { values, handleSubmit, dirty, isValid } = formik;

  const password = values.password;

  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    minLength: password.length >= 8,
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-6 font-archivo overflow-hidden">
      <div className="col-span-2 h-screen flex flex-col md:justify-center w-full mx-auto py-7 md:pl-20 md:pr-0 pl-4 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal">Enter new password</h3>
          <p className="text-base text-[#555555]">
            Enter your new password below to log in
          </p>
        </div>

        <div className="mt-7.5 space-y-5">
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter password"
            formik={formik}
          />
          <Input
            name="password2"
            type="password"
            label="Confirm Password"
            placeholder="Enter password one more time"
            formik={formik}
          />
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <CheckItem
            label="One uppercase letter"
            valid={passwordChecks.uppercase}
          />
          <CheckItem
            label="One lowercase letter"
            valid={passwordChecks.lowercase}
          />
          <CheckItem
            label="One special character"
            valid={passwordChecks.special}
          />
          <CheckItem label="One number" valid={passwordChecks.number} />
          <CheckItem
            label="Minimum of eight characters"
            valid={passwordChecks.minLength}
          />
        </div>

        <div className="mt-12.5 flex gap-3 items-center">
          <Button
            variant="outlined"
            text="Back"
            onClick={() => navigate(-1)}
            className="w-full!"
          />
          <Button
            text="Create my account"
            onClick={handleSubmit}
            className="w-full!"
            loading={isLoading}
            disabled={!(dirty && isValid) || isLoading}
          />
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

export default ConfirmPassword;
