import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { scpService } from "../services/scp/scpService";
import { useAuth } from "../context/AuthContext";

import "../styles/scpManagement.css";

const BASE_FORM = {
  id: "",
  name: "",
  description: "",
  objectClass: "SAFE",
  threatLevel: "LOW",
  status: "CONTAINED",
  clearanceLevel: 1,
};

function Database() {
  const { profile } = useAuth();

  const [scpData, setScpData] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("ALL");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * CRUD UI state
   */
  const [editorMode, setEditorMode] =
    useState(null);

  const [activeRecord, setActiveRecord] =
    useState(null);

  const [formData, setFormData] =
    useState(BASE_FORM);

  const [isMutating, setIsMutating] =
    useState(false);

  const [
    mutationMessage,
    setMutationMessage,
  ] = useState(null);

  /*
   * Prevent stale database responses
   * from overwriting newer results.
   */
  const databaseRequestIdRef =
    useRef(0);

  const isAdmin =
    profile?.role === "ADMIN" &&
    profile?.accountStatus === "ACTIVE";

  const adminClearance = Number(
    profile?.clearanceLevel ?? 0
  );

  const clearanceOptions =
    Array.from(
      {
        length: adminClearance + 1,
      },
      (_, index) => index
    );

  function createEmptyForm() {
    return {
      ...BASE_FORM,

      clearanceLevel:
        adminClearance >= 1
          ? 1
          : 0,
    };
  }

  async function loadSCPs() {
    const requestId =
      ++databaseRequestIdRef.current;

    setIsLoading(true);
    setErrorMessage("");

    const { data, error } =
      await scpService.getAll();

    /*
     * Ignore responses from older
     * requests.
     */
    if (
      requestId !==
      databaseRequestIdRef.current
    ) {
      console.log(
        `[DATABASE] Ignoring stale request ${requestId}`
      );

      return;
    }

    if (error) {
      console.error(
        `[DATABASE][${
          error?.requestId ??
          "UNKNOWN"
        }]`,
        error
      );

      setScpData([]);

      setErrorMessage(
        "DATABASE CONNECTION FAILURE"
      );
    } else {
      setScpData(data ?? []);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadSCPs();

    return () => {
      databaseRequestIdRef.current += 1;
    };
  }, []);

  function openCreate() {
    setActiveRecord(null);

    setFormData(
      createEmptyForm()
    );

    setMutationMessage(null);

    setEditorMode("create");
  }

  function openEdit(scp) {
    setActiveRecord(scp);

    setFormData({
      id: scp.id,
      name: scp.name,
      description:
        scp.description ?? "",

      objectClass:
        scp.objectClass,

      threatLevel:
        scp.threatLevel,

      status:
        scp.status,

      clearanceLevel:
        Number(
          scp.clearanceLevel
        ),
    });

    setMutationMessage(null);

    setEditorMode("edit");
  }

  function openDelete(scp) {
    setActiveRecord(scp);

    setMutationMessage(null);

    setEditorMode("delete");
  }

  function closeEditor() {
    setEditorMode(null);
    setActiveRecord(null);

    setFormData(
      createEmptyForm()
    );
  }

  function handleFormChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          name ===
          "clearanceLevel"
            ? Number(value)
            : value,
      })
    );
  }

  function validateForm() {
    const normalizedId =
      formData.id
        .trim()
        .toUpperCase();

    if (
      !normalizedId ||
      !formData.name.trim() ||
      !formData.description.trim()
    ) {
      return {
        valid: false,

        message:
          "ITEM NUMBER, NAME, AND DESCRIPTION ARE REQUIRED.",
      };
    }

    if (
      !/^SCP-[A-Z0-9-]+$/.test(
        normalizedId
      )
    ) {
      return {
        valid: false,

        message:
          "ITEM NUMBER MUST USE SCP- FORMAT.",
      };
    }

    if (
      Number(
        formData.clearanceLevel
      ) > adminClearance
    ) {
      return {
        valid: false,

        message:
          "CLEARANCE EXCEEDS CURRENT ADMIN AUTHORIZATION.",
      };
    }

    if (
      Number(
        formData.clearanceLevel
      ) < 0
    ) {
      return {
        valid: false,

        message:
          "INVALID CLEARANCE LEVEL.",
      };
    }

    return {
      valid: true,
      normalizedId,
    };
  }

  async function handleSave(
    event
  ) {
    event.preventDefault();

    if (!isAdmin) {
      setMutationMessage({
        type: "error",

        text:
          "ADMIN AUTHORIZATION REQUIRED.",
      });

      return;
    }

    const validation =
      validateForm();

    if (!validation.valid) {
      setMutationMessage({
        type: "error",
        text: validation.message,
      });

      return;
    }

    setIsMutating(true);
    setMutationMessage(null);

    const payload = {
      name:
        formData.name.trim(),

      description:
        formData.description.trim(),

      objectClass:
        formData.objectClass,

      threatLevel:
        formData.threatLevel,

      status:
        formData.status,

      clearanceLevel:
        Number(
          formData.clearanceLevel
        ),
    };

    let result;

    if (
      editorMode === "create"
    ) {
      result =
        await scpService.create({
          id:
            validation.normalizedId,

          ...payload,
        });
    } else {
      result =
        await scpService.update(
          activeRecord.id,
          payload
        );
    }

    if (result.error) {
      console.error(
        `[SCP CRUD][${
          editorMode === "create"
            ? "CREATE"
            : "UPDATE"
        }]`,
        result.error
      );

      setMutationMessage({
        type: "error",

        text:
          result.error?.message ??
          "SCP DATABASE WRITE FAILED.",
      });

      setIsMutating(false);

      return;
    }

    const operation =
      editorMode === "create"
        ? "CREATED"
        : "UPDATED";

    setMutationMessage({
      type: "success",

      text:
        `${result.data.id} ${operation} SUCCESSFULLY.`,
    });

    await loadSCPs();

    closeEditor();

    setIsMutating(false);
  }

  async function handleDelete() {
    if (
      !isAdmin ||
      !activeRecord
    ) {
      return;
    }

    setIsMutating(true);
    setMutationMessage(null);

    const { data, error } =
      await scpService.delete(
        activeRecord.id
      );

    if (error) {
      console.error(
        "[SCP CRUD][DELETE]",
        error
      );

      setMutationMessage({
        type: "error",

        text:
          error?.message ??
          "SCP RECORD DELETION FAILED.",
      });

      setIsMutating(false);

      return;
    }

    setMutationMessage({
      type: "success",

      text:
        `${
          data?.id ??
          activeRecord.id
        } DELETED SUCCESSFULLY.`,
    });

    await loadSCPs();

    closeEditor();

    setIsMutating(false);
  }

  const filteredSCPs =
    scpData.filter((scp) => {
      const scpId =
        scp?.id ?? "";

      const scpName =
        scp?.name ?? "";

      const scpClass =
        scp?.objectClass ?? "";

      const term =
        searchTerm.toLowerCase();

      const matchesSearch =
        scpId
          .toLowerCase()
          .includes(term) ||
        scpName
          .toLowerCase()
          .includes(term) ||
        scpClass
          .toLowerCase()
          .includes(term);

      const matchesClass =
        selectedClass === "ALL" ||
        scpClass.toUpperCase() ===
          selectedClass.toUpperCase();

      return (
        matchesSearch &&
        matchesClass
      );
    });

  return (
    <section className="scp-database">

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

      {/* ======================
          ADMIN CRUD CONTROL
      ====================== */}

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

            {!editorMode && (
              <button
                type="button"
                className="scp-admin-button"
                onClick={openCreate}
              >
                + CREATE SCP RECORD
              </button>
            )}
          </div>

          {mutationMessage && (
            <div
              className={`scp-admin-message scp-admin-message--${mutationMessage.type}`}
            >
              {mutationMessage.text}
            </div>
          )}

          {(editorMode ===
            "create" ||
            editorMode ===
              "edit") && (
            <form
              className="scp-admin-form"
              onSubmit={
                handleSave
              }
            >
              <div className="scp-admin-form__heading">

                <strong>
                  {editorMode ===
                  "create"
                    ? "NEW CLASSIFIED RECORD"
                    : `EDITING ${activeRecord?.id}`}
                </strong>

                <button
                  type="button"
                  onClick={
                    closeEditor
                  }
                  disabled={
                    isMutating
                  }
                >
                  CANCEL
                </button>
              </div>

              <label>
                ITEM NUMBER

                <input
                  name="id"
                  type="text"
                  placeholder="SCP-999"
                  value={
                    formData.id
                  }
                  disabled={
                    editorMode ===
                      "edit" ||
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                />
              </label>

              <label>
                NAME

                <input
                  name="name"
                  type="text"
                  placeholder="OBJECT DESIGNATION"
                  value={
                    formData.name
                  }
                  disabled={
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                />
              </label>

              <label>
                OBJECT CLASS

                <select
                  name="objectClass"
                  value={
                    formData.objectClass
                  }
                  disabled={
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                >
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
              </label>

              <label>
                THREAT LEVEL

                <select
                  name="threatLevel"
                  value={
                    formData.threatLevel
                  }
                  disabled={
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                >
                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MODERATE">
                    MODERATE
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                  <option value="CRITICAL">
                    CRITICAL
                  </option>
                </select>
              </label>

              <label>
                STATUS

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  disabled={
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                >
                  <option value="CONTAINED">
                    CONTAINED
                  </option>

                  <option value="UNCONTAINED">
                    UNCONTAINED
                  </option>

                  <option value="NEUTRALIZED">
                    NEUTRALIZED
                  </option>

                  <option value="UNKNOWN">
                    UNKNOWN
                  </option>
                </select>
              </label>

              <label>
                REQUIRED CLEARANCE

                <select
                  name="clearanceLevel"
                  value={
                    formData.clearanceLevel
                  }
                  disabled={
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                >
                  {clearanceOptions.map(
                    (level) => (
                      <option
                        key={
                          level
                        }
                        value={
                          level
                        }
                      >
                        LEVEL{" "}
                        {level}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="scp-admin-form__wide">
                DESCRIPTION

                <textarea
                  name="description"
                  rows="6"
                  placeholder="ENTER CLASSIFIED SCP DESCRIPTION..."
                  value={
                    formData.description
                  }
                  disabled={
                    isMutating
                  }
                  onChange={
                    handleFormChange
                  }
                />
              </label>

              <div className="scp-admin-form__actions">

                <button
                  type="button"
                  onClick={
                    closeEditor
                  }
                  disabled={
                    isMutating
                  }
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={
                    isMutating
                  }
                >
                  {isMutating
                    ? "TRANSMITTING..."
                    : editorMode ===
                        "create"
                      ? "CREATE RECORD"
                      : "SAVE RECORD"}
                </button>

              </div>
            </form>
          )}

          {editorMode ===
            "delete" &&
            activeRecord && (
              <div className="scp-delete-confirm">

                <p>
                  DATABASE DELETION AUTHORIZATION
                </p>

                <h3>
                  DELETE{" "}
                  {activeRecord.id}?
                </h3>

                <span>
                  This operation will
                  permanently remove the
                  selected SCP record.
                </span>

                <div className="scp-delete-confirm__actions">

                  <button
                    type="button"
                    onClick={
                      closeEditor
                    }
                    disabled={
                      isMutating
                    }
                  >
                    ABORT
                  </button>

                  <button
                    type="button"
                    className="scp-admin-button--danger"
                    onClick={
                      handleDelete
                    }
                    disabled={
                      isMutating
                    }
                  >
                    {isMutating
                      ? "DELETING..."
                      : "CONFIRM DELETE"}
                  </button>

                </div>
              </div>
            )}

        </section>
      )}

      {/* ======================
          SEARCH / FILTER
      ====================== */}

      <div className="database-controls">

        <input
          type="text"
          placeholder="SEARCH SCP RECORDS..."
          value={
            searchTerm
          }
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
        />

        <select
          value={
            selectedClass
          }
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

      {/* ======================
          DATABASE RECORDS
      ====================== */}

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
                Check the Foundation
                data connection.
              </p>

              <button
                type="button"
                onClick={
                  loadSCPs
                }
                className="database-retry"
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
                className="scp-card"
                key={scp.id}
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
                      {
                        scp.threatLevel
                      }
                    </strong>
                  </span>

                  <span>
                    STATUS:{" "}
                    <strong>
                      {scp.status}
                    </strong>
                  </span>

                  <span>
                    CLEARANCE:
                    <strong>
                      {" "}
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
                      <button
                        type="button"
                        className="scp-card__admin-button"
                        onClick={() =>
                          openEdit(
                            scp
                          )
                        }
                      >
                        EDIT RECORD
                      </button>

                      <button
                        type="button"
                        className="scp-card__admin-button scp-card__admin-button--danger"
                        onClick={() =>
                          openDelete(
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
        filteredSCPs.length ===
          0 && (
          <div className="database-empty">
            NO RECORDS AVAILABLE
            WITHIN CURRENT SEARCH OR
            CLEARANCE PARAMETERS.
          </div>
        )}

    </section>
  );
}

export default Database;