import React, { useCallback, useEffect, useState } from "react";
import { INavItem } from "./SidebarContent";
import { SidebarItem } from "./SidebarItem";
import { useLocation } from "react-router";

const SidebarItemWrapper: React.FC<
  INavItem & { sideBarOpen?: boolean; onClick?: () => void }
> = ({ title, url, icon, sub, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const isActivePath = useCallback(
    (path: string) => pathname === path || pathname.startsWith(`${path}/`),
    [pathname]
  );

  useEffect(() => {
    if (!pathname?.includes(url)) {
      setIsOpen(false);
    }
  }, [pathname, url]);

  return (
    <div
      className={`relative font-archivo flex flex-col gap-4 ${
        sub ? "bg-gray-100 rounded-lg py-2" : ""
      }`}
      onClick={onClick}
    >
      <SidebarItem
        isActive={isActivePath(url) && !sub}
        icon={icon}
        title={title}
        path={sub ? "#" : url}
        onClick={sub ? () => setIsOpen((prev) => !prev) : undefined}
        sub={sub}
        isOpen={isOpen}
      />
      {isOpen &&
        sub &&
        sub.map(({ title, url, icon }, i) => (
          <SidebarItem
            key={i}
            isActive={isActivePath(url)}
            title={title}
            path={url}
            icon={icon}
          />
        ))}
    </div>
  );
};

export { SidebarItemWrapper };
