import StatusCard from "../components/dashboard/StatusCard";
import SystemStatus from "../components/dashboard/SystemStatus";
import ActivityLog from "../components/dashboard/ActivityLog";
import ActiveAlerts from "../components/dashboard/ActiveAlerts";

function Dashboard() {
  return (
    <section className="command-center">
      <div className="page-heading">
        <div>
          <p className="page-heading__eyebrow">
            SITE-19 // OPERATIONS
          </p>
          <h2>COMMAND CENTER</h2>
        </div>

        <span className="page-heading__status">
          ● LIVE STATUS
        </span>
      </div>

      <div className="status-grid">
        <StatusCard
          label="ACTIVE PERSONNEL"
          value="247"
          status="ON SITE"
        />

        <StatusCard
          label="CONTAINED OBJECTS"
          value="89"
          status="STABLE"
        />

        <StatusCard
          label="ACTIVE ALERTS"
          value="02"
          status="MONITORING"
        />

        <StatusCard
          label="THREAT LEVEL"
          value="ELEVATED"
          status="LEVEL 3"
        />
      </div>

      <div className="dashboard-grid">
        <SystemStatus />
        <ActiveAlerts />
      </div>

      <ActivityLog />
    </section>
  );
}

export default Dashboard;