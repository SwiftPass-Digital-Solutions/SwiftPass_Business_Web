import { FC } from "react";
import styles from "./styles.module.css";
import { capitalizeFirstLetter } from "@/utils";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { APP_PATHS, NAV_DESCRIPTION, NAV_HEADER } from "@/constants";
import { NotificationBell } from "@/assets/svgs";
import { useAppSelector } from "@/store";

type NavDescKey = keyof typeof NAV_DESCRIPTION;

const Header: FC<{
  sideNavIsOpen?: boolean;
  handleToggleDrawer: () => void;
}> = ({ sideNavIsOpen, handleToggleDrawer }) => {
  const { pathname } = useLocation();
  const title = (pathname?.split("/")[1] as NavDescKey) || "";
  const subtitle = (pathname?.split("/")[2] as NavDescKey) || "";
  const { businessName } = useAppSelector((state) => state.auth);
  const maintitle = subtitle || title;
  const navigate = useNavigate();

  const getHeaderText = () => {
    const header = NAV_HEADER[maintitle];

    if (!header) return "";

    if (typeof header === "function") {
      return header(businessName || "");
    }

    return header;
  };

  return (
    <div
      className={`${styles["wrapper"]} font-archivo z-10 sticky top-0 bg-white`}
    >
      <header
        className={`${styles.container} ${
          styles.nav
        } px-8 mt-6 md:mt-15 flex justify-between items-center gap-3 md:gap-6 ${
          !sideNavIsOpen && ""
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-gray-800 dark:text-white md:hidden border border-[#EEEEEE] rounded-lg"
            onClick={handleToggleDrawer}
          >
            <Menu stroke="#292D32" />
          </button>
          <div className="">
            <p className="text-[#030303] block md:hidden text-xl md:text-[22px] font-medium">
              {capitalizeFirstLetter(maintitle.replace("-", " ")) ===
                "Dashboard" && "Overview"}
            </p>
            <div className="hidden md:block">
              <p className="text-[#030303] text-xl md:text-[22px] font-medium">
                {getHeaderText()}
              </p>
              <p className="text-base text-[#737373] font-normal">
                {NAV_DESCRIPTION[maintitle]}
              </p>
            </div>
          </div>
        </div>

        <div className=" flex items-center gap-7.5">
          <button
            onClick={() => navigate(APP_PATHS.NOTIFICATIONS)}
            className="flex bg-transparent border-none items-center gap-4 ml-auto cursor-pointer"
          >
            <NotificationBell />
          </button>
        </div>
      </header>

      <div className="block md:hidden mx-8 mt-6">
        <p className="text-[#030303] text-xl font-medium">{getHeaderText()}</p>
        <p className="text-sm text-[#737373] font-normal">
          {NAV_DESCRIPTION[maintitle]}
        </p>
      </div>

      <hr className="mx-8 border border-[#EEEEEE] md:mt-4 hidden md:block" />
    </div>
  );
};

export { Header as DashboardHeader };
