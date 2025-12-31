import React from "react";
import styles from "./styles.module.css";
import { useAppSelector } from "@/store";
import { INavItem } from "./SidebarContent";
import { Tooltip } from "@/components/shared";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router";
// import { ArrowDownNav } from "@/app/assets";

const SidebarItem: React.FC<{
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  path?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  sub?: INavItem["sub"];
  isOpen?: boolean;
}> = ({
  icon: Icon,
  title,
  path,
  onClick,
  isActive = false,
  className = "",
  sub,
  isOpen = false,
}) => {
  const { sidebarOpen } = useAppSelector((state) => state?.app);

  return (
    <Tooltip text={title} showTooltip={sidebarOpen === false} position="right">
      <Link
        to={path || "#"}
        onClick={onClick}
        className={`${styles["icon-wrapper"]} ${path && styles["nav-icon"]} ${
          isActive ? `${styles["active"]} text-primary-100 bg-[#F5F7F9]` : ""
        } flex items-center gap-3 px-2 ${
          sidebarOpen && "pl-7"
        } py-3.5 hover:bg-[#F5F7F9] border-l-8 border-[#072760] cursor-pointer ${
          sidebarOpen === false && "md:justify-center"
        }  ${className}`}
      >
        {Icon && <Icon height={24} width={24} />}
        <span
          className={`${
            isActive ? `text-[#072760]` : "text-[#E5E7EB]"
          } text-sm font-normal hover:text-black ${
            sidebarOpen === false && "md:hidden"
          }`}
        >
          {title}
        </span>
        {sub && sidebarOpen && (
          <ArrowDown className={`${isOpen ? "" : "rotate-180"} ml-auto`} />
        )}
      </Link>
    </Tooltip>
  );
};

export { SidebarItem };
