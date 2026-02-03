import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
  className?: string;
};

const SlidePanel: React.FC<Props> = ({ open, onClose, children, widthClass = "sm:w-[640px]", className = "" }) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} aria-hidden="true" />

      <div className={`fixed top-4 right-4 bottom-4 w-full ${widthClass} bg-white rounded-3xl shadow-2xl z-[70] transform transition-transform duration-300 ease-out overflow-hidden ${open ? 'translate-x-0' : 'translate-x-full'} ${className}`}>
        {children}
      </div>
    </>
  );
};

export default SlidePanel;
