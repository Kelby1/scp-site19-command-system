import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { scpService } from "../services/scp/scpService";
import { useAuth } from "../context/AuthContext";

import "../styles/scpManagement.css";

function EditSCP() {
  const { scpId } = useParams();
  const navigate = useNavigate();

  const { profile } = useAuth();

  const [scp, setScp] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      objectClass: "SAFE",
      threatLevel: "LOW",
      status: "CONTAINED",
      clearanceLevel: 0,
    });

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const requestIdRef =
    useRef(0);

  const adminClearance =
    Number(
      profile?.clearanceLevel ?? 0
    );

  const clearanceOptions =
    Array.from(
      {
        length:
          adminClearance + 1,
      },
      (_, index) => index
    );

  /*
   * =========================
   * LOAD SCP RECORD
   * =========================
   */

  async function loadSCP() {
    const requestId =
      ++requestIdRef.current;

    setIsLoading(true);
    setErrorMessage("");

    const {
      data,
      error,
    } = await scpService.getById(
      scpId
    );

    /*
     * Prevent an older request from
     * overwriting a newer request.
     */
    if (
      requestId !==
      requestIdRef.current
    ) {
      console.log(
        `[SCP EDIT] STALE RESPONSE IGNORED: ${requestId}`
      );

      return;
    }

    if (error || !data) {
      console.error(
        "[SCP EDIT][LOAD]",
        error
      );

      setScp(null);

      setErrorMessage(
        "CLASSIFIED RECORD UNAVAILABLE OR CLEARANCE INSUFFICIENT."
      );

      setIsLoading(false);

      return;
    }

    setScp(data);

    setFormData({
      name:
        data.name ?? "",

      description:
        data.description ?? "",

      objectClass:
        data.objectClass ??
        "SAFE",

      threatLevel:
        data.threatLevel ??
        "LOW",

      status:
        data.status ??
        "CONTAINED",

      clearanceLevel:
        Number(
          data.clearanceLevel ?? 0
        ),
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadSCP();

    return () => {
      requestIdRef.current += 1;
    };
  }, [scpId]);

  /*
   * =========================
   * FORM
   * =========================
   */

  function handleChange(event) {
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
    if (!formData.name.trim()) {
      return "SCP NAME IS REQUIRED.";
    }

    if (
      !formData.description.trim()
    ) {
      return "SCP DESCRIPTION IS REQUIRED.";
    }

    const clearance =
      Number(
        formData.clearanceLevel
      );

    if (
      clearance < 0 ||
      clearance > adminClearance
    ) {
      return (
        "SELECTED CLEARANCE EXCEEDS CURRENT ADMIN AUTHORIZATION."
      );
    }

    return null;
  }

  /*
   * =========================
   * SAVE
   * =========================
   */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(
        validationError
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const {
      data,
      error,
    } = await scpService.update(
      scpId,
      {
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
      }
    );

    if (error) {
      console.error(
        "[SCP EDIT][UPDATE]",
        error
      );

      setErrorMessage(
        error?.message ??
          "FAILED TO UPDATE SCP RECORD."
      );

      setIsSaving(false);

      return;
    }

    console.log(
      "[SCP EDIT][UPDATED]",
      data
    );

    /*
     * After editing, return to the
     * classified SCP detail page.
     */
    navigate(
      `/database/${scpId}`,
      {
        replace: true,
      }
    );
  }

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <section className="scp-database">

        <div className="page-heading">

          <div>
            <p className="page-heading__eyebrow">
              SITE-19 // DATABASE AUTHORITY
            </p>

            <h2>
              ACCESSING SCP RECORD...
            </h2>
          </div>

          <span className="page-heading__status status-connecting">
            ● DATABASE CONNECTING
          </span>

        </div>

      </section>
    );
  }

  /*
   * =========================
   * LOAD FAILURE
   * =========================
   */

  if (!scp) {
    return (
      <section className="scp-database">

        <div className="page-heading">

          <div>
            <p className="page-heading__eyebrow">
              SITE-19 // DATABASE AUTHORITY
            </p>

            <h2>
              RECORD ACCESS FAILURE
            </h2>
          </div>

        </div>

        <div className="database-error">

          <strong>
            ⚠ {errorMessage}
          </strong>

          <p>
            The requested SCP record
            could not be retrieved.
          </p>

          <button
            type="button"
            className="database-retry"
            onClick={loadSCP}
          >
            RETRY ACCESS
          </button>

          <Link
            to="/database"
            className="scp-card__button"
          >
            RETURN TO DATABASE
          </Link>

        </div>

      </section>
    );
  }

  /*
   * =========================
   * EDIT PAGE
   * =========================
   */

  return (
    <section className="scp-database">

      <div className="page-heading">

        <div>
          <p className="page-heading__eyebrow">
            SITE-19 // DATABASE AUTHORITY
          </p>

          <h2>
            EDIT SCP RECORD
          </h2>
        </div>

        <span className="page-heading__status status-online">
          ● ADMIN AUTHORIZED
        </span>

      </div>

      <section className="scp-admin-panel">

        <div className="scp-admin-panel__header">

          <div>
            <p>
              CLASSIFIED RECORD MODIFICATION
            </p>

            <h3>
              {scp.id}
            </h3>

            <span>
              ADMIN CLEARANCE LEVEL{" "}
              {adminClearance}
            </span>
          </div>

          <Link
            to={`/database/${scp.id}`}
            className="scp-card__button"
          >
            RETURN TO FILE
          </Link>

        </div>

        {errorMessage && (
          <div className="scp-admin-message scp-admin-message--error">
            {errorMessage}
          </div>
        )}

        <form
          className="scp-admin-form"
          onSubmit={handleSubmit}
        >

          <div className="scp-admin-form__heading">

            <strong>
              MODIFYING {scp.id}
            </strong>

            <span>
              ITEM NUMBER LOCKED
            </span>

          </div>

          {/* ITEM NUMBER */}

          <label>
            ITEM NUMBER

            <input
              type="text"
              value={scp.id}
              disabled
            />
          </label>

          {/* NAME */}

          <label>
            NAME

            <input
              name="name"
              type="text"
              value={formData.name}
              disabled={isSaving}
              onChange={handleChange}
            />
          </label>

          {/* OBJECT CLASS */}

          <label>
            OBJECT CLASS

            <select
              name="objectClass"
              value={
                formData.objectClass
              }
              disabled={isSaving}
              onChange={handleChange}
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

          {/* THREAT LEVEL */}

          <label>
            THREAT LEVEL

            <select
              name="threatLevel"
              value={
                formData.threatLevel
              }
              disabled={isSaving}
              onChange={handleChange}
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

          {/* STATUS */}

          <label>
            STATUS

            <select
              name="status"
              value={
                formData.status
              }
              disabled={isSaving}
              onChange={handleChange}
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

          {/* CLEARANCE */}

          <label>
            REQUIRED CLEARANCE

            <select
              name="clearanceLevel"
              value={
                formData.clearanceLevel
              }
              disabled={isSaving}
              onChange={handleChange}
            >
              {clearanceOptions.map(
                (level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    LEVEL {level}
                  </option>
                )
              )}
            </select>
          </label>

          {/* DESCRIPTION */}

          <label className="scp-admin-form__wide">
            DESCRIPTION

            <textarea
              name="description"
              rows="10"
              value={
                formData.description
              }
              disabled={isSaving}
              onChange={handleChange}
            />
          </label>

          {/* ACTIONS */}

          <div className="scp-admin-form__actions">

            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                navigate(
                  `/database/${scp.id}`
                )
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "TRANSMITTING..."
                : "SAVE CHANGES"}
            </button>

          </div>

        </form>

      </section>

    </section>
  );
}

export default EditSCP;