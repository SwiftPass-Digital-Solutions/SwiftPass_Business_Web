import { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.css";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store";
import { Sidebar } from "./components";
import { DashboardHeader } from "./components/Header";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  const { sidebarOpen } = useAppSelector((state) => state?.app);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // const dispatch = useAppDispatch();

  const sideBarWidth = useMemo(() => (sidebarOpen ? 303 : 80), [sidebarOpen]);

  const handleToggleDrawer = useCallback(
    () => setMobileSidebarOpen((prev) => !prev),
    []
  );

  return (
    <div className={`${styles["wrapper"]} px-0`}>
      <div className={`relative dashboard-container px-0`}>
        <main className={`flex relative`}>
          <Sidebar
            handleToggleDrawer={handleToggleDrawer}
            mobileSidebarOpen={mobileSidebarOpen}
          />
          <motion.div
            transition={{ delay: 100 }}
            className={`${styles["container"]} grow flex flex-col z-10 relative`}
            style={
              { "--sidebar-width": `${sideBarWidth}px` } as React.CSSProperties
            }
          >
            <DashboardHeader
              sideNavIsOpen={sidebarOpen}
              handleToggleDrawer={handleToggleDrawer}
            />
            <div className="flex-1 p-7.5 bg-[#ffffff] overflow-x-hidden">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
