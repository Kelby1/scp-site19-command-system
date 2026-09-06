import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { auditService } from "../services/audit/auditService";
import { useAuth } from "../context/AuthContext";

import "../styles/auditLog.css";

function AuditLog() {
  const { profile } = useAuth();

  const [auditLogs, setAuditLogs] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    entityFilter,
    setEntityFilter,
  ] = useState("ALL");

  const [
    operationFilter,
    setOperationFilter,
  ] = useState("ALL");

  const [
    expandedLogId,
    setExpandedLogId,
  ] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const requestRef =
    useRef(0);

  const adminClearance =
    Number(
      profile?.clearanceLevel ?? 0
    );

  /*
   * =========================
   * LOAD AUDIT LOG
   * =========================
   */

  async function loadAuditLogs() {
    const localRequestId =
      ++requestRef.current;

    setIsLoading(true);
    setErrorMessage("");

    const {
      data,
      error,
      requestId,
    } = await auditService.getRecent(
      100
    );

    /*
     * Ignore stale UI requests.
     */
    if (
      localRequestId !==
      requestRef.current
    ) {
      console.log(
        `[AUDIT] STALE RESPONSE IGNORED: ${localRequestId}`
      );

      return;
    }

    if (error) {
      console.error(
        `[AUDIT][${
          requestId ??
          "UNKNOWN"
        }]`,
        error
      );

      setAuditLogs([]);

      setErrorMessage(
        "AUDIT DATABASE ACCESS FAILURE"
      );

      setIsLoading(false);

      return;
    }

    setAuditLogs(
      data ?? []
    );

    setIsLoading(false);
  }

  useEffect(() => {
    loadAuditLogs();

    return () => {
      requestRef.current += 1;
    };
  }, []);

  /*
   * =========================
   * HELPERS
   * =========================
   */

  function formatTimestamp(
    timestamp
  ) {
    if (!timestamp) {
      return "UNKNOWN TIME";
    }

    const date =
      new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return timestamp;
    }

    return date.toLocaleString();
  }

  function formatFieldName(
    field
  ) {
    return String(field)
      .replaceAll("_", " ")
      .toUpperCase();
  }

  function formatValue(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    if (
      typeof value ===
      "object"
    ) {
      return JSON.stringify(
        value
      );
    }

    return String(value);
  }

  function getTargetName(log) {
    /*
     * Personnel audit records contain
     * display_name in their snapshots.
     */
    if (
      log.entityType ===
      "PERSONNEL"
    ) {
      return (
        log.afterState
          ?.display_name ??
        log.beforeState
          ?.display_name ??
        log.entityId
      );
    }

    /*
     * SCP entity_id already contains
     * SCP-XXX.
     */
    return log.entityId;
  }

  function getOperationLabel(
    operation
  ) {
    switch (operation) {
      case "INSERT":
        return "CREATED";

      case "UPDATE":
        return "MODIFIED";

      case "DELETE":
        return "DELETED";

      default:
        return operation;
    }
  }

  /*
   * =========================
   * FILTERING
   * =========================
   */

  const filteredLogs =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return auditLogs.filter(
        (log) => {
          const target =
            getTargetName(log);

          const matchesSearch =
            !term ||
            String(
              log.actorDisplayName
            )
              .toLowerCase()
              .includes(term) ||
            String(target)
              .toLowerCase()
              .includes(term) ||
            String(log.entityId)
              .toLowerCase()
              .includes(term) ||
            String(log.operation)
              .toLowerCase()
              .includes(term);

          const matchesEntity =
            entityFilter ===
              "ALL" ||
            log.entityType ===
              entityFilter;

          const matchesOperation =
            operationFilter ===
              "ALL" ||
            log.operation ===
              operationFilter;

          return (
            matchesSearch &&
            matchesEntity &&
            matchesOperation
          );
        }
      );
    }, [
      auditLogs,
      searchTerm,
      entityFilter,
      operationFilter,
    ]);

  return (
    <section className="audit-log">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-heading">

        <div>
          <p className="page-heading__eyebrow">
            SITE-19 // SECURITY OVERSIGHT
          </p>

          <h2>
            AUDIT LOG
          </h2>
        </div>

        <span className="page-heading__status status-online">
          ● ADMIN CLEARANCE{" "}
          {adminClearance}
        </span>

      </div>

      <section className="audit-summary">

        <div>
          <span>
            VISIBLE EVENTS
          </span>

          <strong>
            {auditLogs.length}
          </strong>
        </div>

        <div>
          <span>
            CURRENT FILTER
          </span>

          <strong>
            {filteredLogs.length}
          </strong>
        </div>

        <div>
          <span>
            ACCESS LEVEL
          </span>

          <strong>
            LEVEL{" "}
            {adminClearance}
          </strong>
        </div>

      </section>

      {/* =========================
          CONTROLS
      ========================= */}

      <section className="audit-controls">

        <input
          type="text"
          placeholder="SEARCH ACTOR, SCP, PERSONNEL..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
        />

        <select
          value={entityFilter}
          onChange={(event) =>
            setEntityFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            ALL ENTITIES
          </option>

          <option value="SCP">
            SCP RECORDS
          </option>

          <option value="PERSONNEL">
            PERSONNEL
          </option>
        </select>

        <select
          value={
            operationFilter
          }
          onChange={(event) =>
            setOperationFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            ALL OPERATIONS
          </option>

          <option value="INSERT">
            CREATE
          </option>

          <option value="UPDATE">
            UPDATE
          </option>

          <option value="DELETE">
            DELETE
          </option>
        </select>

        <button
          type="button"
          disabled={isLoading}
          onClick={loadAuditLogs}
        >
          {isLoading
            ? "SYNCING..."
            : "REFRESH LOG"}
        </button>

      </section>

      {/* =========================
          ERROR
      ========================= */}

      {errorMessage && (
        <section className="audit-error">

          <strong>
            ⚠ {errorMessage}
          </strong>

          <p>
            Audit records could not
            be retrieved.
          </p>

          <button
            type="button"
            onClick={
              loadAuditLogs
            }
          >
            RETRY AUDIT ACCESS
          </button>

        </section>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {isLoading &&
        !errorMessage && (
          <section className="audit-loading">

            <strong>
              ACCESSING IMMUTABLE
              SECURITY RECORDS...
            </strong>

            <span>
              VERIFYING CLEARANCE
              AND RETRIEVING EVENTS
            </span>

          </section>
        )}

      {/* =========================
          LOGS
      ========================= */}

      {!isLoading &&
        !errorMessage && (
          <div className="audit-list">

            {filteredLogs.map(
              (log) => {
                const isExpanded =
                  expandedLogId ===
                  log.id;

                const target =
                  getTargetName(
                    log
                  );

                return (
                  <article
                    key={log.id}
                    className="audit-event"
                  >

                    <div className="audit-event__main">

                      <div className="audit-event__timestamp">

                        <span>
                          EVENT #
                          {log.id}
                        </span>

                        <strong>
                          {formatTimestamp(
                            log.createdAt
                          )}
                        </strong>

                      </div>

                      <div className="audit-event__actor">

                        <span>
                          ACTOR
                        </span>

                        <strong>
                          {
                            log.actorDisplayName
                          }
                        </strong>

                        <small>
                          {
                            log.actorRole
                          }
                        </small>

                      </div>

                      <div className="audit-event__target">

                        <span>
                          TARGET
                        </span>

                        <strong>
                          {target}
                        </strong>

                        <small>
                          {
                            log.entityType
                          }
                        </small>

                      </div>

                      <div className="audit-event__operation">

                        <span>
                          ACTION
                        </span>

                        <strong
                          className={`audit-operation audit-operation--${log.operation.toLowerCase()}`}
                        >
                          {getOperationLabel(
                            log.operation
                          )}
                        </strong>

                      </div>

                      <div className="audit-event__clearance">

                        <span>
                          CLASSIFICATION
                        </span>

                        <strong>
                          LEVEL{" "}
                          {
                            log.requiredClearance
                          }
                        </strong>

                      </div>

                      <button
                        type="button"
                        className="audit-event__toggle"
                        onClick={() =>
                          setExpandedLogId(
                            isExpanded
                              ? null
                              : log.id
                          )
                        }
                      >
                        {isExpanded
                          ? "HIDE DETAILS"
                          : "VIEW DETAILS"}
                      </button>

                    </div>

                    {/* =====================
                        EVENT DETAILS
                    ===================== */}

                    {isExpanded && (
                      <div className="audit-event__details">

                        <section>

                          <h3>
                            CHANGED FIELDS
                          </h3>

                          {log.changedFields
                            .length >
                          0 ? (
                            <div className="audit-field-list">

                              {log.changedFields.map(
                                (
                                  field
                                ) => (
                                  <span
                                    key={
                                      field
                                    }
                                  >
                                    {formatFieldName(
                                      field
                                    )}
                                  </span>
                                )
                              )}

                            </div>
                          ) : (
                            <p>
                              NO FIELD
                              METADATA
                              AVAILABLE.
                            </p>
                          )}

                        </section>

                        {log.operation ===
                          "UPDATE" && (
                          <section>

                            <h3>
                              CHANGE COMPARISON
                            </h3>

                            <div className="audit-change-table">

                              {log.changedFields.map(
                                (
                                  field
                                ) => (
                                  <div
                                    key={
                                      field
                                    }
                                    className="audit-change-row"
                                  >

                                    <strong>
                                      {formatFieldName(
                                        field
                                      )}
                                    </strong>

                                    <div>
                                      <span>
                                        BEFORE
                                      </span>

                                      <code>
                                        {formatValue(
                                          log.beforeState?.[
                                            field
                                          ]
                                        )}
                                      </code>
                                    </div>

                                    <div>
                                      <span>
                                        AFTER
                                      </span>

                                      <code>
                                        {formatValue(
                                          log.afterState?.[
                                            field
                                          ]
                                        )}
                                      </code>
                                    </div>

                                  </div>
                                )
                              )}

                            </div>

                          </section>
                        )}

                        {log.operation ===
                          "INSERT" && (
                          <section>

                            <h3>
                              CREATED STATE
                            </h3>

                            <pre>
                              {JSON.stringify(
                                log.afterState,
                                null,
                                2
                              )}
                            </pre>

                          </section>
                        )}

                        {log.operation ===
                          "DELETE" && (
                          <section>

                            <h3>
                              FINAL RECORDED STATE
                            </h3>

                            <pre>
                              {JSON.stringify(
                                log.beforeState,
                                null,
                                2
                              )}
                            </pre>

                          </section>
                        )}

                      </div>
                    )}

                  </article>
                );
              }
            )}

            {filteredLogs.length ===
              0 && (
              <section className="audit-empty">

                <strong>
                  NO AUDIT EVENTS
                  MATCH CURRENT
                  PARAMETERS.
                </strong>

              </section>
            )}

          </div>
        )}

    </section>
  );
}

export default AuditLog;