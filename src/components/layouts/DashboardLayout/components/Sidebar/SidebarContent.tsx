import React, { useCallback, useMemo } from "react";
import styles from "./styles.module.css";
import { motion } from "framer-motion";
import { toggleSideBar, useAppDispatch, useAppSelector } from "@/store";
import { SidebarItemWrapper } from "./SidebarItemWrapper";
import { dashboardNavigation } from "@/constants/navigation";
import { ChevronLeft } from "lucide-react";
import { APP_PATHS } from "@/constants";
import { Link, useNavigate } from "react-router";
import { SwiftPassLogo } from "@/assets/svgs";
import { Button } from "@/components/shared";
import { Avatar } from "@/assets/pngs";
import { useDashboardStatus } from "@/hooks";

export interface INavItem {
  title: string;
  url: string;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  sub?: {
    title: string;
    url: string;
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  }[];
}

const SidebarContent: React.FC<{
  isOpen: boolean;
  className?: string;
}> = ({ isOpen, className = "" }) => {
  const dispatch = useAppDispatch();
  const { businessName, email } = useAppSelector((state) => state.auth);
  const { dashboardData } = useDashboardStatus();
  const navigate = useNavigate();

  const dashboardPaths: INavItem[] = useMemo(() => {
    return dashboardNavigation || [];
  }, []);

  const handleToggleSidebar = useCallback(
    () => dispatch(toggleSideBar()),
    [dispatch]
  );

  // const handleLogout = useCallback(async () => {
  //   try {
  //     dispatch(logout());
  //     handleLogoutRedirect();
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (error) {
  //     dispatch(logout());
  //     handleLogoutRedirect();
  //   }
  // }, [dispatch]);

  return (
    <div
      className={`${styles["wrapper"]} flex font-archivo flex-col h-full min-h-screen`}
    >
      <motion.div
        className={`${styles["container"]} ${
          isOpen ? styles["open"] : styles["close"]
        } h-full flex-grow bg-[#FAFAFA] flex flex-col relative`}
      >
        <div
          className={`flex justify-between items-center ${
            !isOpen ? "" : "gap-3 md:gap-6"
          }`}
        >
          <Link to={APP_PATHS.DASHBOARD}>
            <div
              className={`flex  ${
                isOpen ? "mx-8" : "ml-5"
              } mt-7 items-center gap-2 justify-center h-10`}
            >
              <SwiftPassLogo width={40} height={32} />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-5 ml-auto">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className={`border-none p-2 cursor-pointer ${
                !isOpen
                  ? "bg-white absolute -right-5 top-5 rounded-full shadow-md"
                  : "bg-transparent absolute right-3 top-6 "
              }`}
            >
              <ChevronLeft
                width={20}
                className={`${isOpen ? "" : "rotate-180"}`}
                stroke={`${isOpen ? "#000" : "#000000"}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`mt-8 flex flex-col gap-3 no-scrollbar mb-auto ${className}`}
        >
          {dashboardPaths.map(({ title, url, icon, sub }, i) => (
            <SidebarItemWrapper
              icon={icon}
              title={title}
              url={url}
              key={i}
              sub={sub}
              sideBarOpen={isOpen}
            />
          ))}
        </div>
        <div
          className={`md:mt-5 space-y-4 ${
            isOpen ? "mx-8 py-3.5 px-3" : "hidden"
          }`}
        >
          <div className="p-4 bg-primary border border-[#6D88F4] rounded-xl text-white text-xs text-center">
            <div className="flex justify-center mb-4">
              <img src={Avatar} width={64} height={64} alt="" />
            </div>
            <h3 className="text-lg font-medium">{businessName}</h3>
            <p>{email}</p>
            {!dashboardData?.hasUploadedDocuments && (
              <div className="mt-4">
                <Button
                  variant="outlined"
                  text="Upload documents"
                  onClick={() => navigate(APP_PATHS.COMPLIANCE)}
                  textClass="text-xs! whitespace-nowrap text-primary! font-medium!"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { SidebarContent };
