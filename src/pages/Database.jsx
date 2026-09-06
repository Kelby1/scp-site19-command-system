import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { scpService } from "../services/scp/scpService";
import { useAuth } from "../context/AuthContext";

import DeleteSCPModal from "../components/scp/DeleteSCPModal";

import "../styles/scpManagement.css";

function Database() {
  const navigate =
    useNavigate();

  const { profile } =
    useAuth();

  const [scpData, setScpData] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedClass,
    setSelectedClass,
  ] = useState("ALL");

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    deleteRecord,
    setDeleteRecord,
  ] = useState(null);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    mutationMessage,
    setMutationMessage,
  ] = useState(null);

  const databaseRequestRef =
    useRef(0);

  const isAdmin =
    profile?.role === "ADMIN" &&
    profile?.accountStatus ===
      "ACTIVE";

  const adminClearance =
    Number(
      profile?.clearanceLevel ?? 0
    );

  /*
   * =========================
   * LOAD SCP DATABASE
   * =========================
   */

  async function loadSCPs() {
    const requestId =
      ++databaseRequestRef.current;

    setIsLoading(true);
    setErrorMessage("");

    const {
      data,
      error,
    } = await scpService.getAll();

    if (
      requestId !==
      databaseRequestRef.current
    ) {
      console.log(
        `[DATABASE] STALE RESPONSE IGNORED: ${requestId}`
      );

      return;
    }

    if (error) {
      console.error(
        "[DATABASE][LOAD]",
        error
      );

      setScpData([]);

      setErrorMessage(
        "DATABASE CONNECTION FAILURE"
      );

      setIsLoading(false);

      return;
    }

    setScpData(
      data ?? []
    );

    setIsLoading(false);
  }

  useEffect(() => {
    loadSCPs();

    return () => {
      databaseRequestRef.current += 1;
    };
  }, []);

  /*
   * =========================
   * DELETE TERMINATION FLOW
   * =========================
   */

  function requestDelete(scp) {
    if (!isAdmin) {
      return;
    }

    setMutationMessage(null);
    setDeleteError("");

    setDeleteRecord(scp);
  }

  function cancelDelete() {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setDeleteRecord(null);
  }

  async function handleDelete() {
    if (
      !isAdmin ||
      !deleteRecord ||
      isDeleting
    ) {
      return;
    }

    const recordId =
      deleteRecord.id;

    setIsDeleting(true);
    setDeleteError("");
    setMutationMessage(null);

    const {
      error,
    } = await scpService.delete(
      recordId
    );

    if (error) {
      console.error(
        "[SCP DELETE]",
        error
      );

      setDeleteError(
        error?.message ??
          "DATABASE TERMINATION REQUEST FAILED."
      );

      setIsDeleting(false);

      return;
    }

    /*
     * Close termination interface only
     * after PostgreSQL confirms deletion.
     */
    setDeleteRecord(null);

    await loadSCPs();

    setMutationMessage({
      type: "success",

      text:
        `${recordId} TERMINATED FROM FOUNDATION DATABASE.`,
    });

    setIsDeleting(false);
  }

  /*
   * =========================
   * SEARCH / FILTER
   * =========================
   */

  const filteredSCPs =
    scpData.filter((scp) => {
      const id =
        scp?.id ?? "";

      const name =
        scp?.name ?? "";

      const objectClass =
        scp?.objectClass ?? "";

      const term =
        searchTerm
          .trim()
          .toLowerCase();

      const matchesSearch =
        id
          .toLowerCase()
          .includes(term) ||
        name
          .toLowerCase()
          .includes(term) ||
        objectClass
          .toLowerCase()
          .includes(term);

      const matchesClass =
        selectedClass === "ALL" ||
        objectClass.toUpperCase() ===
          selectedClass.toUpperCase();

      return (
        matchesSearch &&
        matchesClass
      );
    });

  return (
    <>
      <section className="scp-database">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="page-heading">

          <div>
            <p className="page-heading__eyebrow">
              SITE-19 // CLASSIFIED ARCHIVES
            </p>

            <h2>
              SCP DATABASE
            </h2>
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

        {/* =========================
            ADMIN MANAGEMENT
        ========================= */}

        {isAdmin && (
          <section className="scp-admin-panel">

            <div className="scp-admin-panel__header">

              <div>
                <p>
                  SITE-19 // DATABASE AUTHORITY
                </p>

                <h3>
                  SCP RECORD MANAGEMENT
                </h3>

                <span>
                  ADMIN CLEARANCE LEVEL{" "}
                  {adminClearance}
                </span>
              </div>

              <button
                type="button"
                className="scp-admin-button"
                onClick={() =>
                  navigate(
                    "/database/create"
                  )
                }
              >
                + CREATE SCP RECORD
              </button>

            </div>

            {mutationMessage && (
              <div
                className={`scp-admin-message scp-admin-message--${mutationMessage.type}`}
              >
                {mutationMessage.text}
              </div>
            )}

          </section>
        )}

        {/* =========================
            SEARCH / FILTER
        ========================= */}

        <div className="database-controls">

          <input
            type="text"
            placeholder="SEARCH SCP RECORDS..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          <select
            value={selectedClass}
            onChange={(event) =>
              setSelectedClass(
                event.target.value
              )
            }
          >
            <option value="ALL">
              ALL CLASSES
            </option>

            <option value="SAFE">
              SAFE
            </option>

            <option value="EUCLID">
              EUCLID
            </option>

            <option value="KETER">
              KETER
            </option>
          </select>

        </div>

        {/* =========================
            SCP RECORDS
        ========================= */}

        <div className="scp-grid">

          {isLoading && (
            <div className="database-loading">

              <span>
                ACCESSING FOUNDATION DATABASE...
              </span>

              <p>
                RETRIEVING CLASSIFIED RECORDS
              </p>

            </div>
          )}

          {!isLoading &&
            errorMessage && (
              <div className="database-error">

                <strong>
                  ⚠ {errorMessage}
                </strong>

                <p>
                  Unable to retrieve
                  containment records.
                </p>

                <button
                  type="button"
                  className="database-retry"
                  onClick={loadSCPs}
                >
                  RETRY CONNECTION
                </button>

              </div>
            )}

          {!isLoading &&
            !errorMessage &&
            filteredSCPs.map(
              (scp) => (
                <article
                  key={scp.id}
                  className="scp-card"
                >

                  <div className="scp-card__header">

                    <span>
                      {scp.id}
                    </span>

                    <span
                      className={`class-${(
                        scp.objectClass ??
                        ""
                      ).toLowerCase()}`}
                    >
                      {scp.objectClass}
                    </span>

                  </div>

                  <h3>
                    {scp.name}
                  </h3>

                  <p>
                    {scp.description}
                  </p>

                  <div className="scp-card__details">

                    <span>
                      THREAT:{" "}
                      <strong>
                        {scp.threatLevel}
                      </strong>
                    </span>

                    <span>
                      STATUS:{" "}
                      <strong>
                        {scp.status}
                      </strong>
                    </span>

                    <span>
                      CLEARANCE:{" "}
                      <strong>
                        LEVEL{" "}
                        {
                          scp.clearanceLevel
                        }
                      </strong>
                    </span>

                  </div>

                  <div className="scp-card__actions">

                    <Link
                      to={`/database/${scp.id}`}
                      className="scp-card__button"
                    >
                      ACCESS FILE
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to={`/database/${scp.id}/edit`}
                          className="scp-card__admin-button"
                        >
                          EDIT RECORD
                        </Link>

                        <button
                          type="button"
                          className="scp-card__admin-button scp-card__admin-button--danger"
                          onClick={() =>
                            requestDelete(
                              scp
                            )
                          }
                        >
                          DELETE RECORD
                        </button>
                      </>
                    )}

                  </div>

                </article>
              )
            )}

        </div>

        {!isLoading &&
          !errorMessage &&
          filteredSCPs.length === 0 && (
            <div className="database-empty">
              NO RECORDS AVAILABLE
              WITHIN CURRENT SEARCH OR
              CLEARANCE PARAMETERS.
            </div>
          )}

      </section>

      {/* =========================
          RECORD TERMINATION MODAL
      ========================= */}

      <DeleteSCPModal
        record={deleteRecord}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default Database;