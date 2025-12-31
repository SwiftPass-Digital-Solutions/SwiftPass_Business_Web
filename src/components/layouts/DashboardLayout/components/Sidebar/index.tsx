import React, { Fragment, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store";
import { Dialog, Transition } from "@headlessui/react";
import { SidebarContent } from "./SidebarContent";
import { useLocation } from "react-router";
import { Close } from "@/assets/svgs";

const Sidebar: React.FC<{
  handleToggleDrawer: () => void;
  mobileSidebarOpen: boolean;
}> = ({ handleToggleDrawer, mobileSidebarOpen }) => {
  const { sidebarOpen } = useAppSelector((state) => state?.app);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname && mobileSidebarOpen) {
      handleToggleDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleToggleDrawer, pathname]);

  return (
    <div className="relative">
      <div className="hidden md:block md:sticky top-0 left-0 z-40">
        <SidebarContent isOpen={sidebarOpen} />
      </div>
      <div className="md:hidden">
        <Transition show={mobileSidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 md:hidden"
            onClose={handleToggleDrawer}
          >
            <div className="fixed inset-0" />

            <div className="fixed inset-0 flex">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50"
                aria-hidden="true"
                onClick={handleToggleDrawer}
              />

              {/* Drawer content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-64 shadow-xl h-full"
              >
                <button
                  type="button"
                  className="absolute top-4 right-4 z-[100] bg-white rounded-full h-8 w-8 flex items-center justify-center"
                  onClick={handleToggleDrawer}
                >
                  <Close />
                </button>
                <SidebarContent
                  className="overflow-y-auto"
                  isOpen={mobileSidebarOpen}
                />
              </motion.div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export { Sidebar };
