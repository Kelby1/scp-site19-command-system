import { useEffect, useState } from "react";
import { adminService } from "../services/admin/adminServices.jsx";
import { useAuth } from "../context/AuthContext";

function Admin() {
  const { profile: currentProfile } = useAuth();

  const [personnel, setPersonnel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [drafts, setDrafts] = useState({});

  async function loadPersonnel() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await adminService.getPersonnel();

    if (error) {
      console.error("[ADMIN][LOAD PERSONNEL]", error);
      setErrorMessage("FAILED TO LOAD PERSONNEL RECORDS.");
      setIsLoading(false);
      return;
    }

    setPersonnel(data ?? []);
    setDrafts({});
    setIsLoading(false);
  }

  useEffect(() => {
    loadPersonnel();
  }, []);

  function getDraft(person) {
    const draft = drafts[person.userId];

    return {
      accountStatus: draft?.accountStatus ?? person.accountStatus,
      role: draft?.role ?? person.role,
      clearanceLevel: draft?.clearanceLevel ?? person.clearanceLevel,
    };
  }

  function updateDraft(person, field, value) {
    setDrafts((current) => {
      const existingDraft = current[person.userId];

      return {
        ...current,

        [person.userId]: {
          accountStatus:
            existingDraft?.accountStatus ??
            person.accountStatus,

          role:
            existingDraft?.role ??
            person.role,

          clearanceLevel:
            existingDraft?.clearanceLevel ??
            person.clearanceLevel,

          [field]: value,
        },
      };
    });
  }

  async function handleApprove(person) {
    const draft = getDraft(person);

    setUpdatingUserId(person.userId);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await adminService.updatePersonnel(
      person.userId,
      {
        accountStatus: "ACTIVE",
        role: draft.role,
        clearanceLevel: Number(draft.clearanceLevel),
      }
    );

    if (error) {
      console.error("[ADMIN][APPROVE]", error);
      setErrorMessage(
        `FAILED TO APPROVE ${person.displayName ?? "PERSONNEL"}.`
      );
      setUpdatingUserId(null);
      return;
    }

    console.log("[ADMIN][APPROVED]", data);

    setSuccessMessage(
      `${person.displayName ?? "PERSONNEL"} APPROVED.`
    );

    await loadPersonnel();
    setUpdatingUserId(null);
  }

  async function handleSaveAuthorization(person) {
    const draft = getDraft(person);

    setUpdatingUserId(person.userId);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await adminService.updatePersonnel(
      person.userId,
      {
        accountStatus: draft.accountStatus,
        role: draft.role,
        clearanceLevel: Number(draft.clearanceLevel),
      }
    );

    if (error) {
      console.error("[ADMIN][UPDATE AUTHORIZATION]", error);

      setErrorMessage(
        `FAILED TO UPDATE ${person.displayName ?? "PERSONNEL"}.`
      );

      setUpdatingUserId(null);
      return;
    }

    console.log("[ADMIN][AUTHORIZATION UPDATED]", data);

    setSuccessMessage(
      `${person.displayName ?? "PERSONNEL"} AUTHORIZATION UPDATED.`
    );

    await loadPersonnel();
    setUpdatingUserId(null);
  }

  return (
    <section>
      <p className="page-heading__eyebrow">
        SITE-19 // ADMINISTRATION
      </p>

      <h1>ADMIN CONTROL PANEL</h1>

      <p>
        Personnel authorization, account status, role,
        and clearance management.
      </p>

      {isLoading && (
        <p>LOADING PERSONNEL RECORDS...</p>
      )}

      {errorMessage && (
        <p>{errorMessage}</p>
      )}

      {successMessage && (
        <p>{successMessage}</p>
      )}

      {!isLoading &&
        !errorMessage &&
        personnel.length === 0 && (
          <p>NO PERSONNEL RECORDS FOUND.</p>
        )}

      {!isLoading &&
        personnel.map((person) => {
          const draft = getDraft(person);

          const isPending =
            person.accountStatus === "PENDING";

          const isUpdating =
            updatingUserId === person.userId;

          const isCurrentUser =
            currentProfile?.userId === person.userId;

          return (
            <article
              key={person.userId}
              className="admin-personnel-card"
            >
              <h3>
                {person.displayName ?? "UNKNOWN PERSONNEL"}
              </h3>

              {isCurrentUser && (
                <p>CURRENT ADMIN SESSION</p>
              )}

              <p>
                CURRENT ROLE: {person.role}
              </p>

              <p>
                CURRENT STATUS: {person.accountStatus}
              </p>

              <p>
                CURRENT CLEARANCE: LEVEL{" "}
                {person.clearanceLevel}
              </p>

              <div className="admin-personnel-controls">
                {!isPending && (
                  <label>
                    ACCOUNT STATUS

                    <select
                      value={draft.accountStatus}
                      disabled={
                        isUpdating || isCurrentUser
                      }
                      onChange={(event) =>
                        updateDraft(
                          person,
                          "accountStatus",
                          event.target.value
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
                  ROLE

                  <select
                    value={draft.role}
                    disabled={
                      isUpdating || isCurrentUser
                    }
                    onChange={(event) =>
                      updateDraft(
                        person,
                        "role",
                        event.target.value
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
                  CLEARANCE LEVEL

                  <select
                    value={draft.clearanceLevel}
                    disabled={isUpdating}
                    onChange={(event) =>
                      updateDraft(
                        person,
                        "clearanceLevel",
                        Number(event.target.value)
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

                {isPending ? (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      handleApprove(person)
                    }
                  >
                    {isUpdating
                      ? "APPROVING..."
                      : "APPROVE PERSONNEL"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      handleSaveAuthorization(person)
                    }
                  >
                    {isUpdating
                      ? "SAVING..."
                      : "SAVE AUTHORIZATION"}
                  </button>
                )}
              </div>

              <hr />
            </article>
          );
        })}
    </section>
  );
}

export default Admin;