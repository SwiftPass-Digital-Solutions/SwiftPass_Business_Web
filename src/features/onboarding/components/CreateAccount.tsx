import { SwiftPassLogo } from "@/assets/svgs";
import { Button, Input } from "@/components";
import { CheckItem } from "@/features/auth/components/CheckItem";
import { confirmPasswordSchema } from "@/validations";
import { useFormik } from "formik";

const CreateAccount = () => {
  const initialValues = {
    password: "",
    password2: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: () => {},
    validationSchema: confirmPasswordSchema,
  });

  const { values } = formik;

  const password = values.password;

  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    minLength: password.length >= 8,
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 font-archivo overflow-hidden">
      <div className="col-span-1 flex flex-col md:justify-center w-full h-full mx-auto py-7 md:pl-20 pl-4 md:pr-12 pr-4 bg-white rounded-2xl text-[#555555]">
        <SwiftPassLogo />

        <div className="space-y-1 mt-8">
          <h3 className="text-2xl font-normal">Create account</h3>
          <p className="text-base text-[#555555]">
            Provide basic details to setup your profile
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
          <Button variant="outlined" text="Back" className="w-full!" />
          <Button text="Create my account" className="w-full!" />
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

export default CreateAccount;
