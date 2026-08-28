const systems = [
  { name: "SECURITY GRID", value: 98 },
  { name: "POWER SYSTEM", value: 94 },
  { name: "DATABASE", value: 99 },
];

function SystemStatus() {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <h3>SYSTEM STATUS</h3>
        <span>LIVE MONITORING</span>
      </div>

      <div className="system-list">
        {systems.map((system) => (
          <div className="system-item" key={system.name}>
            <div className="system-item__header">
              <span>{system.name}</span>
              <strong>{system.value}%</strong>
            </div>

            <div className="system-bar">
              <div
                className="system-bar__fill"
                style={{ width: `${system.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SystemStatus;