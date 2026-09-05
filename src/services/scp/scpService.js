import { foundationClient } from "../../foundation/foundationClient";

/*
 * Converts a PostgreSQL SCP record
 * into the object shape used by React.
 */
function mapSCPRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id:
      record.id ??
      "",

    name:
      record.name ??
      "",

    description:
      record.description ??
      "",

    objectClass:
      record.objectClass ??
      record.object_class ??
      "",

    threatLevel:
      record.threatLevel ??
      record.threat_level ??
      record.threatlevel ??
      "",

    status:
      record.status ??
      "",

    clearanceLevel:
      record.clearanceLevel ??
      record.clearance_level ??
      record.clearancelevel ??
      0,

    createdAt:
      record.createdAt ??
      record.created_at ??
      "",
  };
}

/*
 * Converts our React/domain SCP object
 * into PostgreSQL column names.
 */
function mapSCPToDatabase(scp) {
  return {
    id: scp.id,
    name: scp.name,
    description: scp.description,
    object_class: scp.objectClass,
    threat_level: scp.threatLevel,
    status: scp.status,
    clearance_level: Number(
      scp.clearanceLevel
    ),
  };
}

/*
 * Builds an UPDATE object containing
 * only fields that were actually supplied.
 *
 * We deliberately do not allow the
 * primary-key ID to be changed here.
 */
function mapSCPUpdatesToDatabase(updates) {
  const databaseUpdates = {};

  if (updates.name !== undefined) {
    databaseUpdates.name =
      updates.name;
  }

  if (updates.description !== undefined) {
    databaseUpdates.description =
      updates.description;
  }

  if (updates.objectClass !== undefined) {
    databaseUpdates.object_class =
      updates.objectClass;
  }

  if (updates.threatLevel !== undefined) {
    databaseUpdates.threat_level =
      updates.threatLevel;
  }

  if (updates.status !== undefined) {
    databaseUpdates.status =
      updates.status;
  }

  if (updates.clearanceLevel !== undefined) {
    databaseUpdates.clearance_level =
      Number(updates.clearanceLevel);
  }

  return databaseUpdates;
}

export const scpService = {
  /*
   * READ ALL
   *
   * Safe to retry because this operation
   * does not modify database state.
   */
  async getAll() {
    const {
      data,
      error,
      requestId,
    } = await foundationClient.request(
      (supabase) =>
        supabase
          .from("scp_objects")
          .select("*"),
      {
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
      data: (data ?? []).map(
        mapSCPRecord
      ),
      error: null,
      requestId,
    };
  },

  /*
   * READ ONE
   */
  async getById(id) {
    const {
      data,
      error,
      requestId,
    } = await foundationClient.request(
      (supabase) =>
        supabase
          .from("scp_objects")
          .select("*")
          .eq("id", id)
          .single(),
      {
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
      data: mapSCPRecord(data),
      error: null,
      requestId,
    };
  },

  /*
   * CREATE
   *
   * No automatic retries.
   *
   * A write could succeed on the server
   * while the response fails in transit.
   * Automatically retrying could therefore
   * create unexpected duplicate operations.
   */
  async create(scp) {
    const databaseRecord =
      mapSCPToDatabase(scp);

    const {
      data,
      error,
      requestId,
    } = await foundationClient.request(
      (supabase) =>
        supabase
          .from("scp_objects")
          .insert(databaseRecord)
          .select()
          .single(),
      {
        retry: false,
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
      data: mapSCPRecord(data),
      error: null,
      requestId,
    };
  },

  /*
   * UPDATE
   *
   * ID is used only to locate the record.
   * It cannot be changed through this method.
   */
  async update(id, updates) {
    const databaseUpdates =
      mapSCPUpdatesToDatabase(
        updates
      );

    const {
      data,
      error,
      requestId,
    } = await foundationClient.request(
      (supabase) =>
        supabase
          .from("scp_objects")
          .update(databaseUpdates)
          .eq("id", id)
          .select()
          .single(),
      {
        retry: false,
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
      data: mapSCPRecord(data),
      error: null,
      requestId,
    };
  },

  /*
   * DELETE
   *
   * Returns the deleted record so the UI
   * knows exactly what PostgreSQL removed.
   */
  async delete(id) {
    const {
      data,
      error,
      requestId,
    } = await foundationClient.request(
      (supabase) =>
        supabase
          .from("scp_objects")
          .delete()
          .eq("id", id)
          .select()
          .single(),
      {
        retry: false,
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
      data: mapSCPRecord(data),
      error: null,
      requestId,
    };
  },
};