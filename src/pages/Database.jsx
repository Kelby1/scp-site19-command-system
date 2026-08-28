import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllSCPs } from "../services/scpServices";


function Database() {
  const [scpData, setScpData] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [selectedClass, setSelectedClass] = useState("ALL");

useEffect(() => {
  async function loadSCPs() {
    const data = await getAllSCPs();
    setScpData(data);
  }

  loadSCPs();
}, []);

  const filteredSCPs = scpData.filter((scp) => {
    const matchesSearch =
      scp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scp.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "ALL" ||
      scp.objectClass === selectedClass;

    return matchesSearch && matchesClass;
  });

  return (
    <section className="scp-database">
      <div className="page-heading">
        <div>
          <p className="page-heading__eyebrow">
            SITE-19 // CLASSIFIED ARCHIVES
          </p>

          <h2>SCP DATABASE</h2>
        </div>

        <span className="page-heading__status">
          ● DATABASE ONLINE
        </span>
      </div>

      <div className="database-controls">
        <input
          type="text"
          placeholder="SEARCH SCP RECORDS..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
        >
          <option value="ALL">ALL CLASSES</option>
          <option value="SAFE">SAFE</option>
          <option value="EUCLID">EUCLID</option>
          <option value="KETER">KETER</option>
        </select>
      </div>

      <div className="scp-grid">
        {filteredSCPs.map((scp) => (
          <article className="scp-card" key={scp.id}>
            <div className="scp-card__header">
              <span>{scp.id}</span>

              <span className={`class-${scp.objectClass.toLowerCase()}`}>
                {scp.objectClass}
              </span>
            </div>

            <h3>{scp.name}</h3>

            <p>{scp.description}</p>

            <div className="scp-card__details">
              <span>
                THREAT: <strong>{scp.threatLevel}</strong>
              </span>

              <span>
                STATUS: <strong>{scp.status}</strong>
              </span>

              <span>
                CLEARANCE: <strong>LEVEL {scp.clearanceLevel}</strong>
              </span>
            </div>

            <Link
  to={`/database/${scp.id}`}
  className="scp-card__button"
>
  ACCESS FILE
</Link>
          </article>
        ))}
      </div>

      {filteredSCPs.length === 0 && (
        <div className="database-empty">
          NO MATCHING RECORDS FOUND.
        </div>
      )}
    </section>
  );
}

export default Database;