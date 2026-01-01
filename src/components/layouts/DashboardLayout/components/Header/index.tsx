import { FC } from "react";
import styles from "./styles.module.css";
import { capitalizeFirstLetter } from "@/utils";
import { Menu } from "lucide-react";
import { useLocation } from "react-router";
import { NAV_HEADER } from "@/constants";
import { NotificationBell } from "@/assets/svgs";

type NavHeaderKey = keyof typeof NAV_HEADER;

const Header: FC<{
  sideNavIsOpen?: boolean;
  handleToggleDrawer: () => void;
}> = ({ sideNavIsOpen, handleToggleDrawer }) => {
  const { pathname } = useLocation();
  const title = (pathname?.split("/")[1] as NavHeaderKey) || "";
  return (
    <div
      className={`${styles["wrapper"]} font-archivo z-10 sticky top-0 bg-white`}
    >
      <header
        className={`${styles.container} ${
          styles.nav
        } px-8 mt-15 flex justify-between items-center gap-3 md:gap-6 ${
          !sideNavIsOpen && ""
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-gray-800 dark:text-white md:hidden"
            onClick={handleToggleDrawer}
          >
            <Menu stroke="#000000" />
          </button>
          <div className="">
            <p className="text-[#030303] text-xl md:text-[22px] font-semibold">
              {capitalizeFirstLetter(title.replace("-", " "))}
            </p>
            <p className="text-base text-[#737373] font-normal">
              {NAV_HEADER[title]}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-7.5">
          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell />
          </div>
        </div>
      </header>

      <hr className="mx-8 border border-[#EEEEEE] mt-4" />
    </div>
  );
};

export { Header as DashboardHeader };
