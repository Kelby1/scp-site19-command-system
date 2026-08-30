import { foundationClient } from "../../foundation/foundationClient";

function mapSCPRecord(record) {
  if (!record) return null;
  return {
    id: record.id || "",
    name: record.name || "",
    description: record.description || "",
    objectClass: record.objectClass || record.object_class || "",
    threatLevel: record.threatLevel || record.threat_level || record.threatlevel || "",
    status: record.status || "",
    clearanceLevel: record.clearanceLevel || record.clearance_level || record.clearancelevel || "",
    createdAt: record.createdAt || record.created_at || "",
  };
}

export const scpService = {
  async getAll() {
    const { data, error } = await foundationClient.request(
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
      };
    }

    return {
      data: data.map(mapSCPRecord),
      error: null,
    };
  },

  async getById(id) {
    const { data, error } = await foundationClient.request(
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
      };
    }

    return {
      data: mapSCPRecord(data),
      error: null,
    };
  },
};