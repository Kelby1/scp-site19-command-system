import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { scpService } from "../services/scp/scpService";
import { useAuth } from "../context/AuthContext";

import "../styles/scpManagement.css";

function CreateSCP() {
  const navigate = useNavigate();

  const { profile } = useAuth();

  const adminClearance = Number(
    profile?.clearanceLevel ?? 0
  );

  const [formData, setFormData] =
    useState(() => ({
      id: "",
      name: "",
      description: "",
      objectClass: "SAFE",
      threatLevel: "LOW",
      status: "CONTAINED",

      clearanceLevel:
        adminClearance >= 1
          ? 1
          : 0,
    }));

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const clearanceOptions =
    Array.from(
      {
        length:
          adminClearance + 1,
      },
      (_, index) => index
    );

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          name === "clearanceLevel"
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

    if (!normalizedId) {
      return {
        valid: false,
        message:
          "ITEM NUMBER IS REQUIRED.",
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

    if (!formData.name.trim()) {
      return {
        valid: false,
        message:
          "SCP NAME IS REQUIRED.",
      };
    }

    if (
      !formData.description.trim()
    ) {
      return {
        valid: false,

        message:
          "SCP DESCRIPTION IS REQUIRED.",
      };
    }

    const clearance =
      Number(
        formData.clearanceLevel
      );

    if (
      clearance < 0 ||
      clearance > adminClearance
    ) {
      return {
        valid: false,

        message:
          "SELECTED CLEARANCE EXCEEDS CURRENT ADMIN AUTHORIZATION.",
      };
    }

    return {
      valid: true,
      normalizedId,
    };
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");

    const validation =
      validateForm();

    if (!validation.valid) {
      setErrorMessage(
        validation.message
      );

      return;
    }

    setIsSubmitting(true);

    const {
      data,
      error,
    } = await scpService.create({
      id:
        validation.normalizedId,

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
    });

    if (error) {
      console.error(
        "[SCP CREATE]",
        error
      );

      setErrorMessage(
        error?.message ??
          "FAILED TO CREATE SCP RECORD."
      );

      setIsSubmitting(false);

      return;
    }

    console.log(
      "[SCP CREATE][SUCCESS]",
      data
    );

    /*
     * Creation succeeded.
     *
     * Go directly to the newly
     * created classified file.
     */
    navigate(
      `/database/${data.id}`,
      {
        replace: true,
      }
    );
  }

  return (
    <section className="scp-database">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">

        <div>
          <p className="page-heading__eyebrow">
            SITE-19 // DATABASE AUTHORITY
          </p>

          <h2>
            CREATE SCP RECORD
          </h2>
        </div>

        <span className="page-heading__status status-online">
          ● ADMIN AUTHORIZED
        </span>

      </div>

      {/* =========================
          CREATE PANEL
      ========================= */}

      <section className="scp-admin-panel">

        <div className="scp-admin-panel__header">

          <div>
            <p>
              CLASSIFIED RECORD CREATION
            </p>

            <h3>
              NEW CONTAINMENT FILE
            </h3>

            <span>
              ADMIN CLEARANCE LEVEL{" "}
              {adminClearance}
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              navigate("/database")
            }
          >
            RETURN TO DATABASE
          </button>

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
              NEW CLASSIFIED RECORD
            </strong>

            <span>
              DATABASE WRITE AUTHORIZED
            </span>

          </div>

          {/* =====================
              ITEM NUMBER
          ===================== */}

          <label>
            ITEM NUMBER

            <input
              name="id"
              type="text"
              placeholder="SCP-999"
              value={formData.id}
              disabled={isSubmitting}
              onChange={handleChange}
            />
          </label>

          {/* =====================
              NAME
          ===================== */}

          <label>
            NAME

            <input
              name="name"
              type="text"
              placeholder="OBJECT DESIGNATION"
              value={formData.name}
              disabled={isSubmitting}
              onChange={handleChange}
            />
          </label>

          {/* =====================
              OBJECT CLASS
          ===================== */}

          <label>
            OBJECT CLASS

            <select
              name="objectClass"
              value={
                formData.objectClass
              }
              disabled={isSubmitting}
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

          {/* =====================
              THREAT LEVEL
          ===================== */}

          <label>
            THREAT LEVEL

            <select
              name="threatLevel"
              value={
                formData.threatLevel
              }
              disabled={isSubmitting}
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

          {/* =====================
              STATUS
          ===================== */}

          <label>
            STATUS

            <select
              name="status"
              value={
                formData.status
              }
              disabled={isSubmitting}
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

          {/* =====================
              CLEARANCE
          ===================== */}

          <label>
            REQUIRED CLEARANCE

            <select
              name="clearanceLevel"
              value={
                formData.clearanceLevel
              }
              disabled={isSubmitting}
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

          {/* =====================
              DESCRIPTION
          ===================== */}

          <label className="scp-admin-form__wide">
            DESCRIPTION

            <textarea
              name="description"
              rows="10"
              placeholder="ENTER CLASSIFIED SCP DESCRIPTION..."
              value={
                formData.description
              }
              disabled={isSubmitting}
              onChange={handleChange}
            />
          </label>

          {/* =====================
              ACTIONS
          ===================== */}

          <div className="scp-admin-form__actions">

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                navigate("/database")
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "TRANSMITTING..."
                : "CREATE RECORD"}
            </button>

          </div>

        </form>

      </section>

    </section>
  );
}

export default CreateSCP;