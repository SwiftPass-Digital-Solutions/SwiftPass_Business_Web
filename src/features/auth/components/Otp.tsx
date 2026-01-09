import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import styles from "./styles.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useCountdown } from "@/hooks";
import {
  useResendOtpMutation,
  useVerifyForgotPasswordOtpMutation,
} from "@/services";
import { dayJs, getErrorMessage } from "@/utils";
import { toast } from "react-toastify";
import { APP_PATHS } from "@/constants";

const initialValues = {
  otp: "",
};

const Otp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [triggerVerify, { isLoading }] = useVerifyForgotPasswordOtpMutation();
  const [triggerResend, { isLoading: resendLoading }] = useResendOtpMutation();

  const [trackingId, setTrackingId] = useState<string | undefined>(
    state?.trackingId
  );

  const {
    startCountdown: startOtpCountdown,
    setStartCountdown: setStartOtpCountdown,
    countdown: otpCountdown,
    restartCountdown: restartOtpCountdown,
  } = useCountdown();

  const verifyFormik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        const response = await triggerVerify({
          email: state?.email,
          otp: values?.otp,
          trackingId: trackingId,
        }).unwrap();
        if (response?.status) {
          navigate(APP_PATHS.CONFIRM_PASSWORD, {
            state: { ...state, ...response?.data },
          });
        } else {
          const message = getErrorMessage(response);
          toast.error(message);
        }
      } catch (error: any) {
        const message = getErrorMessage(error);
        toast.error(message || "Something went wrong, try again");
      }
    },
  });

  const handleResendOtp = async () => {
    try {
      const response = await triggerResend({
        email: state?.contactEmail,
      }).unwrap();
      if (response?.status) {
        toast.success(response?.message);
        setTrackingId(response?.data?.trackingId);
        restartOtpCountdown();
      } else {
        const message = getErrorMessage(response);
        toast.error(message);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message || "Something went wrong, try again");
    }
  };

  const { dirty, isValid, handleSubmit } = verifyFormik;

  const handleChange = useCallback((newCode: string) => {
    verifyFormik.setFieldValue("otp", newCode);
    verifyFormik.setFieldTouched("otp", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state) navigate(-1);
    setStartOtpCountdown(true);
  }, [state]);

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col md:justify-center w-full h-full mx-auto py-7 md:pl-20 pl-4 md:pr-12 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal text-black">Enter OTP</h3>
          <p className="text-base">
            Enter the four digits OTP we sent to your mail -{" "}
            {/* make this dynamic */}
            <span className="font-medium text-[#030303]">{state?.email}</span>
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
              <button
                className="border-none bg-transparent disabled:cursor-not-allowed cursor-pointer"
                onClick={handleResendOtp}
                disabled={startOtpCountdown || resendLoading}
              >
                <span className="underline">Resend</span>
              </button>{" "}
              {startOtpCountdown &&
                `in ${dayJs.duration(otpCountdown, "seconds").format("mm:ss")}`}
            </p>
          </div>
        </div>

        <div className="mt-12.5 flex gap-3 items-center">
          <Button
            variant="outlined"
            text="Back"
            className="w-full!"
            onClick={() => navigate(-1)}
          />
          <Button
            text="Next"
            className="w-full!"
            disabled={!(dirty && isValid) || isLoading}
            loading={isLoading}
            onClick={handleSubmit}
          />
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

export default Otp;
