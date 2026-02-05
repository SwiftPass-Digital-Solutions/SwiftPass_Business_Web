import { useState, useEffect, useRef, ChangeEvent } from "react";
import { getCookie } from "@/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS, endpoints } from "@/constants";
import { PageLoader } from "@/components";

interface TabItem {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
}

interface ProfileField {
  id: string;
  label: string;
  value: string;
  isEditable: boolean;
}

type BusinessProfile = {
  businessId: number;
  logoUrl: string | null;
  businessName: string;
  registrationNumber: string;
  businessType: string;
  businessTypeDisplay: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  onboardingStatus: string;
};

type ProfileApiResponse = {
  status: boolean;
  message: string;
  traceId?: string;
  data: BusinessProfile;
};

const SettingsBusiness = () => {
  const [activeTab, setActiveTab] = useState("business-profile");
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      id: "business-profile",
      label: "Business Profile",
      icon: "https://c.animaapp.com/hXXj90wg/img/user.svg",
      isActive: true,
    },
    {
      id: "team-management",
      label: "Team Management",
      icon: "https://c.animaapp.com/hXXj90wg/img/vuesax-linear-profile-2user.svg",
      isActive: false,
    },
    {
      id: "notification-preferences",
      label: "Notification Preferences",
      icon: "https://c.animaapp.com/hXXj90wg/img/notification-circle.svg",
      isActive: false,
    },
    {
      id: "privacy-security",
      label: "Privacy & Security",
      icon: "https://c.animaapp.com/hXXj90wg/img/security-lock.svg",
      isActive: false,
    },
  ];

  const profileFields = (profile: BusinessProfile | null): ProfileField[] => [
    {
      id: "logo",
      label: "Logo",
      value: profile?.logoUrl ?? "",
      isEditable: true,
    },
    {
      id: "business-name",
      label: "Business Name",
      value: profile?.businessName ?? "",
      isEditable: true,
    },
    {
      id: "registration-number",
      label: "Registration Number",
      value: profile?.registrationNumber ?? "",
      isEditable: true,
    },
    {
      id: "business-type",
      label: "Business Type",
      value: profile?.businessTypeDisplay ?? profile?.businessType ?? "",
      isEditable: true,
    },
    {
      id: "contact-email",
      label: "Contact Email",
      value: profile?.contactEmail ?? "N/A",
      isEditable: true,
    },
    {
      id: "phone",
      label: "Phone",
      value: profile?.contactPhone ?? "N/A",
      isEditable: true,
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "business-profile") navigate(`${APP_PATHS.SETTINGS}`);
    else navigate(`${APP_PATHS.SETTINGS}/${tabId}`);
  };

  useEffect(() => {
    const path = location.pathname.replace(`${APP_PATHS.SETTINGS}/`, "");
    if (!path || path === "" || path === "business-profile") setActiveTab("business-profile");
    else setActiveTab(path);
  }, [location.pathname]);
  // Helper: fetch latest profile data
  const getProfile = async (): Promise<BusinessProfile> => {
    const token = getCookie("_tk");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(endpoints.business.profile, {
      method: "GET",
      headers,
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
    const json = (await res.json()) as ProfileApiResponse;
    if (json && json.status && json.data) return json.data;
    throw new Error(json?.message ?? "Failed to load business profile");
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile();
        if (!cancelled) setProfile(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to fetch business profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectLogo = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file);
    // reset input so same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadLogo = async (fileOrUrl: File | string) => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    try {
      const token = getCookie("_tk");
      const headers: Record<string, string> = {};
      let body: BodyInit;

      if (typeof fileOrUrl === "string") {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ logoUrl: fileOrUrl });
      } else {
        const fd = new FormData();
        fd.append("logo", fileOrUrl);
        body = fd;
      }

      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(endpoints.business.logo, {
        method: "PUT",
        headers,
        body,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
      const json = await res.json();
      if (!cancelled) {
        if (json && json.status && json.data) {
          // re-fetch authoritative profile after upload so the component updates
          try {
            const updated = await getProfile();
            if (!cancelled) setProfile(updated);
          } catch (_err) {
            // fallback to response data if refetch fails
            if (!cancelled) setProfile(json.data);
          }
        } else setError(json?.message ?? "Failed to upload logo");
      }
    } catch (err: any) {
      if (!cancelled) setError(err?.message ?? "Failed to upload logo");
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  // NOTE: edit handling for non-logo fields is not implemented yet.
  // Removed unused `handleEditClick` to fix TS6133 (declared but never read).

  const renderedFields = loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div className="text-red-600">{error}</div>
  ) : (
      profileFields(profile).map((field) => (
      <div
        key={field.id}
        className="flex flex-col md:flex-row md:items-center gap-3 md:gap-[204px] px-0 py-4 md:py-4 relative self-stretch w-full flex-[0_0_auto] border-b border-gray-100 last:border-b-0"
      >
        <label
          htmlFor={field.id}
          className="relative flex items-center justify-start w-full md:w-40 [font-family:'Archivo',Helvetica] font-normal text-[#666666] md:text-textblacksecondary text-[13px] md:text-sm tracking-[-0.42px] leading-[20.3px]"
        >
          {field.label}
        </label>

        <div className="flex w-full md:w-[322px] items-center justify-between relative">
          <div className="flex flex-1 md:w-60 items-center gap-1.5 relative">
            {field.id === "logo" ? (
              <div className="flex items-center gap-2">
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Business logo"
                    className="w-10 h-10 md:w-8 md:h-8 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="relative w-10 h-10 md:w-8 md:h-8 bg-[#d9d9d9] rounded-2xl aspect-[1]"
                    aria-label="Business logo placeholder"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            ) : (
              <div
                id={field.id}
                className="relative flex items-center justify-start md:justify-center w-full md:w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] md:text-textblackprimary text-[15px] md:text-sm text-left md:text-center tracking-[-0.42px] leading-[20.3px] break-words md:whitespace-nowrap"
              >
                {field.value}
              </div>
            )}
          </div>

          {field.isEditable ? (
            field.id === "logo" ? (
              <button
                type="button"
                onClick={() => handleSelectLogo()}
                className="inline-flex h-8 md:h-8 items-center justify-center gap-2.5 px-4 md:p-3 relative flex-[0_0_auto] bg-white md:bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-[#e5e5e5] md:border-primitives-neutral-neutral-600 shadow-sm md:shadow-[0px_2px_0px_#dcdcdc]"
                aria-label={`Edit ${field.label}`}
              >
                <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] md:text-primitives-neutral-neutral-1000 text-[13px] md:text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                  Edit
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-8 items-center justify-center gap-2.5 px-3 md:p-3 relative flex-[0_0_auto] bg-[#f5f5f5] md:bg-primitives-neutral-neutral-200 rounded-lg border border-solid border-[#e5e5e5] md:border-primitives-neutral-neutral-600 shadow-sm md:shadow-[0px_2px_0px_#dcdcdc] opacity-80 cursor-not-allowed"
                aria-label={`Locked ${field.label}`}
                title="Locked"
              >
                    <img
                      className="relative w-3 h-3 aspect-[1]"
                      alt=""
                      src="https://c.animaapp.com/sYjJLP8g/img/vuesax-linear-lock-4.svg"
                      aria-hidden="true"
                    />
                    <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-[13px] md:text-sm text-center tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                      Locked
                    </span>
              </button>
            )
          ) : null}
        </div>
      </div>
    ))
  );

  return (
    <>
      {loading && <PageLoader />}
      <div
        className="flex flex-col items-start relative bg-white min-h-screen"
        data-model-id="114:226"
      >

      {/* Navigation Tabs */}
      <nav className="flex flex-col items-start justify-center gap-2.5 px-4 py-2 md:p-4 relative self-stretch w-full flex-[0_0_auto] overflow-x-auto">
        <div
          className="inline-flex items-start gap-0.5 p-1 relative flex-[0_0_auto] bg-neutral-50 rounded-lg overflow-x-auto md:overflow-visible w-full md:w-auto"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`inline-flex items-center justify-center gap-1 px-3 py-1 relative flex-[0_0_auto] rounded-md whitespace-nowrap ${
                activeTab === tab.id ? "bg-white shadow-sescy" : ""
              }`}
            >
              <img
                className="relative w-5 h-5 aspect-[1]"
                alt={tab.label}
                src={tab.icon}
              />
              <span
                className={`w-fit mt-[-2.00px] whitespace-nowrap relative [font-family:'Archivo',Helvetica] font-normal text-[13px] md:text-sm tracking-[-0.42px] leading-[20.3px] ${
                  activeTab === tab.id ? "text-black" : "text-[#494949]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-start gap-0 md:gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <section className="flex flex-col items-start px-4 py-0 relative self-stretch w-full flex-[0_0_auto]">
          {renderedFields}
        </section>
      </main>
      </div>
    </>
  );
};
export default SettingsBusiness