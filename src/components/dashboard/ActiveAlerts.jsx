const alerts = [
  {
    id: "ALT-019",
    title: "SECTOR B ANOMALOUS ACTIVITY",
    status: "UNDER MONITORING",
  },
  {
    id: "ALT-024",
    title: "CONTAINMENT SENSOR CHECK",
    status: "INVESTIGATION REQUIRED",
  },
];

function ActiveAlerts() {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <h3>ACTIVE ALERTS</h3>
        <span className="alert-count">02 ACTIVE</span>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <article className="alert-item" key={alert.id}>
            <span className="alert-item__id">{alert.id}</span>
            <strong>{alert.title}</strong>
            <span>{alert.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ActiveAlerts;