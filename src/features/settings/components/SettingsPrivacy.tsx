import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/constants";

const SettingsPrivacy = () => {
  const [activeTab, setActiveTab] = useState("privacy-security");
  const navigate = useNavigate();
  const location = useLocation();
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);

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

  const settingsData = [
    {
      label: "Last Login Location",
      value: "Lagos, Nigeria",
      type: "text",
    },
    {
      label: "Security Question",
      value: "Set",
      type: "button",
      buttonText: "Manage",
    },
    {
      label: "Enable Login Alerts",
      value: null,
      type: "toggle",
    },
  ];

  useEffect(() => {
    const path = location.pathname.replace(`${APP_PATHS.SETTINGS}/`, "");
    if (!path || path === "" || path === "business-profile") setActiveTab("privacy-security");
    else setActiveTab(path);
  }, [location.pathname]);

  const handleTabClick = (tabId: string) => {
    if (tabId === "business-profile") navigate(`${APP_PATHS.SETTINGS}`);
    else navigate(`${APP_PATHS.SETTINGS}/${tabId}`);
  };

  return (
    <div
      className="flex flex-col items-start relative bg-white"
      data-model-id="118:685"
    >
      <nav className="flex flex-col items-start justify-center gap-2.5 p-4 relative self-stretch w-full flex-[0_0_auto]">
        <div
          className="inline-flex items-start gap-0.5 p-1 relative flex-[0_0_auto] bg-neutral-50 rounded-lg"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`inline-flex items-center justify-center gap-1 px-3 py-1 relative flex-[0_0_auto] rounded-md ${
                activeTab === tab.id ? "bg-white shadow-sescy" : ""
              }`}
            >
              <img
                className="relative w-5 h-5 aspect-[1]"
                alt={tab.alt}
                src={tab.icon}
              />
              <span className="relative w-fit mt-[-2.00px] [font-family:'Archivo',Helvetica] font-normal text-[#494949] text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <section className="flex flex-col items-start px-4 py-0 relative self-stretch w-full flex-[0_0_auto]">
          {settingsData.map((setting, index) => (
            <div key={index}>
              <div className="flex items-center gap-[204px] px-0 py-4 relative self-stretch w-full flex-[0_0_auto]">
                <label className="relative flex items-center justify-center w-40 [font-family:'Archivo',Helvetica] font-normal text-textblacksecondary text-sm tracking-[-0.42px] leading-[normal]">
                  {setting.label}
                </label>

                {setting.type === "text" && (
                  <div className="flex w-[322px] items-center justify-between relative">
                    <div className="flex w-60 items-center gap-1.5 relative">
                      <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-textblackprimary text-sm text-center tracking-[-0.42px] leading-[normal] whitespace-nowrap">
                        {setting.value}
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-center gap-1 px-3 py-1.5 relative flex-[0_0_auto] bg-white rounded-md border border-solid border-[#d0d5dd] opacity-0">
                      <img
                        className="relative w-3.5 h-3.5 mt-[-21399.50px] ml-[-72071.00px] aspect-[1]"
                        alt="Button icon"
                        src="/img/button-icon.png"
                      />
                      <span className="relative flex items-center justify-center w-fit mt-[-1.00px] font-regular-b3 font-[number:var(--regular-b3-font-weight)] text-black text-[length:var(--regular-b3-font-size)] text-center tracking-[var(--regular-b3-letter-spacing)] leading-[var(--regular-b3-line-height)] [font-style:var(--regular-b3-font-style)]">
                        Edit
                      </span>
                    </div>
                  </div>
                )}

                {setting.type === "button" && (
                  <div className="inline-flex items-center gap-6 relative flex-[0_0_auto]">
                    <div className="flex w-[233px] items-center gap-1.5 relative">
                      <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-textblackprimary text-sm text-center tracking-[-0.42px] leading-[normal] whitespace-nowrap">
                        {setting.value}
                      </div>
                    </div>
                    <button className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]">
                      <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                        {setting.buttonText}
                      </span>
                    </button>
                  </div>
                )}

                {setting.type === "toggle" && (
                  <div className="flex w-[322px] items-center justify-between relative">
                    <button
                      role="switch"
                      aria-checked={loginAlertsEnabled}
                      onClick={() => setLoginAlertsEnabled(!loginAlertsEnabled)}
                      className="relative w-60"
                    >
                      <img
                        className="relative w-60"
                        alt="Toggle switch"
                        src="https://c.animaapp.com/nHRrOw7w/img/frame-1618868570.svg"
                      />
                    </button>
                    <div className="inline-flex items-center justify-center gap-1 px-3 py-1.5 relative flex-[0_0_auto] bg-white rounded-md border border-solid border-[#d0d5dd] opacity-0">
                      <img
                        className="mt-[-21522.50px] ml-[-72071.00px] relative w-3.5 h-3.5 aspect-[1]"
                        alt="Button icon"
                        src="/img/image.png"
                      />
                      <span className="relative flex items-center justify-center w-fit mt-[-1.00px] font-regular-b3 font-[number:var(--regular-b3-font-weight)] text-black text-[length:var(--regular-b3-font-size)] text-center tracking-[var(--regular-b3-letter-spacing)] leading-[var(--regular-b3-line-height)] [font-style:var(--regular-b3-font-style)]">
                        Edit
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start gap-2.5 px-0 py-2 relative self-stretch w-full flex-[0_0_auto]">
              <hr className="relative w-[752px] h-px mt-[-1.00px] border-0 bg-[url(https://c.animaapp.com/nHRrOw7w/img/line-21.svg)] bg-cover" />
            </div>

            <div className="flex items-center gap-[204px] pt-6 pb-4 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-40 [font-family:'Archivo',Helvetica] font-normal text-textblacksecondary text-sm tracking-[-0.42px] leading-[normal]">
                Want to log out?
              </div>

              <button className="inline-flex items-center justify-center gap-1 px-3 py-1.5 relative flex-[0_0_auto] bg-[#ffefef] rounded-md border border-solid border-primitives-red-red-50">
                <img
                  className="relative w-3.5 h-3.5 aspect-[1]"
                  alt="Log out icon"
                  src="https://c.animaapp.com/nHRrOw7w/img/button-icon.svg"
                />
                <span className="relative flex items-center justify-center w-fit mt-[-0.50px] [font-family:'Archivo',Helvetica] font-normal text-primitives-red-red-500 text-xs text-center tracking-[-0.36px] leading-[normal] whitespace-nowrap">
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