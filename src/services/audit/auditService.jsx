import { foundationClient } from "../../foundation/foundationClient";

function mapAuditLog(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,

    actorUserId:
      record.actor_user_id ??
      null,

    actorDisplayName:
      record.actor_display_name ??
      "SYSTEM",

    actorRole:
      record.actor_role ??
      "SYSTEM",

    entityType:
      record.entity_type ??
      "UNKNOWN",

    entityId:
      record.entity_id ??
      "UNKNOWN",

    operation:
      record.operation ??
      "UNKNOWN",

    requiredClearance:
      Number(
        record.required_clearance ??
        0
      ),

    changedFields:
      record.changed_fields ??
      [],

    beforeState:
      record.before_state ??
      null,

    afterState:
      record.after_state ??
      null,

    createdAt:
      record.created_at ??
      null,
  };
}

export const auditService = {
  /*
   * Retrieve recent audit events.
   *
   * PostgreSQL RLS decides which
   * records the current admin is
   * actually authorized to receive.
   */
  async getRecent(limit = 100) {
    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 100,
          1
        ),
        250
      );

    const {
      data,
      error,
      requestId,
    } = await foundationClient.request(
      (supabase) =>
        supabase
          .from("audit_logs")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(safeLimit),
      {
        /*
         * READ operation:
         * safe to retry.
         */
        retry: true,
        maxRetries: 2,
        retryDelayMs: 500,
      }
    );

    if (error) {
      return {
        data: null,
        error,
        requestId,
      };
    }

    return {
      data:
        (data ?? []).map(
          mapAuditLog
        ),

      error: null,
      requestId,
    };
  },
};