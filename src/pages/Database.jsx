import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { scpService } from "../services/scp/scpService";


function Database() {
  const [scpData, setScpData] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [selectedClass, setSelectedClass] = useState("ALL");
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");

const databaseRequestIdRef = useRef(0);

async function loadSCPs() {
  const requestId = ++databaseRequestIdRef.current;

  setIsLoading(true);
  setErrorMessage("");

  const { data, error } = await scpService.getAll();

  // A newer request has already started.
  // Ignore this older response.
  if (requestId !== databaseRequestIdRef.current) {
    console.log(
      `[DATABASE] Ignoring stale request ${requestId}`
    );

    return;
  }

  if (error) {
    console.error(
      `[DATABASE][${error?.requestId ?? "UNKNOWN"}]`,
      error
    );

    setScpData([]);
    setErrorMessage("DATABASE CONNECTION FAILURE");
  } else {
    setScpData(data || []);
  }

  setIsLoading(false);
}

  useEffect(() => {
  loadSCPs();

  return () => {
    databaseRequestIdRef.current++;
  };
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

        <span
  className={`page-heading__status ${
    isLoading
      ? "status-connecting"
      : errorMessage
      ? "status-offline"
      : "status-online"
  }`}
>
  {isLoading
    ? "● DATABASE CONNECTING"
    : errorMessage
    ? "● DATABASE OFFLINE"
    : "● DATABASE ONLINE"}
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

    <button
      type="button"
      onClick={loadSCPs}
      className="database-retry"
    >
      RETRY CONNECTION
    </button>
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