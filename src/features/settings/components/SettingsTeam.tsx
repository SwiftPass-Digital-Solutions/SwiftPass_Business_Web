import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Frame as NewMember } from "./NewMember";
import { Frame as EditMemberFrame, MemberFormData } from "./EditMembers";
import InvitationSent from "./InvitationSent";
import EditSucess from "./EditSucess";
import RemoveMemberDialog from "./RemoveMemberDialog";
import RemoveMemberSuccessDialog from "./RemoveMemberSuccessDialog";
import SlidePanel from "@/components/shared/SlidePanel";
import {
  getTeamMembers,
  TeamMember as ServiceTeamMember,
  deleteTeamMember,
} from "@/services/settings";
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
  const [showViewAll, setShowViewAll] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showInvitationSent, setShowInvitationSent] = useState<boolean>(false);
  const [invitedEmail, setInvitedEmail] = useState<string>("");
  const [showEditSuccess, setShowEditSuccess] = useState<boolean>(false);
  const [editSuccessEmail, setEditSuccessEmail] = useState<string>("");
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<number | null>(
    null,
  );
  const [confirmingRemoveName, setConfirmingRemoveName] = useState<string>("");
  const [showRemoveSuccess, setShowRemoveSuccess] = useState<boolean>(false);
  const [removedMemberName, setRemovedMemberName] = useState<string>("");

  const teamStats = [
    {
      label: "Admin Users",
      value: String(teamMembers.filter((m) => m.role === "Admin").length),
    },
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
      toast.error(err?.message || "Failed to remove member");
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
    if (!path || path === "" || path === "business-profile")
      setActiveTab("business-profile");
    else setActiveTab(path);
  }, [location.pathname]);

  const displayedMembers = showViewAll ? teamMembers : teamMembers.slice(0, 3);

  return (
    <div
      className="w-full min-w-0 max-w-full box-border"
      style={{ overflowX: "hidden" }}
    >
      <div className="flex flex-col relative bg-white w-full min-w-0 box-border">
        {loading && <PageLoader />}

        {/* ── Navigation Tabs ── */}
        <nav
          className="w-full min-w-0 py-2 px-2 md:px-4 md:py-4 box-border"
          role="navigation"
          aria-label="Team management navigation"
        >
          {/* Desktop tabs */}
          <div
            className="hidden md:inline-flex items-start gap-0.5 p-1 bg-neutral-50 rounded-lg"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md whitespace-nowrap ${
                  activeTab === tab.id ? "bg-white shadow-sescy" : ""
                }`}
                onClick={() => {
                  if (tab.id === "business-profile")
                    navigate(`${APP_PATHS.SETTINGS}`);
                  else navigate(`${APP_PATHS.SETTINGS}/${tab.id}`);
                  setActiveTab(tab.id);
                }}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
              >
                <img
                  className="w-5 h-5"
                  alt={tab.iconAlt}
                  src={tab.icon}
                  aria-hidden="true"
                />
                <span
                  className={`[font-family:'Archivo',Helvetica] font-normal text-sm whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-[#494949]"}`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile tabs — icon only on small screens */}
          <div
            className="flex md:hidden items-center gap-0.5 p-0.5 bg-neutral-50 rounded-lg w-full box-border"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`inline-flex items-center justify-center gap-0.5 px-1 py-1.5 flex-1 min-w-0 rounded-md box-border ${
                  activeTab === tab.id ? "bg-white shadow-sescy" : ""
                }`}
                onClick={() => {
                  if (tab.id === "business-profile")
                    navigate(`${APP_PATHS.SETTINGS}`);
                  else navigate(`${APP_PATHS.SETTINGS}/${tab.id}`);
                  setActiveTab(tab.id);
                }}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
                title={tab.label}
              >
                <img
                  className="w-4 h-4 flex-shrink-0"
                  alt={tab.iconAlt}
                  src={tab.icon}
                  aria-hidden="true"
                />
                <span
                  className={`hidden min-[400px]:inline truncate [font-family:'Archivo',Helvetica] font-normal text-[9px] ${activeTab === tab.id ? "text-black" : "text-[#494949]"}`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="flex flex-col gap-5 w-full min-w-0 px-3 md:px-0 box-border">
          {/* Team Management stats card */}
          <div className="flex flex-col gap-2 p-4 md:p-5 rounded-2xl md:rounded-3xl overflow-hidden border border-solid border-primitives-neutral-neutral-600 w-full min-w-0 box-border">
            <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-base md:text-xl tracking-[-0.60px] leading-[normal]">
              Team Management
            </h2>

            {teamStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-2 w-full min-w-0 box-border"
              >
                <div className="flex items-center gap-2.5 p-3 md:p-4 flex-1 min-w-0 bg-primitives-neutral-neutral-400 rounded-xl border border-solid border-[#efefef]">
                  <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-200 text-sm md:text-xl tracking-[-0.60px] leading-[normal] truncate">
                    {stat.label}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 md:p-4 flex-1 min-w-0 rounded-xl border border-solid border-[#efefef]">
                  <div className="[font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-dark-dark-600 text-sm md:text-xl tracking-[-0.60px] leading-[normal]">
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Table card */}
          <div className="flex flex-col gap-4 p-4 md:p-6 bg-white rounded-2xl md:rounded-[36px] border border-solid border-[#efefef] w-full min-w-0 box-border">
            {/* Header row */}
            <div className="flex items-center justify-between w-full min-w-0 box-border">
              <h2 className="[font-family:'Archivo',Helvetica] font-medium text-black text-base md:text-xl tracking-[-0.60px] leading-[normal] truncate">
                Team Table
              </h2>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-3 bg-primitives-neutral-neutral-300 rounded-xl border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                  onClick={() => setShowNewMember(true)}
                  type="button"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs md:text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap">
                    Add new member
                  </span>
                </button>

                <button
                  onClick={() => setShowViewAll(true)}
                  type="button"
                  className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-3 bg-[#0C39ED] rounded-xl border border-solid border-primitives-primary-blue-300 shadow-[0px_2px_0px_#dcdcdc]"
                >
                  <span className="[font-family:'Archivo',Helvetica] font-medium text-neutral-50 text-xs md:text-sm tracking-[-0.42px] leading-[normal] whitespace-nowrap">
                    View all
                  </span>
                </button>
              </div>
            </div>

            {/* View all full-screen modal */}
            {showViewAll && (
              <div className="fixed top-0 right-0 bottom-0 left-0 z-50 bg-white flex flex-col overflow-hidden md:left-[var(--sidebar-width)]">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-200 w-full min-w-0 box-border">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => setShowViewAll(false)}
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300"
                      type="button"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M15 18l-6-6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <h2 className="[font-family:'Archivo',Helvetica] font-semibold text-gray-900 text-base md:text-2xl truncate">
                      Team Table
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowNewMember(true)}
                    className="flex-shrink-0 ml-3 inline-flex items-center justify-center px-3 py-2 bg-blue-600 rounded-xl border border-blue-400"
                    type="button"
                  >
                    <span className="[font-family:'Archivo',Helvetica] font-medium text-white text-xs whitespace-nowrap">
                      + Add member
                    </span>
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto w-full min-w-0 px-4 py-4 box-border">
                  {teamMembers.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 [font-family:'Archivo',Helvetica]">
                      No team members
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block w-full bg-white rounded-[28px] border border-[#efefef] shadow-sm overflow-hidden">
                        <div className="flex bg-[#fbfbfb] border-b border-gray-200">
                          <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 [font-family:'Archivo',Helvetica]">
                            Name
                          </div>
                          <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 [font-family:'Archivo',Helvetica]">
                            Role
                          </div>
                          <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 [font-family:'Archivo',Helvetica]">
                            Status
                          </div>
                          <div className="flex-1 px-6 py-4 text-sm font-medium text-gray-500 [font-family:'Archivo',Helvetica]">
                            Actions
                          </div>
                        </div>
                        {teamMembers.map((member, idx) => {
                          const s = getStatusStyles(member.status);
                          return (
                            <div
                              key={idx}
                              className="flex items-center border-t border-[#f4f4f4] px-6 py-4"
                            >
                              <div className="flex-1 text-sm text-gray-800 [font-family:'Archivo',Helvetica] truncate">
                                {member.name}
                              </div>
                              <div className="flex-1 text-sm text-gray-800 [font-family:'Archivo',Helvetica] truncate">
                                {member.role}
                              </div>
                              <div className="flex-1">
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 ${s.bgColor} rounded-full`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 ${s.dotColor} rounded-full`}
                                  />
                                  <span
                                    className={`[font-family:'Archivo',Helvetica] ${s.textColor} text-sm`}
                                  >
                                    {member.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 inline-flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingMember(member);
                                    setShowEditMember(true);
                                  }}
                                  className="inline-flex h-8 items-center justify-center p-3 bg-primitives-neutral-neutral-300 rounded-lg border border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                                  type="button"
                                >
                                  <span className="[font-family:'Archivo',Helvetica] font-medium text-xs">
                                    {member.actions[0]}
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    startRemove(member.id, member.name)
                                  }
                                  className="inline-flex h-8 items-center justify-center p-3 bg-[#fff4f4] rounded-lg border border-primitives-red-red-100 shadow-[0px_2px_0px_#ffb8b8]"
                                  disabled={removingId === member.id}
                                  type="button"
                                >
                                  <span className="[font-family:'Archivo',Helvetica] font-medium text-xs">
                                    {removingId === member.id
                                      ? "Removing..."
                                      : member.actions[1]}
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile list */}
                      <div className="flex md:hidden flex-col w-full min-w-0 box-border">
                        {teamMembers.map((member, idx) => {
                          const s = getStatusStyles(member.status);
                          return (
                            <div
                              key={idx}
                              className="flex flex-col w-full min-w-0 border-b border-[#f0f0f0] last:border-b-0 py-4 box-border"
                            >
                              <div className="flex items-center justify-between mb-3 min-w-0">
                                <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-[15px] truncate flex-1 min-w-0 pr-2">
                                  {member.name}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d9d9d9] flex-shrink-0" />
                              </div>
                              <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4] min-w-0">
                                <span className="[font-family:'Archivo',Helvetica] text-[#666666] text-sm flex-shrink-0">
                                  Role
                                </span>
                                <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-sm truncate flex-1 min-w-0 text-right">
                                  {member.role}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4]">
                                <span className="[font-family:'Archivo',Helvetica] text-[#666666] text-sm flex-shrink-0">
                                  Status
                                </span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`}
                                  />
                                  <span
                                    className={`[font-family:'Archivo',Helvetica] ${s.textColor} text-sm`}
                                  >
                                    {member.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-3 mt-3 min-w-0 box-border">
                                <button
                                  className="flex-1 min-w-0 flex items-center justify-center py-2.5 bg-white rounded-xl border border-[#e5e5e5]"
                                  onClick={() => {
                                    setEditingMember(member);
                                    setShowEditMember(true);
                                    setShowViewAll(false);
                                  }}
                                  type="button"
                                >
                                  <span className="[font-family:'Archivo',Helvetica] text-[#1a1a1a] text-sm">
                                    {member.actions[0]}
                                  </span>
                                </button>
                                <button
                                  className="flex-1 min-w-0 flex items-center justify-center py-2.5 bg-[#fff4f4] rounded-xl border border-[#ffb8b8]"
                                  onClick={() =>
                                    startRemove(member.id, member.name)
                                  }
                                  disabled={removingId === member.id}
                                  type="button"
                                >
                                  <span className="[font-family:'Archivo',Helvetica] text-[#cc0e0e] text-sm">
                                    {removingId === member.id
                                      ? "Removing..."
                                      : member.actions[1]}
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
              </div>
            )}

            {/* Error / empty state */}
            {error ? (
              <div className="w-full py-5 text-lg text-center text-red-500">
                {error}
              </div>
            ) : teamMembers.length === 0 && !loading ? (
              <div className="w-full py-5 text-lg text-center text-gray-500">
                No team members to show
              </div>
            ) : (
              <>
                {/* ── Desktop Table ── */}
                <div className="hidden md:flex flex-col w-full bg-white rounded-xl overflow-hidden border border-solid border-[#f7f7f7]">
                  <div className="flex w-full">
                    {/* Name col */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex h-[55px] items-center gap-2.5 p-4 bg-[#fbfbfb]">
                        <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px]">
                          Name
                        </div>
                      </div>
                      {displayedMembers.map((member, i) => (
                        <div
                          key={i}
                          className="flex h-[55px] items-center gap-2.5 p-4 bg-white border-b border-[#f4f4f4]"
                        >
                          <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] truncate">
                            {member.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Role col */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex h-[55px] items-center gap-2.5 p-4 bg-[#fbfbfb]">
                        <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px]">
                          Role
                        </div>
                      </div>
                      {displayedMembers.map((member, i) => (
                        <div
                          key={i}
                          className="flex h-[55px] items-center gap-2.5 p-4 bg-white border-b border-[#f4f4f4]"
                        >
                          <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px] truncate">
                            {member.role}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Status col */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex h-[55px] items-center gap-2.5 p-4 bg-[#fbfbfb]">
                        <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px]">
                          Status
                        </div>
                      </div>
                      {displayedMembers.map((member, i) => {
                        const s = getStatusStyles(member.status);
                        return (
                          <div
                            key={i}
                            className="flex h-[55px] items-center gap-2.5 p-4 bg-white border-b border-[#f4f4f4]"
                          >
                            <div
                              className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 ${s.bgColor} rounded-[999px]`}
                            >
                              <div
                                className={`w-1.5 h-1.5 ${s.dotColor} rounded-[3px]`}
                              />
                              <div
                                className={`[font-family:'Archivo',Helvetica] font-normal ${s.textColor} text-sm`}
                              >
                                {member.status}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Actions col */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex h-[55px] items-center gap-2.5 p-4 bg-[#fbfbfb]">
                        <div className="[font-family:'Archivo',Helvetica] font-normal text-primitives-neutral-dark-dark-300 text-base tracking-[-0.48px]">
                          Actions
                        </div>
                      </div>
                      {displayedMembers.map((member, i) => (
                        <div
                          key={i}
                          className="flex h-[55px] items-center gap-2.5 p-4 bg-white border-b border-[#f4f4f4]"
                        >
                          <div className="inline-flex items-center gap-2.5">
                            <button
                              className="inline-flex h-8 items-center justify-center gap-2.5 p-3 bg-primitives-neutral-neutral-300 rounded-lg border border-solid border-primitives-neutral-neutral-600 shadow-[0px_2px_0px_#dcdcdc]"
                              onClick={() => {
                                setEditingMember(member);
                                setShowEditMember(true);
                              }}
                              type="button"
                            >
                              <span className="[font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs">
                                {member.actions[0]}
                              </span>
                            </button>
                            <button
                              className="inline-flex h-8 items-center justify-center gap-2.5 p-3 bg-[#fff4f4] rounded-lg border border-solid border-primitives-red-red-100 shadow-[0px_2px_0px_#ffb8b8]"
                              onClick={() =>
                                startRemove(member.id, member.name)
                              }
                              disabled={removingId === member.id}
                              type="button"
                            >
                              <span className="[font-family:'Archivo',Helvetica] font-medium text-primitives-neutral-neutral-1000 text-xs">
                                {removingId === member.id
                                  ? "Removing..."
                                  : member.actions[1]}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Mobile Cards ── */}
                <div className="flex md:hidden flex-col w-full min-w-0 box-border">
                  {displayedMembers.map((member, index) => {
                    const s = getStatusStyles(member.status);
                    return (
                      <div
                        key={index}
                        className="flex flex-col w-full min-w-0 border-b border-[#f0f0f0] last:border-b-0 py-4 box-border"
                      >
                        {/* Name row */}
                        <div className="flex items-center justify-between mb-3 min-w-0">
                          <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-[15px] leading-[22px] truncate flex-1 min-w-0 pr-2">
                            {member.name}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d9d9d9] flex-shrink-0" />
                        </div>

                        {/* Role row */}
                        <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4] min-w-0">
                          <span className="[font-family:'Archivo',Helvetica] font-normal text-[#666666] text-sm flex-shrink-0">
                            Role
                          </span>
                          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d9d9d9] flex-shrink-0" />
                            <span className="[font-family:'Archivo',Helvetica] font-medium text-[#1a1a1a] text-sm truncate">
                              {member.role}
                            </span>
                          </div>
                        </div>

                        {/* Status row */}
                        <div className="flex items-center justify-between py-2 border-t border-[#f4f4f4]">
                          <span className="[font-family:'Archivo',Helvetica] font-normal text-[#666666] text-sm flex-shrink-0">
                            Status
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d9d9d9]" />
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`}
                              />
                              <span
                                className={`[font-family:'Archivo',Helvetica] font-normal ${s.textColor} text-sm`}
                              >
                                {member.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-3 min-w-0 box-border">
                          <button
                            className="flex-1 min-w-0 flex items-center justify-center py-2.5 bg-white rounded-xl border border-solid border-[#e5e5e5] shadow-sm"
                            onClick={() => {
                              setEditingMember(member);
                              setShowEditMember(true);
                            }}
                            type="button"
                          >
                            <span className="[font-family:'Archivo',Helvetica] font-normal text-[#1a1a1a] text-sm">
                              {member.actions[0]}
                            </span>
                          </button>
                          <button
                            className="flex-1 min-w-0 flex items-center justify-center py-2.5 bg-[#fff4f4] rounded-xl border border-solid border-[#ffb8b8]"
                            onClick={() => startRemove(member.id, member.name)}
                            disabled={removingId === member.id}
                            type="button"
                          >
                            <span className="[font-family:'Archivo',Helvetica] font-normal text-[#cc0e0e] text-sm">
                              {removingId === member.id
                                ? "Removing..."
                                : member.actions[1]}
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
        </div>

        {/* Slide panels & modals */}
        {showNewMember && (
          <SlidePanel
            open={showNewMember}
            onClose={() => setShowNewMember(false)}
          >
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
                    } catch (_) {}
                  }}
                />
              </div>
            </div>
          </SlidePanel>
        )}

        {showEditMember && editingMember && (
          <SlidePanel
            open={showEditMember}
            onClose={() => setShowEditMember(false)}
          >
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
                        ? (BusinessRoleEnum[
                            editingMember.role as keyof typeof BusinessRoleEnum
                          ] ?? "")
                        : (editingMember.role as any),
                    note: "",
                  }}
                  onClose={() => setShowEditMember(false)}
                  onSave={async (data: MemberFormData) => {
                    try {
                      await refreshTeamMembers();
                    } catch (_) {
                      const roleString =
                        typeof data.role === "number"
                          ? (BusinessRoleEnum[data.role as number] as string) ||
                            "Member"
                          : (data.role as string) || "Member";
                      setTeamMembers((prev) =>
                        prev.map((m) =>
                          m.id === editingMember.id
                            ? { ...m, name: data.fullName, role: roleString }
                            : m,
                        ),
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
