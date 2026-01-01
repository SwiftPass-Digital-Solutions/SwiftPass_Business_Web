import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { APP_PATHS } from "@/constants";

const Login = () => {
  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col justify-center w-full h-full mx-auto py-7 pl-20 pr-12 bg-white rounded-2xl text-[#222222]">
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
            />
          </div>
          <div className="space-y-3">
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter password"
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
          <Button text="Login" className="w-full!" />
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

export default Login;
