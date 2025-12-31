import React, { useCallback, useMemo } from "react";
import styles from "./styles.module.css";
import { motion } from "framer-motion";
import { logout, toggleSideBar, useAppDispatch } from "@/store";
import { SidebarItemWrapper } from "./SidebarItemWrapper";
import { dashboardNavigation } from "@/constants/navigation";
import { handleLogoutRedirect } from "@/utils";
import { ChevronLeft, LogOutIcon } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { APP_PATHS } from "@/constants";
import { Link } from "react-router";
import { SwiftPassLogo } from "@/assets/svgs";

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

  const dashboardPaths: INavItem[] = useMemo(() => {
    return dashboardNavigation || [];
  }, []);

  const handleToggleSidebar = useCallback(
    () => dispatch(toggleSideBar()),
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    try {
      dispatch(logout());
      handleLogoutRedirect();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      dispatch(logout());
      handleLogoutRedirect();
    }
  }, [dispatch]);

  return (
    <div className={`${styles["wrapper"]} flex flex-col h-full min-h-screen`}>
      <motion.div
        className={`${styles["container"]} ${
          isOpen ? styles["open"] : styles["close"]
        } h-full flex-grow bg-[#072760] flex flex-col  shadow-lg relative`}
      >
        <div
          className={`flex justify-between items-center p-2 ${
            !isOpen ? "" : "gap-3 md:gap-6"
          }`}
        >
          <Link to={APP_PATHS.DASHBOARD}>
            <div className="flex mt-7 ml-7 items-center gap-2 justify-center h-10">
              <SwiftPassLogo />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-5 ml-auto">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className={`border-none p-2 ${
                !isOpen
                  ? "bg-white absolute -right-5 top-5 rounded-full shadow-md"
                  : "bg-transparent"
              }`}
            >
              <ChevronLeft
                width={20}
                className={`${isOpen ? "" : "rotate-180"}`}
                stroke={`${isOpen ? "#ffffff" : "#000000"}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`mt-9 pt-2 flex flex-col gap-3 no-scrollbar mb-auto ${className}`}
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
        <div className="md:mt-5 border-t-[0.5px] space-y-4 border-[#1F3B8B] md:pt-5 pb-2 px-4 py-2">
          <SidebarItem
            icon={LogOutIcon}
            title="Log out"
            onClick={handleLogout}
          />
        </div>
      </motion.div>
    </div>
  );
};

export { SidebarContent };
