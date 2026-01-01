import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { useFormik } from "formik";
import { useCallback } from "react";
import OtpInput from "react-otp-input";
import styles from "./styles.module.css";

const Otp = () => {
  const initialValues = {
    otp: "",
  };

  const verifyFormik = useFormik({
    initialValues,
    onSubmit: async () => {
      //   try {
      // const response = await triggerVerify({
      //       email: state?.email,
      //       token: values?.otp,
      //     }).unwrap();
      //     if (response?.session && response?.user) {
      //       navigate(APP_PATHS.DASHBOARD);
      //     }
      //   } catch (error: any) {
      //     toast.error(error.message || "Something went wrong, try again");
      //   }
    },
  });

  const handleChange = useCallback((newCode: string) => {
    verifyFormik.setFieldValue("otp", newCode);
    verifyFormik.setFieldTouched("otp", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col justify-center w-full h-full mx-auto py-7 pl-20 pr-12 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal text-black">Enter OTP</h3>
          <p className="text-base">
            Enter the four digits OTP we sent to your mail -
            {/* make this dynamic */}
            <span className="font-medium text-[#030303]">
              nonsochukwuma@gmail.com
            </span>
          </p>
        </div>

        <div className="mt-7.5 space-y-5">
          <div>
            <OtpInput
              containerStyle={{
                // width: "100%",
                justifyContent: "left",
                gap: "5px",
              }}
              inputType="tel"
              shouldAutoFocus={true}
              value={verifyFormik?.values?.otp}
              onChange={handleChange}
              numInputs={4}
              renderInput={(props) => (
                <Input
                  {...props}
                  className={`${styles["otp-input"]} sm:mx-1 md:mx-2 ${
                    verifyFormik?.errors?.["otp"] && styles["error"]
                  }`}
                  placeholder="*"
                  name="otp"
                  hideError
                />
              )}
            />
          </div>
          <div>
            <p>
              Didn't receive a code?{" "}
              <span>
                <a href="">Resend</a>
              </span>{" "}
              in 4 seconds
            </p>
          </div>
        </div>

        <div className="mt-12.5 flex gap-3 items-center">
          <Button variant="outlined" text="Back" className="w-full!" />
          <Button text="Next" className="w-full!" />
        </div>
      </div>

      <div className="col-span-1 h-full px-16 py-10.5 hidden md:block">
        <div
          className="w-full h-full bg-white"
          style={{
            backgroundImage: `url('/src/assets/pngs/onboarding-hero.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
          }}
        />
      </div>
    </div>
  );
};

export default Otp;
