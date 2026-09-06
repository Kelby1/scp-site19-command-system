import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { adminService } from "../services/admin/adminServices.jsx";
import { useAuth } from "../context/AuthContext";

import "../styles/adminControl.css";

function Admin() {
  const {
    profile: currentProfile,
  } = useAuth();

  const [
    personnel,
    setPersonnel,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState(null);

  const [
    drafts,
    setDrafts,
  ] = useState({});

  /*
   * =========================
   * LOAD PERSONNEL
   * =========================
   */

  async function loadPersonnel() {
    setIsLoading(true);
    setErrorMessage("");

    const {
      data,
      error,
    } =
      await adminService.getPersonnel();

    if (error) {
      console.error(
        "[ADMIN][LOAD PERSONNEL]",
        error
      );

      setErrorMessage(
        "FAILED TO LOAD PERSONNEL RECORDS."
      );

      setIsLoading(false);

      return;
    }

    setPersonnel(
      data ?? []
    );

    setDrafts({});

    setIsLoading(false);
  }

  useEffect(() => {
    loadPersonnel();
  }, []);

  /*
   * =========================
   * PERSONNEL SUMMARY
   * =========================
   */

  const summary =
    useMemo(() => {
      return personnel.reduce(
        (result, person) => {
          result.total += 1;

          if (
            person.accountStatus ===
            "ACTIVE"
          ) {
            result.active += 1;
          }

          if (
            person.accountStatus ===
            "PENDING"
          ) {
            result.pending += 1;
          }

          if (
            person.accountStatus ===
            "SUSPENDED"
          ) {
            result.suspended += 1;
          }

          return result;
        },
        {
          total: 0,
          active: 0,
          pending: 0,
          suspended: 0,
        }
      );
    }, [personnel]);

  /*
   * =========================
   * DRAFT MANAGEMENT
   * =========================
   */

  function getDraft(person) {
    const draft =
      drafts[person.userId];

    return {
      accountStatus:
        draft?.accountStatus ??
        person.accountStatus,

      role:
        draft?.role ??
        person.role,

      clearanceLevel:
        draft?.clearanceLevel ??
        person.clearanceLevel,
    };
  }

  function updateDraft(
    person,
    field,
    value
  ) {
    setDrafts(
      (current) => {
        const existingDraft =
          current[person.userId];

        return {
          ...current,

          [person.userId]: {
            accountStatus:
              existingDraft
                ?.accountStatus ??
              person.accountStatus,

            role:
              existingDraft
                ?.role ??
              person.role,

            clearanceLevel:
              existingDraft
                ?.clearanceLevel ??
              person.clearanceLevel,

            [field]:
              value,
          },
        };
      }
    );
  }

  /*
   * =========================
   * APPROVE PERSONNEL
   * =========================
   */

  async function handleApprove(
    person
  ) {
    const draft =
      getDraft(person);

    setUpdatingUserId(
      person.userId
    );

    setErrorMessage("");
    setSuccessMessage("");

    const {
      data,
      error,
    } =
      await adminService.updatePersonnel(
        person.userId,
        {
          accountStatus:
            "ACTIVE",

          role:
            draft.role,

          clearanceLevel:
            Number(
              draft.clearanceLevel
            ),
        }
      );

    if (error) {
      console.error(
        "[ADMIN][APPROVE]",
        error
      );

      setErrorMessage(
        `FAILED TO APPROVE ${
          person.displayName ??
          "PERSONNEL"
        }.`
      );

      setUpdatingUserId(null);

      return;
    }

    console.log(
      "[ADMIN][APPROVED]",
      data
    );

    setSuccessMessage(
      `${
        person.displayName ??
        "PERSONNEL"
      } APPROVED.`
    );

    await loadPersonnel();

    setUpdatingUserId(null);
  }

  /*
   * =========================
   * SAVE AUTHORIZATION
   * =========================
   */

  async function
    handleSaveAuthorization(
      person
    ) {
    const draft =
      getDraft(person);

    setUpdatingUserId(
      person.userId
    );

    setErrorMessage("");
    setSuccessMessage("");

    const {
      data,
      error,
    } =
      await adminService.updatePersonnel(
        person.userId,
        {
          accountStatus:
            draft.accountStatus,

          role:
            draft.role,

          clearanceLevel:
            Number(
              draft.clearanceLevel
            ),
        }
      );

    if (error) {
      console.error(
        "[ADMIN][UPDATE AUTHORIZATION]",
        error
      );

      setErrorMessage(
        `FAILED TO UPDATE ${
          person.displayName ??
          "PERSONNEL"
        }.`
      );

      setUpdatingUserId(null);

      return;
    }

    console.log(
      "[ADMIN][AUTHORIZATION UPDATED]",
      data
    );

    setSuccessMessage(
      `${
        person.displayName ??
        "PERSONNEL"
      } AUTHORIZATION UPDATED.`
    );

    await loadPersonnel();

    setUpdatingUserId(null);
  }

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <section className="admin-control">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">

        <div>
          <p className="page-heading__eyebrow">
            SITE-19 // ADMINISTRATION
          </p>

          <h2>
            ADMIN CONTROL PANEL
          </h2>

          <p className="admin-control__description">
            Personnel authorization,
            account status, role, and
            clearance management.
          </p>
        </div>

        <span className="page-heading__status status-online">
          ● AUTHORITY VERIFIED
        </span>

      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <section className="admin-summary">

        <div>
          <span>
            PERSONNEL RECORDS
          </span>

          <strong>
            {summary.total}
          </strong>
        </div>

        <div>
          <span>
            ACTIVE
          </span>

          <strong>
            {summary.active}
          </strong>
        </div>

        <div>
          <span>
            PENDING
          </span>

          <strong>
            {summary.pending}
          </strong>
        </div>

        <div>
          <span>
            SUSPENDED
          </span>

          <strong>
            {summary.suspended}
          </strong>
        </div>

      </section>

      {/* =========================
          SYSTEM MESSAGES
      ========================= */}

      {errorMessage && (
        <div className="admin-message admin-message--error">
          <strong>
            ⚠ AUTHORIZATION ERROR
          </strong>

          <span>
            {errorMessage}
          </span>
        </div>
      )}

      {successMessage && (
        <div className="admin-message admin-message--success">
          <strong>
            AUTHORIZATION UPDATED
          </strong>

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {isLoading && (
        <div className="admin-state-panel">

          <strong>
            ACCESSING PERSONNEL
            AUTHORIZATION DATABASE...
          </strong>

          <span>
            VERIFYING ADMINISTRATIVE
            CLEARANCE
          </span>

        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}

      {!isLoading &&
        !errorMessage &&
        personnel.length === 0 && (
          <div className="admin-state-panel">
            NO PERSONNEL RECORDS
            FOUND.
          </div>
        )}

      {/* =========================
          PERSONNEL RECORDS
      ========================= */}

      {!isLoading && (
        <div className="admin-personnel-list">

          {personnel.map(
            (person) => {
              const draft =
                getDraft(person);

              const isPending =
                person.accountStatus ===
                "PENDING";

              const isUpdating =
                updatingUserId ===
                person.userId;

              const isCurrentUser =
                currentProfile?.userId ===
                person.userId;

              return (
                <article
                  key={person.userId}
                  className="admin-personnel-card"
                >

                  {/* =====================
                      PERSONNEL HEADER
                  ===================== */}

                  <header className="admin-personnel-card__header">

                    <div>
                      <span className="admin-personnel-card__eyebrow">
                        PERSONNEL AUTHORIZATION
                        RECORD
                      </span>

                      <h3>
                        {person.displayName ??
                          "UNKNOWN PERSONNEL"}
                      </h3>
                    </div>

                    <div className="admin-personnel-card__badges">

                      {isCurrentUser && (
                        <span className="admin-badge admin-badge--session">
                          CURRENT SESSION
                        </span>
                      )}

                      <span
                        className={`admin-badge admin-badge--${String(
                          person.accountStatus
                        ).toLowerCase()}`}
                      >
                        {
                          person.accountStatus
                        }
                      </span>

                    </div>

                  </header>

                  {/* =====================
                      CURRENT AUTHORITY
                  ===================== */}

                  <div className="admin-personnel-meta">

                    <div>
                      <span>
                        CURRENT ROLE
                      </span>

                      <strong>
                        {person.role}
                      </strong>
                    </div>

                    <div>
                      <span>
                        ACCOUNT STATUS
                      </span>

                      <strong>
                        {
                          person.accountStatus
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        CLEARANCE
                      </span>

                      <strong>
                        LEVEL{" "}
                        {
                          person.clearanceLevel
                        }
                      </strong>
                    </div>

                  </div>

                  {/* =====================
                      AUTHORIZATION CONTROLS
                  ===================== */}

                  <section className="admin-personnel-controls">

                    <div className="admin-personnel-controls__heading">

                      <div>
                        <span>
                          SITE-19 //
                          AUTHORIZATION CHANGE
                        </span>

                        <strong>
                          MODIFY ACCESS PROFILE
                        </strong>
                      </div>

                      {isCurrentUser && (
                        <small>
                          ROLE AND STATUS ARE
                          LOCKED FOR THE CURRENT
                          ADMIN SESSION.
                        </small>
                      )}

                    </div>

                    <div className="admin-personnel-controls__grid">

                      {!isPending && (
                        <label>
                          <span>
                            ACCOUNT STATUS
                          </span>

                          <select
                            value={
                              draft.accountStatus
                            }
                            disabled={
                              isUpdating ||
                              isCurrentUser
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft(
                                person,
                                "accountStatus",
                                event.target
                                  .value
                              )
                            }
                          >
                            <option value="ACTIVE">
                              ACTIVE
                            </option>

                            <option value="SUSPENDED">
                              SUSPENDED
                            </option>
                          </select>
                        </label>
                      )}

                      <label>
                        <span>
                          ROLE
                        </span>

                        <select
                          value={
                            draft.role
                          }
                          disabled={
                            isUpdating ||
                            isCurrentUser
                          }
                          onChange={(
                            event
                          ) =>
                            updateDraft(
                              person,
                              "role",
                              event.target
                                .value
                            )
                          }
                        >
                          <option value="PERSONNEL">
                            PERSONNEL
                          </option>

                          <option value="ADMIN">
                            ADMIN
                          </option>
                        </select>
                      </label>

                      <label>
                        <span>
                          CLEARANCE LEVEL
                        </span>

                        <select
                          value={
                            draft.clearanceLevel
                          }
                          disabled={
                            isUpdating
                          }
                          onChange={(
                            event
                          ) =>
                            updateDraft(
                              person,
                              "clearanceLevel",
                              Number(
                                event.target
                                  .value
                              )
                            )
                          }
                        >
                          <option value={0}>
                            LEVEL 0
                          </option>

                          <option value={1}>
                            LEVEL 1
                          </option>

                          <option value={2}>
                            LEVEL 2
                          </option>

                          <option value={3}>
                            LEVEL 3
                          </option>

                          <option value={4}>
                            LEVEL 4
                          </option>

                          <option value={5}>
                            LEVEL 5
                          </option>
                        </select>
                      </label>

                    </div>

                    <div className="admin-personnel-controls__actions">

                      {isPending ? (
                        <button
                          type="button"
                          className="admin-action-button admin-action-button--approve"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            handleApprove(
                              person
                            )
                          }
                        >
                          {isUpdating
                            ? "APPROVING..."
                            : "APPROVE PERSONNEL"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-action-button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            handleSaveAuthorization(
                              person
                            )
                          }
                        >
                          {isUpdating
                            ? "SAVING AUTHORIZATION..."
                            : "SAVE AUTHORIZATION"}
                        </button>
                      )}

                    </div>

                  </section>

                </article>
              );
            }
          )}

        </div>
      )}

    </section>
  );
}

export default Admin;