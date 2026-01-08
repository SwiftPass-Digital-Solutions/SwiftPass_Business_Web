/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  SyntheticEvent,
  Fragment,
  useMemo,
  useCallback,
} from "react";
import styles from "./styles.module.css";
import { FormikProps } from "formik";
import { Listbox, Transition } from "@headlessui/react";
import { ArrowDown } from "@/assets/svgs";
// import { Checkbox } from "../Checkbox";
import Input from "../Input";
import { Search } from "@/assets/svgs";
import clsx from "clsx";

type SelectType<T> = {
  onClick?: () => void;
  label?: string;
  className?: string;
  defaultValue?: string | T;
  id?: string;
  name: string;
  formik?: FormikProps<any>;
  placeholder?: string | "";
  Icon?: any;
  options: { label: string; value: string | T }[] | string[];
  disabled?: boolean;
  multiple?: boolean;
  showSearch?: boolean;
  searchProps?: React.ComponentProps<typeof Input>;
  loading?: boolean;
  showRadio?: boolean;
};

function Select({
  // onClick,
  label,
  className,
  defaultValue,
  // id,
  name,
  formik,
  Icon,
  options,
  disabled = false,
  multiple = false,
  showSearch = false,
  searchProps,
  loading = false,
  showRadio = false,
  ...rest
}: SelectType<any>) {
  const [isFocused, setIsFocused] = useState(false);
  const error = useMemo(
    () => formik && formik.errors?.[name],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik?.touched, formik?.errors, name]
  );

  let classes = `${styles.container} ${className} flex flex-col relative`;

  const status = formik && formik.status?.[name];
  if (error || status) classes += ` ${styles["error"]}`;

  const placeholder = rest.placeholder;
  if (formik) {
    Object.assign(rest, {
      onChange: handleChange,
      onBlur: (e: SyntheticEvent) => {
        setIsFocused(false);
        return formik?.handleBlur(e);
      },
      value: formik?.values[name],
    });
  }

  const allOptions = useMemo(
    () => [{ label: placeholder, value: "" }, ...options],
    [options, placeholder]
  );

  const getSelectLabel = useCallback(() => {
    let optionLabel = multiple
      ? allOptions
          .filter((option) =>
            typeof option === "string"
              ? formik?.values?.[name]?.includes(option)
              : formik?.values?.[name]?.includes(option.value)
          )
          .map((option) => (typeof option === "string" ? option : option.label))
          .join(", ")
      : allOptions.find((option) =>
          typeof option === "string"
            ? option === formik?.values?.[name]
            : option.value === formik?.values?.[name]
        );

    if (!optionLabel) {
      return {
        label: placeholder ?? "Select...",
        isPlaceholder: true,
      };
    }

    return {
      label:
        typeof optionLabel === "string"
          ? optionLabel.replace("<br/>", " ")
          : optionLabel.label?.replace("<br/>", " "),
      isPlaceholder: false,
    };
  }, [multiple, allOptions, formik?.values, name, placeholder]);

  function handleChange(e: string) {
    formik?.setValues({ ...formik?.values, [name]: e });
  }

  const { label: selectedLabel, isPlaceholder } = getSelectLabel();

  return (
    <div className={classes}>
      {label && (
        <label
          className={`${isFocused ? styles["active"] : ""} mb-2`}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      {Icon ? <Icon className={`${styles.icon}`} /> : ""}
      <Listbox
        value={formik?.values?.[name] || defaultValue}
        onChange={handleChange}
        disabled={disabled}
        multiple={multiple}
      >
        <div className="relative rounded-xl border border-[#E6E6E6]">
          <Listbox.Button
            className={`relative w-full cursor-pointer rounded-[3px] px-4 text-left focus:outline-none sm:text-sm flex items-center ${
              disabled && "cursor-not-allowed"
            }`}
          >
            <span
              className={clsx(
                "w-[80%] block truncate mr-2 pt-4.25 grow",
                isPlaceholder ? "text-[#9ca3af]" : "text-[#222222] font-normal"
              )}
            >
              {selectedLabel}
            </span>
            <ArrowDown className="auto" />
          </Listbox.Button>
          <Transition as={Fragment} leave="transition-opacity duration-100">
            <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto bg-white shadow-lg rounded-[3px] text-sm">
              {showSearch && (
                <div className="px-2 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
                  <Input name="" Icon={Search} {...searchProps} />
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <>
                  {allOptions.map((option, i) => (
                    <Listbox.Option
                      key={`${
                        typeof option === "string" ? option : option.value
                      }${i}`}
                      value={typeof option === "string" ? option : option.value}
                      className={({ active }) =>
                        `cursor-pointer select-none p-2 ${
                          active ? "bg-grey-bg" : ""
                        }`
                      }
                      disabled={
                        !(typeof option === "string"
                          ? option && option === "0"
                          : typeof option.value === "boolean" ||
                            option.value ||
                            option.value == "0")
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`flex items-center gap-3 ${
                            selected
                              ? "font-medium bg-primary-200"
                              : "font-normal"
                          }`}
                        >
                          {/* {multiple &&
                            (typeof option === "string"
                              ? option
                              : option.value) && (
                              <Checkbox name="" checked={selected} />
                            )} */}
                          {showRadio && (
                            <input
                              type="radio"
                              name={name}
                              checked={
                                formik?.values?.[name] ===
                                (typeof option === "string"
                                  ? option
                                  : option.value)
                              }
                              readOnly
                              className="form-radio accent-[#90223F] border-[#90223F]"
                            />
                          )}
                          <span
                            dangerouslySetInnerHTML={{
                              __html:
                                (typeof option === "string"
                                  ? option
                                  : option.label) || "",
                            }}
                          ></span>
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {(error || status) && (
        <div className={`${styles["error-message"]}`}>{error || status}</div>
      )}
    </div>
  );
}

export { Select };
