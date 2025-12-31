import * as Yup from "yup";

export const confirmPasswordSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Minimum of 8 characters")
    .matches(/[A-Z]/, "One uppercase letter")
    .matches(/[a-z]/, "One lowercase letter")
    .matches(/[0-9]/, "One number")
    .matches(/[^A-Za-z0-9]/, "One special character"),

  password2: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});
