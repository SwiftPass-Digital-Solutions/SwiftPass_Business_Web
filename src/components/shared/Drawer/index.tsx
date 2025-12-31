/** @format */
import React, { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import styles from "./styles.module.css";
import { X } from "lucide-react";

const Drawer: React.FC<{
  open: boolean;
  handleClose: () => void;
  title?: string | ReactNode;
  hideCloseBtn?: boolean;
  stopOutsideClickClose?: boolean;
  children: ReactNode;
  containerClass?: string;
  transparent?: boolean;
}> = ({
  open,
  title,
  handleClose,
  hideCloseBtn = false,
  stopOutsideClickClose = false,
  children,
  containerClass = "",
  transparent = false,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[999]"
        onClose={!stopOutsideClickClose ? handleClose : () => {}}
        static
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black-500 bg-opacity-50 backdrop-blur-[2px]" />
        </Transition.Child>

        {/* Side panel */}
        <div className="fixed inset-0 flex justify-end z-[9999]">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel
              className={`w-full max-w-xl h-full transform overflow-hidden bg-[#ffffff] shadow-xl transition-all relative ${containerClass} ${
                transparent && "!bg-transparent"
              }`}
            >
              {!hideCloseBtn && (
                <button
                  type="button"
                  className={`${styles["close-btn"]} absolute top-4 right-4 z-10`}
                  onClick={handleClose}
                >
                  <X />
                </button>
              )}

              {title && (
                <div className="p-4 border-b border-gray-200 text-lg font-semibold">
                  {title}
                </div>
              )}

              <div className="p-4 h-full overflow-y-auto">{children}</div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export { Drawer };
