import { foundationClient } from "../../foundation/foundationClient";

function mapPersonnelProfile(record) {
  if (!record) return null;
  return {
    userId: record.user_id,
    displayName: record.display_name,
    accountStatus: record.account_status,
    role: record.role,
    clearanceLevel: record.clearance_level,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export const adminService = {
  async getPersonnel() {
    const { data, error, requestId } =
      await foundationClient.request(
        (supabase) =>
          supabase
            .from("personnel_profiles")
            .select("*")
            .order("created_at", { ascending: false }),
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
      data: data.map(mapPersonnelProfile),
      error: null,
      requestId,
    };
  },

  async updatePersonnel(userId, updates) {
    const databaseUpdates = {};

    if (updates.accountStatus !== undefined) {
      databaseUpdates.account_status = updates.accountStatus;
    }

    if (updates.role !== undefined) {
      databaseUpdates.role = updates.role;
    }

    if (updates.clearanceLevel !== undefined) {
      databaseUpdates.clearance_level = updates.clearanceLevel;
    }

    databaseUpdates.updated_at = new Date().toISOString();

    const { data, error, requestId } =
      await foundationClient.request(
        (supabase) =>
          supabase
            .from("personnel_profiles")
            .update(databaseUpdates)
            .eq("user_id", userId)
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
      data: mapPersonnelProfile(data),
      error: null,
      requestId,
    };
  },
};