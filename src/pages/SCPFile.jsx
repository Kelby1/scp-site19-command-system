import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { scpService } from "../services/scp/scpService";

function SCPFile() {
  const { scpId } = useParams();

  const [scp, setScp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const scpRequestIdRef = useRef(0);

  async function loadSCP() {
  const requestId = ++scpRequestIdRef.current;

  setIsLoading(true);
  setErrorMessage("");

  const { data, error } = await scpService.getById(scpId);

  if (requestId !== scpRequestIdRef.current) {
    console.log(
      `[SCP FILE] Ignoring stale request ${requestId}`
    );

    return;
  }

  if (error) {
    console.error(
      `[SCP FILE][${error?.requestId ?? "UNKNOWN"}]`,
      error
    );

    setScp(null);
    setErrorMessage("CLASSIFIED RECORD UNAVAILABLE");
  } else {
    setScp(data);
  }

  setIsLoading(false);
}

  useEffect(() => {
  loadSCP();

  return () => {
    scpRequestIdRef.current++;
  };
}, [scpId]);

  if (isLoading) {
    return (
      <section className="classified-file">
        <h2>ACCESSING CLASSIFIED RECORD...</h2>
        <p>VERIFYING FOUNDATION DATABASE ACCESS.</p>
      </section>
    );
  }

  if (errorMessage || !scp) {
    return (
      <section className="classified-file">
        <div className="classified-warning">
          <h2>ACCESS FAILURE</h2>

          <p>{errorMessage || "RECORD NOT FOUND"}</p>

          <button
            type="button"
            onClick={loadSCP}
            className="database-retry"
          >
            RETRY ACCESS
          </button>

          <Link to="/database" className="classified-back">
            RETURN TO DATABASE
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="classified-file">
      <div className="classified-header">
        <div>
          <p className="page-heading__eyebrow">
            SCP FOUNDATION // CLASSIFIED RECORD
          </p>

          <h2>{scp.id}</h2>
        </div>

        <span className="classified-level">
          CLEARANCE LEVEL {scp.clearanceLevel}
        </span>
      </div>

      <div className="classified-banner">
        <span>SECURE CONTAINMENT FOUNDATION</span>
        <strong>AUTHORIZED PERSONNEL ONLY</strong>
      </div>

      <div className="classified-grid">
        <div className="classified-field">
          <span>ITEM NUMBER</span>
          <strong>{scp.id}</strong>
        </div>

        <div className="classified-field">
          <span>OBJECT CLASS</span>
          <strong>{scp.objectClass}</strong>
        </div>

        <div className="classified-field">
          <span>THREAT LEVEL</span>
          <strong>{scp.threatLevel}</strong>
        </div>

        <div className="classified-field">
          <span>CONTAINMENT STATUS</span>
          <strong>{scp.status}</strong>
        </div>
      </div>

      <article className="classified-section">
        <div className="classified-section__title">
          SPECIAL CONTAINMENT PROCEDURES
        </div>

        <p>
          SCP Foundation containment protocols for this
          object are restricted to authorized personnel.
          Additional procedures may require elevated
          clearance.
        </p>

        <div className="redacted-line">
          █████████████████████████████████████████████
        </div>

        <div className="redacted-line">
          █████████████████████████████████████████████
        </div>
      </article>

      <article className="classified-section">
        <div className="classified-section__title">
          DESCRIPTION
        </div>

        <p>{scp.description}</p>
      </article>

      <article className="classified-section">
        <div className="classified-section__title">
          SECURITY NOTICE
        </div>

        <p>
          Unauthorized duplication, transmission, or
          distribution of this document is prohibited.
        </p>
      </article>

      <Link to="/database" className="classified-back">
        ← RETURN TO SCP DATABASE
      </Link>
    </section>
  );
}

export default SCPFile;