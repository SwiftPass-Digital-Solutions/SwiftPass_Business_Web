import { APP_PATHS } from "@/constants";
import {
  BookOpen,
  ChartNoAxesCombined,
  LayoutDashboard,
  Settings,
  TagIcon,
  Users,
} from "lucide-react";

export const dashboardNavigation = [
  {
    title: "Dashboard",
    url: APP_PATHS.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Tickets",
    url: APP_PATHS.TICKETS,
    icon: TagIcon,
  },
  {
    title: "Customers",
    url: APP_PATHS.CUSTOMERS,
    icon: Users,
  },

  {
    title: "Knowledge Base",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "Reports",
    url: "#",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
