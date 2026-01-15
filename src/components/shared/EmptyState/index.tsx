import React from "react";

const EmptyState = ({
  icon: Icon,
  title = "No Data Yet",
  message = "Your data will appear here",
}: {
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title?: string;
  message?: string;
}) => {
  return (
    <div
      className="flex flex-col gap-3 text-center justify-center items-center w-full h-full p-5"
      style={{ margin: 0 }}
    >
      <div className="flex justify-center items-center">
        {Icon && (
          <div className="flex items-center justify-center max-w-full max-h-full">
            <Icon />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 justify-center items-center">
        <h5 className="text-black-900 text-xl">{title}</h5>
        <p className="text-black-900 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
