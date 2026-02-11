import { useState, useEffect } from "react";
import { Frame as NewMember } from "./NewMember";
import { Frame as EditMemberFrame, MemberFormData } from "./EditMembers";
import InvitationSent from "./InvitationSent";
import EditSucess from "./EditSucess";
import RemoveMemberDialog from "./RemoveMemberDialog";
import RemoveMemberSuccessDialog from "./RemoveMemberSuccessDialog";
import SlidePanel from "@/components/shared/SlidePanel";
import { getTeamMembers, TeamMember as ServiceTeamMember, deleteTeamMember } from "@/services/settings";
import { BusinessRoleEnum } from "@/constants/enums";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/constants";
import { PageLoader } from "@/components";

interface TabItem {
  id: string;
  label: string;
  icon: string;
  iconAlt: string;
}

type TeamMember = ServiceTeamMember;
const SettingsTeam = () => {
  const [activeTab, setActiveTab] = useState<string>("team-management");
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      id: "business-profile",
      label: "Business Profile",
      icon: "https://c.animaapp.com/LXvJiou3/img/user.svg",
      iconAlt: "User",
    },
    {
      id: "team-management",
      label: "Team Management",
      icon: "https://c.animaapp.com/LXvJiou3/img/vuesax-linear-profile-2user.svg",
      iconAlt: "Vuesax linear",
    },
    {
      id: "notification-preferences",
      label: "Notification Preferences",
      icon: "https://c.animaapp.com/LXvJiou3/img/notification-circle.svg",
      iconAlt: "Notification circle",
    },
    {
      id: "privacy-security",
      label: "Privacy & Security",
      icon: "https://c.animaapp.com/LXvJiou3/img/security-lock.svg",
      iconAlt: "Security lock",
    },
  ];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewMember, setShowNewMember] = useState<boolean>(false);
  const [showEditMember, setShowEditMember] = useState<boolean>(false);
  // View all modal state (opens a full panel like the billing history modal)
  const [showViewAll, setShowViewAll] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showInvitationSent, setShowInvitationSent] = useState<boolean>(false);
  const [invitedEmail, setInvitedEmail] = useState<string>("");
  const [showEditSuccess, setShowEditSuccess] = useState<boolean>(false);
  const [editSuccessEmail, setEditSuccessEmail] = useState<string>("");
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<number | null>(null);
  const [confirmingRemoveName, setConfirmingRemoveName] = useState<string>("");
  const [showRemoveSuccess, setShowRemoveSuccess] = useState<boolean>(false);
  const [removedMemberName, setRemovedMemberName] = useState<string>("");

  const teamStats = [
    { label: "Admin Users", value: String(teamMembers.filter((m) => m.role === "Admin").length) },
    { label: "Team Members", value: String(teamMembers.length) },
  ];

  const refreshTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const members = await getTeamMembers();
      setTeamMembers(members);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      if (!cancelled) await refreshTeamMembers();
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const startRemove = (memberId: number, memberName: string) => {
    setConfirmingRemoveId(memberId);
    setConfirmingRemoveName(memberName);
  };

  const cancelRemove = () => {
    setConfirmingRemoveId(null);
    setConfirmingRemoveName("");
  };

  const confirmRemove = async () => {
    if (confirmingRemoveId == null) return;
    const memberId = confirmingRemoveId;
    const removedName = confirmingRemoveName;
    setRemovingId(memberId);
    try {
      await deleteTeamMember(memberId);
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
      setRemovedMemberName(removedName);
      setShowRemoveSuccess(true);
    } catch (err: any) {
      console.error("Failed to remove member:", err);
      alert(err?.message || "Failed to remove member");
    } finally {
      setRemovingId(null);
      cancelRemove();
    }
  };

  const getStatusStyles = (status: string) => {
    if (status === "Active") {
      return {
        bgColor: "bg-[#effff2]",
        dotColor: "bg-[#00a821]",
        textColor: "text-[#00a821]",
      };
    }
    return {
      bgColor: "bg-[#fffbf4]",
      dotColor: "bg-[#ffa412]",
      textColor: "text-[#ffa412]",
    };
  };

  useEffect(() => {
    const path = location.pathname.replace(`${APP_PATHS.SETTINGS}/`, "");
    if (!path || path === "" || path === "business-profile") setActiveTab("business-profile");
    else setActiveTab(path);
  }, [location.pathname]);

  // Only show first 3 members in the main team management table; when "View all" is active show full list
  const displayedMembers = showViewAll ? teamMembers : teamMembers.slice(0, 3);

  return (
    <div className="flex flex-col items-start relative bg-white">
      {loading && <PageLoader />}
      {/* Navigation Tabs */}
      <nav
        className="flex flex-col items-start justify-center gap-2.5 p-4 relative self-stretch w-full flex-[0_0_auto]"
        role="navigation"
        aria-label="Team management navigation"
      >
        {/* Desktop tabs */}
        <div
          className="hidden md:inline-flex items-start gap-0.5 p-1 relative flex-[0_0_auto] bg-neutral-50 rounded-lg"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`inline-flex items-center justify-center gap-1 px-3 py-1 relative flex-[0_0_auto] rounded-md ${
                activeTab === tab.id ? "bg-white shadow-sescy" : ""
              }`}
              onClick={() => {
                // navigate to the correct sub-route
                if (tab.id === "business-profile") navigate(`${APP_PATHS.SETTINGS}`);
                else navigate(`${APP_PATHS.SETTINGS}/${tab.id}`);
                setActiveTab(tab.id);
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              type="button"
            >
              <img
                className="relative w-5 h-5 aspect-[1]"
                alt={tab.iconAlt}
                src={tab.icon}
                aria-hidden="true"
              />
              <span
                className={`relative w-fit mt-[-2.00px] [font-family:'Archivo',Helvetica] font-normal text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap ${
                  activeTab === tab.id ? "text-black" : "text-[#494949]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile horizontal scrollable tabs */}
        <div className="md:hidden w-full overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 relative flex-[0_0_auto] rounded-lg border ${
                  activeTab === tab.id 
                    ? "bg-white border-gray-300" 
                    : "bg-white border-gray-200"
                }`}
                onClick={() => {
                  if (tab.id === "business-profile") navigate(`${APP_PATHS.SETTINGS}`);
                  else navigate(`${APP_PATHS.SETTINGS}/${tab.id}`);
                  setActiveTab(tab.id);
                }}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
              >
                <img
                  className="relative w-5 h-5 aspect-[1]"
                  alt={tab.iconAlt}
                  src={tab.icon}
                  aria-hidden="true"
                />
                <span
                  className={`relative [font-family:'Archivo',Helvetica] text-sm whitespace-nowrap ${
                    activeTab === tab.id ? "font-medium text-black" : "font-normal text-[#666]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Team Table Content */}
      <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-2 p-5 relative self-stretch w-full flex-[0_0_auto] rounded-3xl overflow-hidden border border-solid border-primitives-neutral-neutral-600">
          <h2 className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-black text-xl tracking-[-0.60px] leading-[29.0px] whitespace-nowrap">
            Team Management
          </h2>

          {teamStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]"
            >
              <div className="flex items-center gap-2.5 p-4 relative flex-1 grow bg-primitives-neutral-neutral-400 rounded-xl border border-solid border-[#efefef]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-200 text-base md:text-xl tracking-[-0.60px] leading-[29.0px] whitespace-nowrap">
                  {stat.label}
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-4 relative flex-1 grow rounded-xl border border-solid border-[#efefef]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-dark-dark-600 text-base md:text-xl tracking-[-0.60px] leading-[29.0px] whitespace-nowrap">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-5 p-4 md:p-6 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[36px] border border-solid border-[#efefef]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="font-medium text-black text-xl tracking-[-0.60px] leading-[normal] relative w-fit [font-family:'Archivo',Helvetica] whitespace-nowrap">
              Team Table
            </h2>

            <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
              <button
                className="inline-flex items-center justify-center gap-2.5 px-4 py-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-300 rounded-xl border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                onClick={() => setShowNewMember(true)}
                type="button"
              >
                <span className="text-primitives-neutral-neutral-1000 relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                  Add new member
                </span>
              </button>

              <button onClick={() => setShowViewAll(true)} type="button" className="inline-flex items-center justify-center gap-2.5 px-4 py-3 relative flex-[0_0_auto] bg-primitives-primary-blue-500 rounded-xl border border-solid border-primitives-primary-blue-300 shadow-[0px_2px_0px_#dcdcdc] bg-[#0C39ED]">
                <span className="text-neutral-50 relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-medium text-sm tracking-[-0.42px] leading-[20.3px] whitespace-nowrap">
                  View all
                </span>
              </button>
              </div>
            </div>

          {/* Full-screen modal for viewing all team members (billing-style) */}
          {showViewAll && (
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40">
              <div className="w-full h-full bg-white overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                  <div
                    className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between"
                    style={{ marginLeft: "var(--sidebar-width)", width: "calc(100% - var(--sidebar-width))" }}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowViewAll(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
                        aria-label="Go back"
                        type="button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900 [font-family:'Archivo',Helvetica]">Team Table</h2>
                        <p className="text-sm text-gray-500 [font-family:'Archivo',Helvetica]">View your full team</p>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowNewMember(true)}
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 rounded-xl border border-solid border-blue-400 shadow-[0px_2px_0px_#dcdcdc] hover:bg-blue-700 active:scale-95 transition-all"
                        type="button"
                      >
                        <span className="font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] [font-family:'Archivo',Helvetica]">Add new member</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="max-w-7xl mx-auto px-6 py-8"
                  style={{ marginLeft: "var(--sidebar-width)", width: "calc(100% - var(--sidebar-width))" }}
                >
                  <div className="w-full overflow-x-auto bg-white rounded-2xl sm:rounded-[28px] border border-solid border-[#efefef] shadow-sm">
                    <div className="hidden md:flex bg-[#fbfbfb] border-b border-gray-200">
                      <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500">Name</div>
                      <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500">Role</div>
                      <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500">Status</div>
                      <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500">Actions</div>
                    </div>

                    <div>
                      {teamMembers.length === 0 ? (
                        <div className="px-6 py-16 text-center text-gray-500">No team members</div>
                      ) : (
                        teamMembers.map((member, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row items-center border-t border-[#f4f4f4] px-6 py-4">
                            <div className="flex-1 text-sm text-gray-800">{member.name}</div>
                            <div className="flex-1 text-sm text-gray-800">{member.role}</div>
                            <div className="flex-1 text-sm text-gray-800">
                              {(() => {
                                const statusStyles = getStatusStyles(member.status);
                                return (
                                  <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 ${statusStyles.bgColor} rounded-[999px]`}>
                                    <div className={`w-1.5 h-1.5 ${statusStyles.dotColor} rounded-[3px]`} />
                                    <div className={`[font-family:'Archivo',Helvetica] font-normal ${statusStyles.textColor} text-sm`}>
                                      {member.status}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex-1 text-sm text-gray-800">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingMember(member);
                                    setShowEditMember(true);
                                  }}
                                  className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                                  type="button"
                                >
                                  <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                                    {member.actions[0]}
                                  </span>
                                </button>

                                <button
                                  onClick={() => startRemove(member.id, member.name)}
                                  className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-[#fff4f4] rounded-lg border border-solid border-primitives-red-red-100 shadow-[0px_2px_0px_#ffb8b8]"
                                  disabled={removingId === member.id}
                                  type="button"
                                >
                                  <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                                    {removingId === member.id ? "Removing..." : member.actions[1]}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          

          {error ? (
            <div className="w-full py-5 text-lg text-center text-red-500">{error}</div>
          ) : teamMembers.length === 0 && !loading ? (
            <div className="w-full py-5 text-lg text-center text-gray-500">No team members to show</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:flex flex-col md:flex-row w-full items-center relative bg-white rounded-xl overflow-hidden border border-solid border-[#f7f7f7]">
                <div className="flex flex-col items-start relative flex-1 grow">
                  <div className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-[#fbfbfb]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                      Name
                    </div>
                  </div>

                  {displayedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#f4f4f4]"
                    >
                      <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                        {member.name}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-start relative flex-1 grow">
                  <div className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-[#fbfbfb]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                      Role
                    </div>
                  </div>

                  {displayedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#f4f4f4]"
                    >
                      <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                        {member.role}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-start relative flex-1 grow">
                  <div className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-[#fbfbfb]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                      Status
                    </div>
                  </div>

                  {displayedMembers.map((member, index) => {
                    const statusStyles = getStatusStyles(member.status);
                    return (
                      <div
                        key={index}
                        className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#f4f4f4]"
                      >
                        <div
                          className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 relative flex-[0_0_auto] ${statusStyles.bgColor} rounded-[999px]`}>
                          <div
                            className={`relative w-1.5 h-1.5 ${statusStyles.dotColor} rounded-[3px] aspect-[1]`}
                          />

                          <div
                            className={`relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal ${statusStyles.textColor} text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap`}>
                            {member.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col items-start relative flex-1 grow">
                  <div className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-[#fbfbfb]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] leading-[23.2px] whitespace-nowrap">
                      Actions
                    </div>
                  </div>

                  {displayedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex h-[55px] items-center gap-2.5 p-4 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#f4f4f4]"
                    >
                      <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] mt-[-4.50px] mb-[-4.50px]">
                        <button
                          className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                          onClick={() => {
                            setEditingMember(member);
                            setShowEditMember(true);
                          }}
                          type="button"
                        >
                          <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                            {member.actions[0]}
                          </span>
                        </button>

                        <button
                          className="inline-flex h-8 items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-[#fff4f4] rounded-lg border border-solid border-primitives-red-red-100 shadow-[0px_2px_0px_#ffb8b8]"
                          onClick={() => startRemove(member.id, member.name)}
                          disabled={removingId === member.id}
                          type="button"
                        >
                          <span className="relative w-fit mt-[-5.50px] mb-[-3.50px] [font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs tracking-[-0.36px] leading-[17.4px] whitespace-nowrap">
                            {removingId === member.id ? "Removing..." : member.actions[1]}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="flex md:hidden flex-col gap-4 w-full">
                {displayedMembers.map((member, index) => {
                  const statusStyles = getStatusStyles(member.status);
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-solid border-[#f0f0f0]"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="text-base font-medium text-black [font-family:'Archivo',Helvetica]">
                          {member.name}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#666] [font-family:'Archivo',Helvetica]">
                            Role
                          </div>
                          <div className="text-sm font-medium text-black [font-family:'Archivo',Helvetica]">
                            {member.role}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#666] [font-family:'Archivo',Helvetica]">
                            Status
                          </div>
                          <div
                            className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 ${statusStyles.bgColor} rounded-[999px]`}
                          >
                            <div
                              className={`w-1.5 h-1.5 ${statusStyles.dotColor} rounded-[3px]`}
                            />
                            <div
                              className={`[font-family:'Archivo',Helvetica] font-normal ${statusStyles.textColor} text-sm`}
                            >
                              {member.status}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-primitives-neutral-neutral-600"
                          onClick={() => {
                            setEditingMember(member);
                            setShowEditMember(true);
                          }}
                          type="button"
                        >
                          <span className="[font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-sm">
                            {member.actions[0]}
                          </span>
                        </button>

                        <button
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#fff4f4] rounded-lg border border-solid border-primitives-red-red-100"
                          onClick={() => startRemove(member.id, member.name)}
                          disabled={removingId === member.id}
                          type="button"
                        >
                          <span className="[font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-sm">
                            {removingId === member.id ? "Removing..." : member.actions[1]}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {showNewMember && (
          <SlidePanel open={showNewMember} onClose={() => setShowNewMember(false)}>
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-6">
                <NewMember
                  onClose={() => setShowNewMember(false)}
                  onInviteSent={async (email: string) => {
                    setInvitedEmail(email);
                    setShowNewMember(false);
                    setShowInvitationSent(true);
                    try {
                      await refreshTeamMembers();
                    } catch (e) {
                      // ignore refresh errors here
                    }
                  }}
                />
              </div>
            </div>
          </SlidePanel>
        )}
        {showEditMember && editingMember && (
          <SlidePanel open={showEditMember} onClose={() => setShowEditMember(false)}>
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-6">
                <EditMemberFrame
                  initialData={{
                    id: editingMember.id,
                    fullName: editingMember.name,
                    workEmail: (editingMember as any).email || "",
                    phoneNumber: (editingMember as any).phoneNumber || "",
                    role:
                      typeof editingMember.role === "string"
                        ? (BusinessRoleEnum[editingMember.role as keyof typeof BusinessRoleEnum] ?? "")
                        : (editingMember.role as any),
                    note: "",
                  }}
                  onClose={() => setShowEditMember(false)}
                  onSave={async (data: MemberFormData) => {
                    try {
                      await refreshTeamMembers();
                    } catch (e) {
                      // fallback to optimistic update if refresh fails
                      const roleString =
                        typeof data.role === "number"
                          ? (BusinessRoleEnum[data.role as number] as string) || "Member"
                          : (data.role as string) || "Member";

                      setTeamMembers((prev) =>
                        prev.map((m) => (m.id === editingMember.id ? { ...m, name: data.fullName, role: roleString } : m))
                      );
                    }
                    setShowEditMember(false);
                    setEditSuccessEmail(data.workEmail);
                    setShowEditSuccess(true);
                  }}
                />
              </div>
            </div>
          </SlidePanel>
        )}
        {showInvitationSent && (
          <InvitationSent
            email={invitedEmail}
            onClose={() => setShowInvitationSent(false)}
          />
        )}
        {showEditSuccess && (
          <EditSucess
            email={editSuccessEmail}
            onClose={() => setShowEditSuccess(false)}
          />
        )}
        {confirmingRemoveId !== null && (
          <RemoveMemberDialog
            memberName={confirmingRemoveName}
            isRemoving={removingId === confirmingRemoveId}
            onCancel={cancelRemove}
            onConfirm={confirmRemove}
          />
        )}
        {showRemoveSuccess && (
          <RemoveMemberSuccessDialog
            memberName={removedMemberName}
            onClose={() => setShowRemoveSuccess(false)}
          />
        )}
        </div>
        </div>
        
        

      );
};

export default SettingsTeam;