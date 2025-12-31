import { FC } from "react";
import styles from "./styles.module.css";
import { capitalizeFirstLetter } from "@/utils";
import { Bell, CircleQuestionMark, Menu } from "lucide-react";
import { useLocation } from "react-router";
import { NAV_HEADER } from "@/constants";
import { Input } from "@/components/shared";

type NavHeaderKey = keyof typeof NAV_HEADER;

const Header: FC<{
  sideNavIsOpen?: boolean;
  handleToggleDrawer: () => void;
}> = ({ sideNavIsOpen, handleToggleDrawer }) => {
  const { pathname } = useLocation();
  const title = (pathname?.split("/")[1] as NavHeaderKey) || "";
  return (
    <div
      className={`${styles["wrapper"]} font-bricolage z-10 w-full sticky top-0 bg-white border-[#E5E7EB] border-b-[0.5px]`}
    >
      <header
        className={`${styles.container} ${
          styles.nav
        } px-5 py-8 flex justify-between items-center gap-3 md:gap-6 ${
          !sideNavIsOpen && "md:pl-10"
        }`}
      >
        <div className="w-[60%]">
          <button
            type="button"
            className="p-2 text-gray-800 dark:text-white md:hidden"
            onClick={handleToggleDrawer}
          >
            <Menu stroke="#000000" />
          </button>
          <div className="ml-7.5">
            <p className="text-[#222222]  text-base font-semibold">
              {capitalizeFirstLetter(title.replace("-", " "))}
            </p>
            <p className="text-sm text-[#5A5A5A] font-normal">
              {NAV_HEADER[title]}
            </p>
          </div>
        </div>

        <div className="w-[40%] flex items-center gap-7.5">
          <div className="w-full">
            <Input
              name="search"
              bgType="search"
              placeholder="Search for tickets, customers or payment"
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Bell width={20} stroke="#6C757D" />
            <CircleQuestionMark width={20} stroke="#6C757D" />
          </div>
        </div>
      </header>
    </div>
  );
};

export { Header as DashboardHeader };
