import { endpoints } from "@/constants";
import { getAuthHeaders } from "@/utils/api";

export interface TeamMemberApi {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roleDisplay: string;
  isActive: boolean;
  status: string;
  invitedAt: string;
  dateUpdated: string;
  isEmailConfirmed: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  actions: string[];
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const { headers, credentials } = getAuthHeaders();

  const res = await fetch(endpoints.business.team, {
    method: "GET",
    headers,
    credentials,
  });

  if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);

  const json = await res.json();
  const data: TeamMemberApi[] = json?.data ?? [];

  return data.map((d) => ({
    id: d.id,
    name: d.fullName && d.fullName.trim().length > 0 ? d.fullName : d.email,
    email: d.email,
    role: d.roleDisplay || d.role || "Member",
    status: d.status || (d.isActive ? "Active" : "Inactive"),
    actions: ["Edit", "Remove"],
  }));
};

export const deleteTeamMember = async (memberId: number | string): Promise<void> => {
  const { headers, credentials } = getAuthHeaders();
  const url = `${endpoints.business.team}/${memberId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers,
    credentials,
  });

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) errMsg = body.message;
    } catch (_e) {}
    throw new Error(errMsg);
  }
};
