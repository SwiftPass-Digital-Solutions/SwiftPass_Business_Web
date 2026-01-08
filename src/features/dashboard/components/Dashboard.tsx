import { APis, Card, Customer } from "@/assets/pngs";
import { PageLoader, StatsCard } from "@/components";
import { useDashboardStatus } from "@/hooks";
import { useMemo } from "react";

const statsData = [
  { title: "Credits Balance", value: "1,200", icon: Card },
  { title: "Customers Onboarded", value: "1,200", icon: Customer },
  { title: "API Calls (Last 24 hrs)", value: "1,200", icon: APis },
];

const Dashboard = () => {
  const { dashboardData, loading } = useDashboardStatus();
  const dashboardStatus = useMemo(() => dashboardData || null, [dashboardData]);
  console.log(dashboardStatus);

  return (
    <>
      {loading && <PageLoader />}
      <div className="font-archivo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {statsData?.map((stat) => (
            <StatsCard
              title={stat?.title}
              value={stat?.value}
              icon={
                <img
                  src={stat?.icon}
                  alt="credits"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              }
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
