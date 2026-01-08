import React, {
  useState,
  SyntheticEvent,
  ChangeEvent,
  forwardRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import styles from "./styles.module.css";
import { FormikProps } from "formik";
import { LoadingIcon } from "@/assets/svgs";
import { EyeIcon, EyeOff } from "lucide-react";

type InputType = {
  type?: string;
  variant?: "text" | "number";
  onClick?: () => void;
  label?: string | ReactNode;
  labelClasses?: string;
  className?: string;
  id?: string;
  isAdminApproveRequest?: boolean;
  name: string;
  formik?: FormikProps<any>;
  placeholder?: string | "";
  Icon?: any;
  hideError?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minVal?: number;
  loading?: boolean;
  prefix?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMoney?: boolean;
  bgType?: "search" | "text";
};

const Input = forwardRef(function CustomInput(
  {
    type,
    onClick,
    label,
    labelClasses,
    className,
    id,
    isAdminApproveRequest = false,
    name,
    formik,
    Icon,
    hideError = false,
    disabled = false,
    loading = false,
    variant = "text",
    maxLength,
    minVal = 0,
    prefix,
    bgType = "text",
    ...rest
  }: InputType,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [inputType, setInputType] = useState(type || "text");
  const [isFocused, setIsFocused] = useState(false);
  const error = useMemo(
    () => formik && formik.touched?.[name] && formik.errors?.[name],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik?.touched, formik?.errors, name]
  );

  let classes = `${styles.container} ${className} flex flex-col relative`;
  if (type === "password" || type === "email")
    classes += ` ${styles["padding-right"]}`;
  const status = formik && formik.touched?.[name] && formik.status?.[name];
  if (error || status) classes += ` ${styles["error"]}`;

  const placeholder = rest.placeholder;

  const formatAsMoney = (value: string | number) => {
    const num = typeof value === "string" ? value.replace(/\D/g, "") : value;
    if (!num) return "";
    return new Intl.NumberFormat("en-NG").format(Number(num));
  };

  // Handler
  const handleClick = useCallback(() => {
    if (type === "password") {
      if (inputType === "password") {
        setInputType("text");
      } else setInputType("password");
    }
  }, [inputType, type]);

  const handleValue = useCallback(
    (value: string) => {
      if (name === "email") {
        value = value?.trim();
      }

      if (variant === "number") {
        value = value.replace(/\D/g, "");
        if (rest.isMoney) {
          return formatAsMoney(value);
        }
      }

      return value;
    },
    [variant, name, rest.isMoney]
  );

  const handleValueOnBlur = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      let value = e.currentTarget.value;

      if (rest.isMoney && variant === "number") {
        const raw = value.replace(/\D/g, "");
        formik?.setFieldValue(name, raw ? Number(raw) : "");
        return;
      }

      value = handleValue(value);

      if (variant === "number") {
        if (
          value &&
          minVal &&
          !isNaN(Number(value)) &&
          Number(value) < minVal
        ) {
          value = minVal?.toString();
        }
      }

      formik?.setFieldValue(name, value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik?.values, name, variant, minVal, rest.isMoney]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      if (rest.isMoney && variant === "number") {
        const raw = value.replace(/\D/g, ""); // extract digits
        formik?.setFieldValue(name, raw ? Number(raw) : "");
      } else {
        formik?.setFieldValue(name, handleValue(value));
      }

      // password confirmation logic (same as before)
      if (
        (name === "confirm_password" || name === "password") &&
        formik?.values &&
        typeof formik?.values === "object" &&
        Object.keys(formik?.values).includes("confirm_password")
      ) {
        if (
          (name === "confirm_password" && formik?.values?.password !== value) ||
          (name === "password" && formik?.values?.confirm_password !== value)
        ) {
          formik?.setStatus({
            ...formik?.status,
            confirm_password: "Passwords do not match",
          });
        } else {
          delete formik?.status?.confirm_password;
          formik?.setStatus(formik?.status || {});
        }
      }
    },
    [formik?.values, formik?.status, name, handleValue, rest.isMoney, variant]
  );

  if (formik) {
    const rawValue = formik?.values[name];

    Object.assign(rest, {
      onChange: disabled ? undefined : handleChange,
      onBlur: (e: SyntheticEvent<HTMLInputElement>) => {
        handleValueOnBlur(e);
        setIsFocused(false);
        return formik?.handleBlur(e);
      },
      value:
        rest.isMoney && variant === "number"
          ? formatAsMoney(rawValue)
          : rawValue,
    });
  }

  return (
    <div className={classes}>
      {label && (
        <label
          className={`${
            isFocused ? styles["active"] : ""
          } mb-2 ${labelClasses}`}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      {Icon ? (
        <Icon
          className={`${formik?.values[name] && "hidden"} ${styles.icon}`}
        />
      ) : (
        ""
      )}
      <div className="flex relative">
        {(prefix || rest.isMoney) && (
          <span className="text-sm text-[#C4C4C4] !absolute !left-3 !top-[14px] !w-fit">
            {rest.isMoney ? "₦" : prefix}
          </span>
        )}
        <input
          style={{
            backgroundColor: bgType === "search" ? "#F8F8F8" : "",
            border: bgType === "search" ? "none" : "0.5px solid #e5e7eb",
            borderRadius:
              variant === "number" &&
              (name === "numberOfAgents" || name === "numberOfTerminal")
                ? 0
                : undefined,
            textAlign:
              variant === "number" &&
              (name === "numberOfAgents" || name === "numberOfTerminal")
                ? "center"
                : "left",
          }}
          className={`flex-grow ${prefix || rest.isMoney ? "!pl-6" : ""} ${
            Icon && "placeholder:pl-3"
          }`}
          maxLength={maxLength}
          id={id ?? name}
          name={name}
          type={inputType}
          onClick={onClick}
          // onChange={handleChange}
          onBlur={(e) => {
            handleValueOnBlur(e);
            setIsFocused(false);
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          {...rest}
          placeholder={placeholder}
          disabled={disabled}
          ref={ref}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={handleClick}
            className="flex items-center justify-center border-none w-8 h-8 absolute right-3 top-3"
          >
            {inputType === "password" ? <EyeIcon /> : <EyeOff />}
          </button>
        )}
        {type !== "password" && loading && (
          <LoadingIcon className="h-4 w-4 absolute right-3 top-4 animate-spin" />
        )}
      </div>
      {(error || status) && !hideError && (
        <div className={`${styles["error-message"]}`}>{error || status}</div>
      )}
    </div>
  );
});

export default Input;
