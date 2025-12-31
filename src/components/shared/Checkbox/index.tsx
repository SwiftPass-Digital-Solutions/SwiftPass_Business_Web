import { ChangeEvent, ReactNode } from "react";
import styles from "./styles.module.css";
import { FormikProps } from "formik";

type InputType = {
  type?: string;
  onClick?: () => void;
  onChange?: () => void;
  label?: ReactNode | string;
  className?: string;
  id?: string;
  name: string;
  formik?: FormikProps<any>;
  placeholder?: string | "";
};

function Checkbox({ label, className = "", name, formik, ...rest }: InputType) {
  const error = formik && formik.touched?.[name] && formik.errors?.[name];
  const status = formik && formik.status?.[name];

  let classes = `${styles.container} ${className}`;
  if (error || status) classes += ` ${styles["error"]}`;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    formik?.setFieldValue(name, e.target.checked);
    formik?.handleBlur(e);
  }

  const isChecked = !!formik?.values?.[name];

  return (
    <label className={`${classes}`}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        {...rest}
      />
      <span className={styles["checkmark"]}></span>
      <span style={{ marginLeft: "4px", color: "#555555" }}>{label}</span>
    </label>
  );
}

export { Checkbox };
