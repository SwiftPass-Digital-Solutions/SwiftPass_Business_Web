import { SwiftPassLogo } from "@/assets/svgs";
import { useEffect } from "react";

const PageLoader = ({
  message = "Please wait",
  showMessage = false,
  isTransparent = true,
}: {
  message?: string;
  showMessage?: boolean;
  isTransparent?: boolean;
}) => {
  useEffect(() => {
    if (document && document.body) {
      const { body } = document;

      body.classList.add("overflow-hidden");
      return () => {
        body.classList.remove("overflow-hidden");
      };
    }
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 flex justify-center items-center w-full h-full p-5 !z-[99999] overflow-hidden ${
        !isTransparent
          ? "bg-white"
          : "backdrop-blur-xs backdrop-filter bg-transparent"
      }`}
      style={{ margin: 0 }}
    >
      <center
        className={`z-10 flex flex-col items-center justify-center ${
          showMessage ? "gap-2" : "gap-4"
        }`}
      >
        <div
          className={`${
            showMessage ? "w-[76px] h-[76px]" : "w-[132px] h-[132px]"
          } flex justify-center items-center relative`}
        >
          <div
            className={`${
              showMessage
                ? "w-[76px] h-[76px] border-[6px]"
                : "w-[120px] h-[120px] border-8"
            } animate-spin max-w-full max-h-full bg-white border-[#CECECE] rounded-full`}
          />
          <div className="flex items-center justify-center animate-pulse absolute max-w-full max-h-full">
            <SwiftPassLogo
              className={showMessage ? "scale-[45%]" : "scale-[70%]"}
              // alt="logo"
            />
          </div>
        </div>
        {showMessage && (
          <p className="text-white text-base md:text-2xl font-semibold">
            {message}...
          </p>
        )}
      </center>
    </div>
  );
};

export default PageLoader;
