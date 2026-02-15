import React, { useEffect, useState } from "react";
import { getAuthHeaders } from "@/utils/api";
import { endpoints } from "@/constants";
import { BusinessRoleEnum } from "@/constants/enums";
import { toast } from "react-toastify";

export type MemberFormData = {
  id?: number;
  fullName: string;
  workEmail: string;
  phoneNumber: string;
  role: BusinessRoleEnum | "";
  note: string;
};

export const Frame: React.FC<{
  onClose?: () => void;
  onInviteSent?: (email: string) => void;
  initialData?: Partial<MemberFormData>;
  onSave?: (data: MemberFormData) => Promise<void> | void;
}> = ({ onClose, onInviteSent, initialData, onSave }) => {
  const [formData, setFormData] = useState<MemberFormData>({
    fullName: "",
    workEmail: "",
    phoneNumber: "",
    role: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isEdit = Boolean(formData.id);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...(initialData as any) }));
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value === "" ? "" : (Number(value) as BusinessRoleEnum),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      workEmail: "",
      phoneNumber: "",
      role: "",
      note: "",
    });
    if (onClose) onClose();
  };

  const handleSendInvite = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);
    try {
      const payload: MemberFormData = {
        id: formData.id,
        fullName: formData.fullName,
        workEmail: formData.workEmail,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        note: formData.note,
      };

      // If editing (has id), call PUT to update member
      if (payload.id) {
        const memberId = payload.id;
        const { headers, credentials } = getAuthHeaders("application/json");
        const url = `${endpoints.business.team}/${memberId}`;

        const res = await fetch(url, {
          method: "PUT",
          headers,
          credentials,
          body: JSON.stringify({
            fullName: payload.fullName,
            email: payload.workEmail,
            phoneNumber: payload.phoneNumber,
            role: payload.role,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(
            errBody?.message || res.statusText || "Request failed",
          );
        }

        // notify parent to update UI if provided
        if (onSave) await onSave(payload);
        if (onClose) onClose();
        return;
      }

      // else fall back to creating/inviting a new member (existing behaviour)
      const { headers, credentials } = getAuthHeaders("application/json");

      const res = await fetch(endpoints.business.team, {
        method: "POST",
        headers,
        credentials,
        body: JSON.stringify({
          fullName: payload.fullName,
          email: payload.workEmail,
          phoneNumber: payload.phoneNumber,
          role: payload.role,
          note: payload.note,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || res.statusText || "Request failed");
      }

      // success — notify parent to show invitation popup and close this frame
      if (onInviteSent) onInviteSent(payload.workEmail);
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(
        "Failed to send invite: " + (err?.message || "Unknown error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.workEmail.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.role !== ""
    );
  };

  // Invitation display is handled by parent via `onInviteSent`.

  return (
    <div className="flex min-h-full w-full items-start justify-center bg-white p-4 sm:p-8">
      <div className="w-full max-w-[512px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
          <button
            className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => (onClose ? onClose() : window.history.back())}
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="font-['Archivo'] text-2xl font-medium text-gray-900">
            Edit Team Member's Details
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="fullName"
              className="font-['Archivo'] text-sm font-medium text-gray-900"
            >
              Full name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={isEdit}
              aria-describedby={isEdit ? "fullNameHelp" : undefined}
              placeholder="First Name"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {isEdit && (
              <p id="fullNameHelp" className="mt-2 text-sm text-gray-500">
                Full name cannot be edited.
              </p>
            )}
          </div>

          {/* Work Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="workEmail"
              className="font-['Archivo'] text-sm font-medium text-gray-900"
            >
              Work Email
            </label>
            <input
              type="email"
              id="workEmail"
              name="workEmail"
              value={formData.workEmail}
              onChange={handleInputChange}
              disabled={isEdit}
              aria-describedby={isEdit ? "workEmailHelp" : undefined}
              placeholder="Work Email Address"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {isEdit && (
              <p id="workEmailHelp" className="mt-2 text-sm text-gray-500">
                Work email cannot be edited.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phoneNumber"
              className="font-['Archivo'] text-sm font-medium text-gray-900"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="0000 000 0000"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="role"
              className="font-['Archivo'] text-sm font-medium text-gray-900"
            >
              Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select role</option>
                <option value={BusinessRoleEnum.Admin}>Admin</option>
                <option value={BusinessRoleEnum.ComplianceOfficer}>
                  Compliance Officer
                </option>
                <option value={BusinessRoleEnum.FinanceManager}>
                  Finance Manager
                </option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: stacked on mobile, row on desktop */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-6 py-3 font-['Archivo'] text-base font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSendInvite}
            disabled={!isFormValid() || isSubmitting}
            className={`flex-1 rounded-lg px-6 py-3 font-['Archivo'] text-base font-medium transition-colors focus:outline-none ${
              isFormValid() && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            type="button"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {/* InvitationSent is shown by parent */}
      </div>
    </div>
  );
};

export default Frame;
