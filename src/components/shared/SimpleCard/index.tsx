import React, { ReactNode } from "react";
import { Button } from "../Button";
import { Link } from "react-router-dom";
import { BackArrow, Search } from "@/assets/svgs";
import Input from "../Input";

interface SimpleCardProps {
  containerVariant?: string;
  title?: string;
  subTitle?: string;
  info?: string;
  children?: ReactNode;
  showButton?: boolean;
  showSearch?: boolean;
  buttonProps?: React.ComponentProps<typeof Button>;
  searchProps?: React.ComponentProps<typeof Input>;
  showBackArrow?: boolean;
  backArrowText?: string;
  backArrowLink?: string;
  showStep?: boolean;
  step?: string | number;
}

const SimpleCard: React.FC<SimpleCardProps> = ({
  containerVariant = "w-full h-auto bg-white",
  title,
  subTitle,
  info,
  children,
  showButton = false,
  showSearch = false,
  buttonProps,
  searchProps,
  showBackArrow = false,
  backArrowText = "Back",
  backArrowLink = "#",
  showStep = false,
  step,
}) => {
  return (
    <div className={`${containerVariant} rounded-lg font-inter shadow-md`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-6 pt-6">
        <div className="items-center">
          {showBackArrow && (
            <div className="mb-8">
              <Link
                to={backArrowLink}
                className="flex items-center gap-3 text-sm text-red"
              >
                <BackArrow />
                <span>{backArrowText}</span>
              </Link>
            </div>
          )}

          <p className="text-xl font-bold text-left text-title-black">
            {title}
          </p>
          {subTitle && (
            <p className="text-sm mt-1 text-subtitle-gray font-normal text-left text-nav-item-inactive">
              {subTitle}
            </p>
          )}
          {info && (
            <p className="text-xs mt-1 text-black text-left">{info}</p>
          )}
        </div>

        <div className="flex items-center gap-5">
          {showSearch && (
            <div>
              <Input
                placeholder="Search"
                name=""
                Icon={Search}
                {...searchProps}
              />
            </div>
          )}
          {showButton && (
            <div>
              <Button {...buttonProps} />
            </div>
          )}
          {showStep && (
            <div>
              <p>{step}</p>
            </div>
          )}
        </div>
      </div>

      {/* Children Content */}
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  );
};

export { SimpleCard };
