import * as Yup from "yup";

export const initiateBusinessSchema = Yup.object({
  businessName: Yup.string().trim().required("Business name is required"),

  registrationNumber: Yup.string()
    .trim()
    .required("Registration number is required"),

  businessType: Yup.string().required("Business type is required"),

  contactEmail: Yup.string()
    .email("Enter a valid email address")
    .required("Contact email is required"),

  contactPhone: Yup.string()
    .trim()
    .required("Contact phone number is required"),
});
