import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";

const ForgotPassword = () => {
  return (
    <div className="w-full h-screen grid grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col justify-center w-full h-full mx-auto py-7 pl-20 pr-12 bg-white rounded-2xl text-[#222222]">
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
            />
          </div>
        </div>

        <div className="mt-12.5">
          <Button text="Next" className="w-full!" />
        </div>

        <div>
          <p className="text-[#555555] font-medium mt-8">
            Remember password?{" "}
            <a href="" className="text-primary">
              Log in
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

export default ForgotPassword;
