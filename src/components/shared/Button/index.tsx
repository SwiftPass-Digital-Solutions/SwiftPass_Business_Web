import React from "react";
import styles from "./styles.module.css";

interface Props {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string | "";
  textClass?: string | "";
  type?: "button" | "submit" | "reset";
  text?: string | "";
  variant?: "contained" | "outlined" | "light" | "simple";
  buttonStyle?: "rounded" | "curved";
  disabled?: boolean;
  color?: string;
}

const Button: React.FC<Props> = ({
  children,
  onClick,
  className,
  type = "button",
  text,
  variant = "contained",
  buttonStyle = "curved",
  disabled = false,
  color,
  textClass,
  ...rest
}) => {
  let containerClass = styles.container;
  containerClass += ` py-3 px-6 ${styles[buttonStyle]} ${styles[variant]}`;
  if (className) containerClass += ` ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={containerClass}
      disabled={disabled}
      style={{ borderColor: color }}
      {...rest}
    >
      <span style={{ color }} className={textClass}>
        {text || children}
      </span>
    </button>
  );
};

export { Button };
