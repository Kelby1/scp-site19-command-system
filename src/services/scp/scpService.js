import { foundationClient } from "../../foundation/foundationClient";

export const scpService = {
  async getAll() {
    return foundationClient.request((supabase) =>
      supabase
        .from("scp_objects")
        .select("*")
    );
  },

  async getById(id) {
    return foundationClient.request((supabase) =>
      supabase
        .from("scp_objects")
        .select("*")
        .eq("id", id)
        .single()
    );
  },
};