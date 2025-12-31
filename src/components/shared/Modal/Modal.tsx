/** @format */
import React, { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import styles from "./styles.module.css";
import { Close } from "@/assets/svgs";

const Modal: React.FC<{
  open: boolean;
  handleClose: () => void;
  title?: string;
  subtitle?: string;
  hideCloseBtn?: boolean;
  stopOutsideClickClose?: boolean;
  children: ReactNode;
  containerClass?: string;
  transparent?: boolean;
  fullScreen?: boolean;
  sm?: boolean;
  md?: boolean;
}> = ({
  open,
  title,
  subtitle,
  handleClose,
  hideCloseBtn = false,
  stopOutsideClickClose = false,
  children,
  containerClass = "",
  transparent = false,
  fullScreen = false,
  sm,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className={`relative !z-[999] `}
        onClose={!stopOutsideClickClose ? handleClose : () => {}}
        static
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 !z-[999] bg-[#000000B2]"
            aria-hidden={true}
          />
        </Transition.Child>

        <div
          className={`${styles["container"]} fixed inset-0 !z-[9999] overflow-y-auto`}
        >
          <div className="flex items-center justify-center p-4 text-center min-h-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${
                  sm ? "sm:w-[378px]" : "sm:w-[508px]"
                } max-w-full p-6 transform  rounded-lg bg-white text-left align-middle shadow-xl transition-all relative ${containerClass} ${
                  fullScreen && "!h-[calc(100vh-32px)]"
                } ${transparent && "!bg-transparent"}`}
              >
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-5"
                >
                  <h3 className="text-lg font-semibold text-[#121212]">
                    {title}
                    <p className="text-sm font-inter font-normal text-[#6C6C6C]">
                      {subtitle}
                    </p>
                  </h3>
                  {!hideCloseBtn && (
                    <button
                      type="button"
                      className={`${styles["close-btn"]} rounded-full`}
                      onClick={handleClose}
                    >
                      <Close />
                    </button>
                  )}
                </Dialog.Title>

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export { Modal };
