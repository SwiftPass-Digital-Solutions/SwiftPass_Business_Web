import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/constants";

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

  const handleToggle = (id: string) => {
    setNotificationSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
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

  return (
    <div className="flex flex-col items-start relative bg-white" data-model-id="117:567">
      <nav className="flex flex-col items-start justify-center gap-2.5 p-4 relative self-stretch w-full" role="tablist">
        <div className="inline-flex items-start gap-0.5 p-1 bg-neutral-50 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md ${activeTab === tab.id ? "bg-white shadow-sescy" : ""}`}
            >
              <img className="w-5 h-5" alt={tab.label} src={tab.icon} />
              <span className={`w-fit mt-[-2.00px] [font-family:'Archivo',Helvetica] font-normal text-sm ${activeTab === tab.id ? "text-black" : "text-[#494949]"}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <section className="flex flex-col items-start px-4 py-0 w-full">
        {notificationSettings.map((setting) => (
          <div key={setting.id} className="flex items-center gap-[204px] py-4 w-full">
            <label htmlFor={`toggle-${setting.id}`} className="w-40 [font-family:'Archivo',Helvetica] font-normal text-textblacksecondary text-sm">
              {setting.label}
            </label>
            <div className="relative w-20">
              <input type="checkbox" id={`toggle-${setting.id}`} checked={setting.enabled} onChange={() => handleToggle(setting.id)} className="sr-only" />
              <div className="h-5 cursor-pointer" onClick={() => handleToggle(setting.id)} role="presentation">
                <div className="w-[30px] h-4 bg-primitives-primary-blue-50 rounded-[28px]" />
                <div className="absolute left-3 top-0 w-5 h-5 bg-primitives-primary-blue-500 rounded-[10px]" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default SettingsNotification;