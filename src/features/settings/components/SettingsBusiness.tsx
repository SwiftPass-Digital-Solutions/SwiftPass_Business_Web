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
    if (!path || path === "" || path === "business-profile")
      setActiveTab("business-profile");
    else setActiveTab(path);
  }, [location.pathname]);

  // Helper: fetch latest profile data
  const getProfile = async (): Promise<BusinessProfile> => {
    const token = getCookie("_tk");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
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
        if (!cancelled)
          setError(err?.message ?? "Failed to fetch business profile");
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

      if (!res.ok)
        throw new Error(`Network response was not ok (${res.status})`);
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

  const renderedFields = loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div className="text-red-600">{error}</div>
  ) : (
    profileFields(profile).map((field) => (
      <div
        key={field.id}
        className="border-b border-gray-100 last:border-b-0 py-4 w-full min-w-0"
      >
        {/* ── MOBILE layout ── */}
        <div className="flex items-center justify-between md:hidden min-w-0">
          {/* Left: label + value stacked */}
          <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
            <span className="[font-family:'Archivo',Helvetica] font-normal text-[#666666] text-[13px] tracking-[-0.42px] leading-[20px]">
              {field.label}
            </span>
            {field.id === "logo" ? (
              <div className="flex items-center gap-2">
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Business logo"
                    className="w-10 h-10 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#d9d9d9] rounded-2xl" />
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
              <span className="[font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] text-[15px] tracking-[-0.42px] leading-[20px] break-words">
                {field.value}
              </span>
            )}
          </div>

          {/* Right: Edit button */}
          {field.isEditable &&
            (field.id === "logo" ? (
              <button
                type="button"
                onClick={handleSelectLogo}
                className="flex-shrink-0 inline-flex h-9 items-center justify-center px-4 bg-white rounded-lg border border-[#e5e5e5] shadow-sm"
              >
                <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-[13px] whitespace-nowrap">
                  Edit
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-200 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc] opacity-80 cursor-not-allowed"
                aria-label={`Locked ${field.label}`}
                title="Locked"
              >
                <img
                  className="relative w-3 h-3 aspect-[1]"
                  alt=""
                  src="https://c.animaapp.com/sYjJLP8g/img/vuesax-linear-lock-4.svg"
                  aria-hidden="true"
                />
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-sm text-center tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                  Locked
                </span>
              </button>
            ))}
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="hidden md:flex md:flex-row md:items-center md:gap-20">
          <label
            htmlFor={field.id}
            className="relative flex items-center justify-start w-40 [font-family:'Archivo',Helvetica] font-normal text-textblacksecondary text-sm tracking-[-0.42px] leading-[20.3px]"
          >
            {field.label}
          </label>

          <div className="flex w-full md:w-[322px] items-center justify-between relative">
            <div className="flex flex-1 items-center gap-1.5 relative min-w-0">
              {field.id === "logo" ? (
                <div className="flex items-center gap-2">
                  {profile?.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt="Business logo"
                      className="w-8 h-8 rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="relative w-8 h-8 bg-[#d9d9d9] rounded-2xl aspect-[1]"
                      aria-label="Business logo placeholder"
                    />
                  )}
                </div>
              ) : (
                <div
                  id={field.id}
                  className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-textblackprimary text-sm text-center tracking-[-0.42px] leading-[20.3px] break-words"
                >
                  {field.value}
                </div>
              )}
            </div>

            {field.isEditable ? (
              field.id === "logo" ? (
                <button
                  type="button"
                  onClick={handleSelectLogo}
                  className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                  aria-label={`Edit ${field.label}`}
                >
                  <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                    Edit
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-200 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc] opacity-80 cursor-not-allowed"
                  aria-label={`Locked ${field.label}`}
                  title="Locked"
                >
                  <img
                    className="relative w-3 h-3 aspect-[1]"
                    alt=""
                    src="https://c.animaapp.com/sYjJLP8g/img/vuesax-linear-lock-4.svg"
                    aria-hidden="true"
                  />
                  <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-black text-sm text-center tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                    Locked
                  </span>
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    ))
  );

  return (
    <>
      {loading && <PageLoader />}

      {/* EXTREME mobile constraint wrapper */}
      <div
        className="w-full min-w-0 max-w-full box-border"
        style={{ overflowX: "hidden" }}
      >
        <div
          className="w-full min-w-0 bg-white min-h-screen relative box-border"
          data-model-id="114:226"
        >
          {/* Navigation Tabs - ICON ONLY on very small screens */}
          <nav className="w-full min-w-0 py-2 px-2 md:px-4 md:py-4 box-border">
            <div
              className="flex items-center gap-0.5 p-0.5 bg-neutral-50 rounded-lg w-full md:w-auto md:inline-flex md:p-1 box-border"
              role="tablist"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`inline-flex items-center justify-center gap-0.5 px-1 md:px-3 py-1.5 flex-1 md:flex-none rounded-md min-w-0 md:gap-1 box-border ${
                    activeTab === tab.id ? "bg-white shadow-sescy" : ""
                  }`}
                  title={tab.label}
                >
                  <img
                    className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                    alt={tab.label}
                    src={tab.icon}
                  />
                  {/* Hide text on very small screens, show on 400px+ */}
                  <span
                    className={`hidden min-[400px]:inline truncate [font-family:'Archivo',Helvetica] font-normal text-[9px] md:text-sm tracking-[-0.2px] md:tracking-[-0.42px] leading-[12px] md:leading-[20.3px] ${
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
          <main className="flex flex-col items-start gap-[22px] relative w-full min-w-0 px-3 md:px-3 box-border">
            <section className="flex flex-col px-0 py-0 w-full min-w-0 box-border">
              {renderedFields}
            </section>
          </main>
        </div>
      </div>
    </>
  );
};
export default SettingsBusiness;
