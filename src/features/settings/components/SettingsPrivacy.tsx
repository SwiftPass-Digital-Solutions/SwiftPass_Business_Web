import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/constants";
import getAuthHeaders from "@/utils/api";
import { endpoints } from "@/constants";

const SettingsPrivacy = () => {
  const [activeTab, setActiveTab] = useState("privacy-security");
  const navigate = useNavigate();
  const location = useLocation();
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState<boolean>(true);
  const [lastLoginLocation, setLastLoginLocation] = useState<string>("Lagos, Nigeria");
  const [loading, setLoading] = useState<boolean>(false);

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
  type ButtonSetting = { label: string; value: string; type: "button"; buttonText: string };
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
        if (!res.ok) throw new Error(`Failed to fetch privacy settings: ${res.status}`);
        const json = await res.json();
        const data = json?.data;
        if (data) {
          setLastLoginLocation(data.lastLoginLocation ?? lastLoginLocation);
          setLoginAlertsEnabled(Boolean(data.isLoginAlertEnabled));
        }
      } catch (err) {
        console.error("Error fetching privacy settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacySettings();
  }, []);

  useEffect(() => {
    const path = location.pathname.replace(`${APP_PATHS.SETTINGS}/`, "");
    if (!path || path === "" || path === "business-profile") setActiveTab("privacy-security");
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

      // Optionally inspect response for confirmation
      // const json = await res.json();
      // if (!json?.status) throw new Error('Toggle failed');
    } catch (err) {
      console.error("Error toggling login alerts:", err);
      // revert optimistic update on failure
      setLoginAlertsEnabled(!newValue);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="flex flex-col items-start relative bg-white min-h-screen"
      data-model-id="118:685"
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
                alt={tab.alt}
                src={tab.icon}
              />
              <span className={`relative w-fit mt-[-2.00px] [font-family:'Archivo',Helvetica] font-normal text-[13px] md:text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap ${
                activeTab === tab.id ? "text-black" : "text-[#494949]"
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-start gap-0 md:gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <section className="flex flex-col items-start px-4 py-0 relative self-stretch w-full flex-[0_0_auto]">
          {settingsData.map((setting, index) => (
            <div key={index} className="w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-[204px] px-0 py-4 relative self-stretch w-full flex-[0_0_auto] border-b border-gray-100 md:border-b-0">
                <label className="relative flex items-start md:items-center justify-start md:justify-center w-full md:w-40 [font-family:'Archivo',Helvetica] font-normal text-[#666666] md:text-textblacksecondary text-[13px] md:text-sm tracking-[-0.42px] leading-[normal]">
                  {setting.label}
                </label>

                {setting.type === "text" && (
                  <div className="flex w-full md:w-[322px] items-center justify-between relative">
                    <div className="flex flex-1 md:w-60 items-center gap-1.5 relative">
                      <div className="relative flex items-center justify-start md:justify-center w-full md:w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] md:text-textblackprimary text-[15px] md:text-sm text-left md:text-center tracking-[-0.42px] leading-[normal] break-words md:whitespace-nowrap">
                        {setting.value}
                      </div>
                    </div>
                  </div>
                )}

                {setting.type === "button" && (
                  <div className="flex md:inline-flex items-center justify-between md:gap-6 w-full md:w-auto relative flex-[0_0_auto]">
                    <div className="flex flex-1 md:w-[233px] items-center gap-1.5 relative">
                      <div className="relative flex items-center justify-start md:justify-center w-full md:w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] md:text-textblackprimary text-[15px] md:text-sm text-left md:text-center tracking-[-0.42px] leading-[normal] whitespace-nowrap">
                        {setting.value}
                      </div>
                    </div>
                    <button className="inline-flex h-8 md:h-8 items-center justify-center gap-2.5 px-4 md:p-3 relative flex-[0_0_auto] bg-white md:bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-[#e5e5e5] md:border-primitives-neutral-neutral-600 shadow-sm md:shadow-[0px_2px_0px_#dcdcdc]">
                      <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] md:text-primitives-neutral-neutral-1000 text-[13px] md:text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                        {setting.buttonText}
                      </span>
                    </button>
                  </div>
                )}

                {setting.type === "toggle" && (
                  <div className="flex w-full md:w-[322px] items-center justify-end md:justify-between relative">
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
                            loginAlertsEnabled ? "translate-x-[22px] md:translate-x-5" : "translate-x-[2px] md:translate-x-0"
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
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            {/* Divider - Desktop only */}
            <div className="hidden md:flex flex-col items-start gap-2.5 px-0 py-2 relative self-stretch w-full flex-[0_0_auto]">
              <hr className="relative w-[752px] h-px mt-[-1.00px] border-0 bg-[url(https://c.animaapp.com/nHRrOw7w/img/line-21.svg)] bg-cover" />
            </div>

            <div className="flex flex-row items-center justify-between md:gap-[204px] pt-4 md:pt-6 pb-4 px-0 relative self-stretch w-full flex-[0_0_auto] border-t border-gray-100 md:border-t-0">
              <div className="relative flex items-center justify-start md:justify-center w-auto md:w-40 [font-family:'Archivo',Helvetica] font-normal text-[#666666] md:text-textblacksecondary text-[13px] md:text-sm tracking-[-0.42px] leading-[normal]">
                Want to log out?
              </div>

              <button className="inline-flex items-center justify-center gap-1 px-3 py-2 md:py-1.5 relative flex-[0_0_auto] bg-[#ffefef] rounded-md border border-solid border-primitives-red-red-50">
                <img
                  className="relative w-3.5 h-3.5 aspect-[1]"
                  alt="Log out icon"
                  src="https://c.animaapp.com/nHRrOw7w/img/button-icon.svg"
                />
                <span className="relative flex items-center justify-center w-fit mt-[-0.50px] [font-family:'Archivo',Helvetica] font-normal text-primitives-red-red-500 text-[13px] md:text-xs text-center tracking-[-0.36px] leading-[normal] whitespace-nowrap">
                  Log out of SwiftPass
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsPrivacy;