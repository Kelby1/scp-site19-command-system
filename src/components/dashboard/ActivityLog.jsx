const activities = [
  {
    time: "21:20:14",
    message: "Personnel authentication verified",
    status: "VERIFIED",
  },
  {
    time: "21:18:42",
    message: "Containment monitoring active",
    status: "ACTIVE",
  },
  {
    time: "21:15:09",
    message: "Database synchronization complete",
    status: "COMPLETE",
  },
  {
    time: "21:12:33",
    message: "Sector B anomaly scan initiated",
    status: "MONITORING",
  },
];

function ActivityLog() {
  return (
    <section className="dashboard-panel activity-log">
      <div className="panel-header">
        <h3>SYSTEM ACTIVITY LOG</h3>
        <span>LAST 4 EVENTS</span>
      </div>

      <div className="activity-list">
        {activities.map((activity) => (
          <div className="activity-item" key={activity.time}>
            <span className="activity-item__time">
              [{activity.time}]
            </span>

            <span className="activity-item__message">
              {activity.message}
            </span>

            <strong className="activity-item__status">
              {activity.status}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ActivityLog;