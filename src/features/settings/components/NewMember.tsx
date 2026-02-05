import React, { useState } from "react";
import { endpoints } from "@/constants";
import { getAuthHeaders } from "@/utils/api";

export const Frame: React.FC<{ onClose?: () => void; onInviteSent?: (email: string) => void; }> = ({ onClose, onInviteSent }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    phoneNumber: "",
    role: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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
      const payload = {
        fullName: formData.fullName,
        email: formData.workEmail,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        note: formData.note,
      };

      const { headers, credentials } = getAuthHeaders("application/json");

      const res = await fetch(endpoints.business.team, {
        method: "POST",
        headers,
        credentials,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || res.statusText || "Request failed");
      }

      // success — notify parent to show invitation popup and close this frame
      if (onInviteSent) onInviteSent(payload.email);
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Failed to send invite:", err);
      alert("Failed to send invite: " + (err?.message || "Unknown error"));
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
    <div className="flex min-h-screen w-full items-start justify-center bg-white p-4 sm:p-8">
      <div className="w-full max-w-[512px]">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
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
            Add New Team Member
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
              placeholder="First Name"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
              placeholder="Work Email Address"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
                <option value="1">Admin</option>
                <option value="2">ComplianceOfficer</option>
                <option value="3">FinanceManager</option>
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

          {/* Note for user */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="note"
              className="font-['Archivo'] text-sm font-medium text-gray-900"
            >
              Note for user
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Add a note"
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 font-['Archivo'] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
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
            {isSubmitting ? "Sending..." : "Send invite"}
          </button>
        </div>
        {/* InvitationSent is shown by parent */}
      </div>
    </div>
  );
};

export default Frame;
