import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Checkbox, Input, Select } from "@/components";

const Registration = () => {
  return (
    <div className="w-full h-screen grid grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 h-full overflow-y-auto w-full mx-auto py-7 pl-20 pr-12 bg-white rounded-2xl text-[#222222]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal">Welcome to SwiftPass</h3>
          <p className="text-base text-[#555555]">
            These details help us match your documents correctly. Make sure they
            align with your official registration
          </p>
        </div>

        <div className="mt-7.5 space-y-5">
          <Input
            name="businessName"
            label="Business Name"
            placeholder="Enter your business name"
          />

          <Input
            name="registrationNumber"
            label="Registration Number (CAC)"
            placeholder="BN: 8765432"
          />

          <Select
            name="businessType"
            label="Business Type"
            placeholder="Enter your business type e.g ltd"
            options={[]}
          />

          <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-3">
            <Input
              name="contactEmail"
              label="Contact Email"
              placeholder="Enter your email"
            />
            <Input
              name="contactPhone"
              label="Contact Phone"
              placeholder="Enter your phone number"
            />
          </div>

          <Checkbox
            name="terms"
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

        <div className="mt-12.5">
          <Button text="Next" className="w-full!" />
        </div>

        <div>
          <p className="text-[#555555] font-medium mt-8">
            Not new here?{" "}
            <a href="" className="text-primary">
              Login
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

export default Registration;
