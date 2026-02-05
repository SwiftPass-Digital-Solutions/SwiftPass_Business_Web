import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/constants";
import getAuthHeaders from "@/utils/api";
import { endpoints } from "@/constants";

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

const SettingsNotification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("notification-preferences");

  const tabs: TabItem[] = [
    { id: "business-profile", label: "Business Profile", icon: "https://c.animaapp.com/jue8RkVm/img/user.svg" },
    { id: "team-management", label: "Team Management", icon: "https://c.animaapp.com/jue8RkVm/img/vuesax-linear-profile-2user.svg" },
    { id: "notification-preferences", label: "Notification Preferences", icon: "https://c.animaapp.com/jue8RkVm/img/notification-circle.svg" },
    { id: "privacy-security", label: "Privacy & Security", icon: "https://c.animaapp.com/jue8RkVm/img/security-lock.svg" },
  ];

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    { id: "in-app", label: "In-App", enabled: true },
    { id: "email", label: "Email", enabled: true },
    { id: "sms", label: "SMS", enabled: true },
  ]);

  const API_URL = endpoints.business.notificationPreferences;

  const updatePreferences = async (settings: NotificationSetting[]) => {
    const payload = {
      inAppEnabled: !!settings.find((s) => s.id === "in-app")?.enabled,
      emailEnabled: !!settings.find((s) => s.id === "email")?.enabled,
      smsEnabled: !!settings.find((s) => s.id === "sms")?.enabled,
    };

    const auth = getAuthHeaders();
    const res = await fetch(API_URL, { method: "PUT", body: JSON.stringify(payload), ...auth });
    if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
    return res.json();
  };

  const handleToggle = (id: string) => {
    setNotificationSettings((prev) => {
      const prevState = prev;
      const newState = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));

      (async () => {
        try {
          await updatePreferences(newState);
        } catch (err) {
          console.error("Error updating notification preferences:", err);
          // revert on error
          setNotificationSettings(prevState);
        }
      })();

      return newState;
    });
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === "business-profile") navigate(`${APP_PATHS.SETTINGS}`);
    else navigate(`${APP_PATHS.SETTINGS}/${tabId}`);
  };

  useEffect(() => {
    const path = location.pathname.replace(`${APP_PATHS.SETTINGS}/`, "");
    if (!path || path === "" || path === "business-profile") setActiveTab("notification-preferences");
    else setActiveTab(path);
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPreferences = async () => {
      try {
        const auth = getAuthHeaders();
        const res = await fetch(API_URL, { signal: controller.signal, ...auth });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json();
        const data = json?.data || {};
        if (!mounted) return;
        setNotificationSettings([
          { id: "in-app", label: "In-App", enabled: !!data.inAppEnabled },
          { id: "email", label: "Email", enabled: !!data.emailEnabled },
          { id: "sms", label: "SMS", enabled: !!data.smsEnabled },
        ]);
      } catch (err) {
        console.error("Error fetching notification preferences:", err);
      }
    };

    fetchPreferences();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="flex flex-col items-start relative bg-white min-h-screen" data-model-id="117:567">


      {/* Navigation Tabs */}
      <nav className="flex flex-col items-start justify-center gap-2.5 px-4 py-2 md:p-4 relative self-stretch w-full overflow-x-auto" role="tablist">
        <div className="inline-flex items-start gap-0.5 p-1 bg-neutral-50 rounded-lg overflow-x-auto md:overflow-visible w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md whitespace-nowrap ${activeTab === tab.id ? "bg-white shadow-sescy" : ""}`}
            >
              <img className="w-5 h-5" alt={tab.label} src={tab.icon} />
              <span className={`w-fit mt-[-2.00px] [font-family:'Archivo',Helvetica] font-normal text-[13px] md:text-sm ${activeTab === tab.id ? "text-black" : "text-[#494949]"}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <section className="flex flex-col items-start px-4 py-0 w-full">
        {notificationSettings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between md:gap-[204px] py-4 md:py-4 w-full border-b border-gray-100 last:border-b-0">
            <label 
              htmlFor={`toggle-${setting.id}`} 
              className="w-full md:w-40 [font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] md:text-textblacksecondary text-[15px] md:text-sm"
            >
              {setting.label}
            </label>
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                id={`toggle-${setting.id}`}
                checked={setting.enabled}
                onChange={() => handleToggle(setting.id)}
                className="sr-only"
                aria-label={`Toggle ${setting.label} notifications`}
              />
              <button
                role="switch"
                aria-checked={setting.enabled}
                onClick={() => handleToggle(setting.id)}
                className={`relative inline-flex items-center h-[26px] w-[46px] md:h-5 md:w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
                  setting.enabled ? "bg-[#0066FF]" : "bg-[#d1d5db]"
                }`}
              >
                <span
                  className={`inline-block h-[22px] w-[22px] md:h-4 md:w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    setting.enabled ? "translate-x-[22px] md:translate-x-5" : "translate-x-[2px] md:translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default SettingsNotification;