import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { APP_PATHS } from "@/constants";
import { useLoginMutation } from "@/services";
import { loginSuccess, useAppDispatch } from "@/store";
import { getErrorMessage, setCookie } from "@/utils";
import { loginValidationSchema } from "@/validations";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialValues = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [triggerLogin, { isLoading }] = useLoginMutation();

  const loginFormik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        const response = await triggerLogin(values).unwrap();
        if (response?.status) {
          dispatch(
            loginSuccess({
              email: response?.data?.email,
              firstName: response?.data?.firstName,
              lastName: response?.data?.lastName,
              businessName: response?.data?.businessName,
              userType: response?.data?.userType,
            })
          );
          setCookie("_tk", response?.data?.token);
          navigate(APP_PATHS.DASHBOARD);
        } else {
          const message = getErrorMessage(response);
          toast.error(message);
        }
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message || "Something went wrong, try again");
      }
    },
    validationSchema: loginValidationSchema,
  });

  const { handleSubmit, dirty, isValid } = loginFormik;

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-6 font-archivo overflow-hidden">
      <div className="col-span-2 h-screen flex flex-col md:justify-center w-full mx-auto py-7 md:pl-20 md:pr-0 pl-4 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal">Log in</h3>
          <p className="text-base text-[#555555]">
            Enter your details below to log in
          </p>
        </div>

        <div className="mt-7.5 space-y-5">
          <div>
            <Input
              name="email"
              label="Email address"
              placeholder="Enter your email"
              formik={loginFormik}
            />
          </div>
          <div className="space-y-3">
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter password"
              formik={loginFormik}
            />
            <a
              href={APP_PATHS.FORGOT_PASSWORD}
              className="text-primary font-medium"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <div className="mt-12.5">
          <Button
            text="Login"
            className="w-full!"
            loading={isLoading}
            disabled={!(isValid && dirty) || isLoading}
            onClick={handleSubmit}
          />
        </div>

        <div>
          <p className="text-[#555555] font-medium mt-8">
            New here?{" "}
            <a href={APP_PATHS.REGISTRATION} className="text-primary">
              Create an account with us
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

export default Login;
