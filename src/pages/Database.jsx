import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { scpService } from "../services/scp/scpService";


function Database() {
  const [scpData, setScpData] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [selectedClass, setSelectedClass] = useState("ALL");
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");

useEffect(() => {
  async function loadSCPs() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await scpService.getAll();
    

    if (error) {
      console.error("Failed to load SCP records:", error);
      setErrorMessage("DATABASE CONNECTION FAILURE");
      setScpData([]);
    } else {
      setScpData(data || []);
    }

    setIsLoading(false);
  }

  loadSCPs();
}, []);

  const filteredSCPs = scpData.filter((scp) => {
    const scpId = scp?.id || "";
    const scpName = scp?.name || "";
    const scpClass = scp?.objectClass || "";

    const term = searchTerm.toLowerCase();

    const matchesSearch =
      scpId.toLowerCase().includes(term) ||
      scpName.toLowerCase().includes(term) ||
      scpClass.toLowerCase().includes(term);

    const matchesClass =
      selectedClass === "ALL" ||
      scpClass.toUpperCase() === selectedClass.toUpperCase();

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
  {isLoading && (
    <div className="database-loading">
      <span>ACCESSING FOUNDATION DATABASE...</span>
      <p>RETRIEVING CLASSIFIED RECORDS</p>
    </div>
  )}

  {!isLoading && errorMessage && (
    <div className="database-error">
      <strong>⚠ {errorMessage}</strong>
      <p>
        Unable to retrieve containment records.
        Check the Foundation data connection.
      </p>
    </div>
  )}

  {!isLoading && !errorMessage &&
    filteredSCPs.map((scp) => (
      <article className="scp-card" key={scp.id}>
        <div className="scp-card__header">
          <span>{scp.id}</span>

          <span className={`class-${(scp.objectClass || "").toLowerCase()}`}>
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
            CLEARANCE:
            <strong> LEVEL {scp.clearanceLevel}</strong>
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

      {!isLoading &&
  !errorMessage &&
  filteredSCPs.length === 0 && (
    <div className="database-empty">
      NO MATCHING RECORDS FOUND.
    </div>
)}
      
    </section>
  );
}

export default Database;