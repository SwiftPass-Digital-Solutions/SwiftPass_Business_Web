import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { InfoCircle, WhiteX } from "@/assets/svgs";

type InputType = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  open: boolean;
  onClose: () => void;
};

function Indicator({ message, type = "error", open, onClose }: InputType) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => setVisible(true));

      const timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose();
        }, 300);
      }, 10000);

      return () => clearTimeout(timeout);
    } else {
      // Handle when open becomes false (e.g. Redux closes it early)
      setVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // match animation duration

      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`text-sm w-full text-white flex justify-between items-center gap-2 py-2 px-10 md:px-20 my-[2px] transition-all duration-300 ease-in-out ${
        styles[type]
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
    >
      <div className="flex gap-3 items-center">
        <span>
          <InfoCircle />
        </span>
        <span>{message}</span>
      </div>
      <div>
        <WhiteX />
      </div>
    </div>
  );
}

export { Indicator };
