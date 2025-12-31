import { PageLoader } from "@/components";
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import { APP_PATHS } from "@/constants";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAppSelector } from "@/store";

// Lazy import the Login component
const Login = lazy(() => import("../features/auth/components/Login"));
const Otp = lazy(() => import("../features/auth/components/Otp"));
const ConfirmPassword = lazy(
  () => import("../features/auth/components/ConfirmPassword")
);
const ForgotPassword = lazy(
  () => import("../features/auth/components/ForgotPassword")
);
const Registration = lazy(
  () => import("../features/onboarding/components/Registration")
);
const OnboardingOtp = lazy(
  () => import("../features/onboarding/components/Otp")
);
const CreateAccount = lazy(
  () => import("../features/onboarding/components/CreateAccount")
);
const UploadDocs = lazy(
  () => import("../features/onboarding/components/UploadDocs")
);

const AppRoutes = () => {
  const { loggedIn } = useAppSelector((state) => state.auth);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={APP_PATHS.HOME} element={<Login />} />
        <Route path={APP_PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={APP_PATHS.OTP} element={<Otp />} />
        <Route path={APP_PATHS.ONBOARDING_OTP} element={<OnboardingOtp />} />
        <Route path={APP_PATHS.CREATE_ACCOUNT} element={<CreateAccount />} />
        <Route path={APP_PATHS.UPLOAD_DOCS} element={<UploadDocs />} />
        <Route
          path={APP_PATHS.CONFIRM_PASSWORD}
          element={<ConfirmPassword />}
        />
        <Route path={APP_PATHS.REGISTRATION} element={<Registration />} />
        <Route element={<ProtectedRoutes authenticated={true} />}>
          <Route element={<DashboardLayout />}></Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
