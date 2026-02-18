import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/constants";
import getAuthHeaders from "@/utils/api";
import { endpoints } from "@/constants";

const SettingsPrivacy = () => {
  const [activeTab, setActiveTab] = useState("privacy-security");
  const navigate = useNavigate();
  const location = useLocation();
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState<boolean>(true);
  const [lastLoginLocation, setLastLoginLocation] =
    useState<string>("Lagos, Nigeria");
  const [, setLoading] = useState<boolean>(false);

  const tabs = [
    {
      id: "business-profile",
      label: "Business Profile",
      icon: "https://c.animaapp.com/nHRrOw7w/img/user.svg",
      alt: "User",
    },
    {
      id: "team-management",
      label: "Team Management",
      icon: "https://c.animaapp.com/nHRrOw7w/img/vuesax-linear-profile-2user.svg",
      alt: "Vuesax linear",
    },
    {
      id: "notification-preferences",
      label: "Notification Preferences",
      icon: "https://c.animaapp.com/nHRrOw7w/img/notification-circle.svg",
      alt: "Notification circle",
    },
    {
      id: "privacy-security",
      label: "Privacy & Security",
      icon: "https://c.animaapp.com/nHRrOw7w/img/security-lock.svg",
      alt: "Security lock",
    },
  ];

  type TextSetting = { label: string; value: string; type: "text" };
  type ButtonSetting = {
    label: string;
    value: string;
    type: "button";
    buttonText: string;
  };
  type ToggleSetting = { label: string; value: null; type: "toggle" };
  type Setting = TextSetting | ButtonSetting | ToggleSetting;

  const settingsData: Setting[] = [
    {
      label: "Last Login Location",
      value: lastLoginLocation,
      type: "text",
    },

    {
      label: "Enable Login Alerts",
      value: null,
      type: "toggle",
    },
  ];

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      try {
        setLoading(true);
        const auth = getAuthHeaders();
        const API_URL = endpoints.business.privacySecurity;
        const res = await fetch(API_URL, { ...auth });
        if (!res.ok)
          throw new Error(`Failed to fetch privacy settings: ${res.status}`);
        const json = await res.json();
        const data = json?.data;
        if (data) {
          setLastLoginLocation(data.lastLoginLocation ?? lastLoginLocation);
          setLoginAlertsEnabled(Boolean(data.isLoginAlertEnabled));
        }
      } catch (err) {
        toast.error((err as any)?.message || "Error fetching privacy settings");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacySettings();
  }, []);

  useEffect(() => {
    const path = location.pathname.replace(`${APP_PATHS.SETTINGS}/`, "");
    if (!path || path === "" || path === "business-profile")
      setActiveTab("privacy-security");
    else setActiveTab(path);
  }, [location.pathname]);

  const handleTabClick = (tabId: string) => {
    if (tabId === "business-profile") navigate(`${APP_PATHS.SETTINGS}`);
    else navigate(`${APP_PATHS.SETTINGS}/${tabId}`);
  };

  const [toggling, setToggling] = useState<boolean>(false);

  const handleToggle = async () => {
    const newValue = !loginAlertsEnabled;
    // optimistic UI update
    setLoginAlertsEnabled(newValue);
    setToggling(true);

    try {
      const auth = getAuthHeaders();
      const TOGGLE_URL = endpoints.business.toggleLoginAlerts;
      const res = await fetch(TOGGLE_URL, { method: "POST", ...auth });

      if (!res.ok) {
        throw new Error(`Failed to toggle login alerts: ${res.status}`);
      }
    } catch (err) {
      toast.error((err as any)?.message || "Error toggling login alerts");
      // revert optimistic update on failure
      setLoginAlertsEnabled(!newValue);
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    // Clear the _tk cookie
    document.cookie =
      "_tk=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." +
      window.location.hostname.split(".").slice(-2).join(".");

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Show success message
    toast.success("Logged out successfully");

    // Redirect to login or home page
    navigate("/"); // Update this path to your login route
  };

  return (
    <div
      className="w-full min-w-0 max-w-full box-border"
      style={{ overflowX: "hidden" }}
    >
      <div
        className="flex flex-col items-start relative bg-white min-h-screen w-full min-w-0 box-border"
        data-model-id="118:685"
      >
        {/* Navigation Tabs */}
        <nav className="flex flex-col items-start justify-center gap-2.5 px-2 py-2 md:px-4 md:p-4 relative w-full min-w-0 box-border">
          <div
            className="flex items-start gap-0.5 p-0.5 relative bg-neutral-50 rounded-lg w-full md:w-auto md:inline-flex md:p-1 box-border"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`inline-flex items-center justify-center gap-0.5 px-1 md:px-3 py-1.5 relative flex-1 md:flex-none rounded-md min-w-0 md:gap-1 box-border ${
                  activeTab === tab.id ? "bg-white shadow-sescy" : ""
                }`}
                title={tab.label}
              >
                <img
                  className="relative w-4 h-4 md:w-5 md:h-5 flex-shrink-0 aspect-[1]"
                  alt={tab.alt}
                  src={tab.icon}
                />
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
        <main className="flex flex-col items-start gap-0 md:gap-4 relative w-full min-w-0 box-border">
          <section className="flex flex-col items-start px-3 md:px-4 py-0 relative w-full min-w-0 box-border">
            {settingsData.map((setting, index) => (
              <div key={index} className="w-full min-w-0 box-border">
                {/* ONLY CHANGE: toggle rows use flex-row + items-center + justify-between
                    on mobile so the label and toggle sit on the same horizontal line.
                    All other rows remain flex-col. Desktop (md:) classes are untouched. */}
                <div
                  className={`flex md:flex-row md:items-center md:gap-[204px] px-0 py-4 relative self-stretch w-full flex-[0_0_auto] border-b border-gray-100 md:border-b-0 ${
                    setting.type === "toggle"
                      ? "flex-row items-center justify-between gap-3"
                      : "flex-col gap-3"
                  }`}
                >
                  <label className="relative flex items-start md:items-center justify-start md:justify-center w-full md:w-40 flex-shrink-0 [font-family:'Archivo',Helvetica] font-normal text-[#666666] md:text-textblacksecondary text-[13px] md:text-sm tracking-[-0.42px] leading-[normal]">
                    {setting.label}
                  </label>

                  {setting.type === "text" && (
                    <div className="flex w-full items-center justify-between relative min-w-0 box-border">
                      <div className="flex flex-1 items-center gap-1.5 relative min-w-0">
                        <div className="relative flex items-center justify-start md:justify-center w-full md:w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] md:text-textblackprimary text-[15px] md:text-sm text-left md:text-center tracking-[-0.42px] leading-[normal] break-words">
                          {setting.value}
                        </div>
                      </div>
                    </div>
                  )}

                  {setting.type === "button" && (
                    <div className="flex items-center justify-between gap-3 w-full min-w-0 relative box-border">
                      <div className="flex flex-1 items-center gap-1.5 relative min-w-0">
                        <div className="relative flex items-center justify-start md:justify-center w-full md:w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] md:text-textblackprimary text-[15px] md:text-sm text-left md:text-center tracking-[-0.42px] leading-[normal] break-words">
                          {setting.value}
                        </div>
                      </div>
                      <button className="inline-flex h-8 md:h-8 items-center justify-center gap-2.5 px-4 md:p-3 relative flex-shrink-0 bg-white md:bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-[#e5e5e5] md:border-primitives-neutral-neutral-600 shadow-sm md:shadow-[0px_2px_0px_#dcdcdc]">
                        <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] md:text-primitives-neutral-neutral-1000 text-[13px] md:text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                          {setting.buttonText}
                        </span>
                      </button>
                    </div>
                  )}

                  {setting.type === "toggle" && (
                    <div className="flex w-full items-center justify-end md:justify-between relative min-w-0 box-border">
                      <div>
                        <input
                          type="checkbox"
                          id={`toggle-login-alerts`}
                          checked={loginAlertsEnabled}
                          onChange={handleToggle}
                          className="sr-only"
                          aria-label={`Toggle login alerts`}
                        />
                        <button
                          role="switch"
                          aria-checked={loginAlertsEnabled}
                          onClick={handleToggle}
                          disabled={toggling}
                          className={`relative inline-flex items-center h-[26px] w-[46px] md:h-5 md:w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
                            loginAlertsEnabled ? "bg-[#0066FF]" : "bg-[#d1d5db]"
                          }`}
                        >
                          <span
                            className={`inline-block h-[22px] w-[22px] md:h-4 md:w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              loginAlertsEnabled
                                ? "translate-x-[22px] md:translate-x-5"
                                : "translate-x-[2px] md:translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Logout Section */}
            <div className="flex flex-col items-start relative w-full min-w-0 box-border">
              {/* Divider - Desktop only */}
              <div className="hidden md:flex flex-col items-start gap-2.5 px-0 py-2 relative w-full">
                <hr className="relative w-full h-px mt-[-1.00px] border-0 bg-[url(https://c.animaapp.com/nHRrOw7w/img/line-21.svg)] bg-cover" />
              </div>

              <div className="flex md:flex-row md:items-center md:gap-[204px] px-0 pt-4 md:pt-6 pb-4 relative self-stretch w-full flex-[0_0_auto] border-t border-gray-100 md:border-t-0 box-border">
                <div className="relative flex items-start md:items-center justify-start md:justify-center w-full md:w-40 flex-shrink-0 [font-family:'Archivo',Helvetica] font-normal text-[#666666] md:text-textblacksecondary text-[13px] md:text-sm tracking-[-0.42px] leading-[normal]">
                  Want to log out?
                </div>

                <div className="flex w-full items-center justify-end md:justify-between relative min-w-0 box-border">
                  <div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 md:py-1.5 relative flex-shrink-0 bg-[#ffefef] rounded-md border border-solid border-primitives-red-red-50"
                    >
                      <img
                        className="relative w-3.5 h-3.5 aspect-[1] flex-shrink-0"
                        alt="Log out icon"
                        src="https://c.animaapp.com/nHRrOw7w/img/button-icon.svg"
                      />
                      <span className="relative flex items-center justify-center w-fit mt-[-0.50px] [font-family:'Archivo',Helvetica] font-normal text-primitives-red-red-500 text-[13px] md:text-xs text-center tracking-[-0.36px] leading-[normal] whitespace-nowrap">
                        Log out of SwiftPass
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
