import {
  ApiCredit,
  Compliance,
  Customers,
  Dashboard,
  // Reports,
  Settings,
} from "@/assets/svgs";
import { APP_PATHS } from "@/constants";

export const dashboardNavigation = [
  {
    title: "Dashboard",
    url: APP_PATHS.DASHBOARD,
    icon: Dashboard,
  },
  {
    title: "Compliance",
    url: APP_PATHS.COMPLIANCE,
    icon: Compliance,
  },
  {
    title: "Customers",
    url: "#",
    icon: Customers,
  },
  {
    title: "API & Credits",
    url: "#",
    icon: ApiCredit,
  },
  // {
  //   title: "Reports",
  //   url: "#",
  //   icon: Reports,
  // },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
