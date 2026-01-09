/** @format */
import React, { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BackArrow } from "@/assets/svgs";

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
        className="relative z-[999] font-archivo"
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
          <div className="fixed inset-0 bg-[#a3a3a326] bg-opacity-50 backdrop-blur-[4px]" />
        </Transition.Child>

        {/* Side panel */}
        <div className="fixed inset-0 flex justify-end z-[9999] md:mr-10.5 md:my-10.5">
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
              className={`w-full rounded-[20px] max-w-xl h-full transform overflow-hidden bg-[#ffffff] shadow-xl transition-all relative ${containerClass} ${
                transparent && "!bg-transparent"
              }`}
            >
              <div className="flex gap-3 pt-8 px-8 items-center">
                {!hideCloseBtn && (
                  <button
                    type="button"
                    className={`z-10`}
                    onClick={handleClose}
                  >
                    <BackArrow />
                  </button>
                )}

                {title && (
                  <div className=" border-[#1A1A1A] text-2xl font-medium">
                    {title}
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 pt-2 w-full h-full overflow-y-auto">{children}</div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export { Drawer };
