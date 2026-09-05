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

export const personnelService = {
  async getCurrentProfile(userId) {
    const { data, error, requestId } =
      await foundationClient.request(
        (supabase) =>
          supabase
            .from("personnel_profiles")
            .select("*")
            .eq("user_id", userId)
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
      data: mapPersonnelProfile(data),
      error: null,
      requestId,
    };
  },
};