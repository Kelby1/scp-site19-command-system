import {
  useEffect,
  useState,
} from "react";

import { createPortal } from "react-dom";

import "../../styles/deleteSCPModal.css";

function DeleteSCPModal({
  record,
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm,
}) {
  const [confirmationText, setConfirmationText] =
    useState("");

  useEffect(() => {
    if (!record) {
      return;
    }

    setConfirmationText("");

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !isDeleting
      ) {
        onCancel();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    record,
    isDeleting,
    onCancel,
  ]);

  if (!record) {
    return null;
  }

  const requiredPhrase =
    (record.id ?? "")
      .trim()
      .toUpperCase();

  const enteredPhrase =
    confirmationText
      .trim()
      .toUpperCase();

  const isConfirmed =
    enteredPhrase ===
    requiredPhrase;

  function handleBackdropClick(event) {
    if (
      event.target ===
        event.currentTarget &&
      !isDeleting
    ) {
      onCancel();
    }
  }

  const modal = (
    <div
      className="scp-delete-modal__backdrop"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="scp-delete-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-scp-title"
      >

        <div className="scp-delete-modal__security-strip">
          FOUNDATION SECURITY PROTOCOL
        </div>

        <header className="scp-delete-modal__header">

          <div>
            <p>
              SITE-19 // DESTRUCTIVE DATABASE ACTION
            </p>

            <h2 id="delete-scp-title">
              RECORD TERMINATION
              AUTHORIZATION
            </h2>
          </div>

          <span className="scp-delete-modal__warning">
            ⚠
          </span>

        </header>

        <div className="scp-delete-modal__alert">

          <strong>
            PERMANENT DELETION REQUESTED
          </strong>

          <p>
            This operation cannot be
            reversed after authorization
            is accepted by the database.
          </p>

        </div>

        <div className="scp-delete-modal__record">

          <div>
            <span>
              ITEM NUMBER
            </span>

            <strong>
              {record.id}
            </strong>
          </div>

          <div>
            <span>
              DESIGNATION
            </span>

            <strong>
              {record.name}
            </strong>
          </div>

          <div>
            <span>
              OBJECT CLASS
            </span>

            <strong>
              {record.objectClass}
            </strong>
          </div>

          <div>
            <span>
              CLEARANCE
            </span>

            <strong>
              LEVEL{" "}
              {record.clearanceLevel}
            </strong>
          </div>

          <div>
            <span>
              STATUS
            </span>

            <strong>
              {record.status}
            </strong>
          </div>

          <div>
            <span>
              REQUESTED ACTION
            </span>

            <strong className="scp-delete-modal__danger-text">
              PERMANENT DELETE
            </strong>
          </div>

        </div>

        <div className="scp-delete-modal__confirmation">

          <label htmlFor="scp-delete-confirmation">
            TYPE{" "}
            <strong>
              {record.id}
            </strong>{" "}
            TO AUTHORIZE TERMINATION
          </label>

          <input
            id="scp-delete-confirmation"
            type="text"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            placeholder={record.id}
            value={confirmationText}
            disabled={isDeleting}
            onChange={(event) =>
              setConfirmationText(
                event.target.value
              )
            }
          />

          <div
            className={`scp-delete-modal__verification ${
              isConfirmed
                ? "scp-delete-modal__verification--confirmed"
                : ""
            }`}
          >
            {isConfirmed
              ? "AUTHORIZATION PHRASE VERIFIED"
              : "AUTHORIZATION PHRASE REQUIRED"}
          </div>

        </div>

        {errorMessage && (
          <div className="scp-delete-modal__error">
            ⚠ {errorMessage}
          </div>
        )}

        <footer className="scp-delete-modal__actions">

          <button
            type="button"
            className="scp-delete-modal__abort"
            disabled={isDeleting}
            onClick={onCancel}
          >
            ABORT OPERATION
          </button>

          <button
            type="button"
            className="scp-delete-modal__confirm"
            disabled={
              !isConfirmed ||
              isDeleting
            }
            onClick={onConfirm}
          >
            {isDeleting
              ? "TERMINATING RECORD..."
              : "AUTHORIZE TERMINATION"}
          </button>

        </footer>

      </section>
    </div>
  );

  return createPortal(
    modal,
    document.body
  );
}

export default DeleteSCPModal;
