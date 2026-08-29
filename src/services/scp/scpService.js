import { foundationClient } from "../foundation/foundationClient";

export const scpService = {
  async getAll() {
    return foundationClient.request((supabase) =>
      supabase
        .from("scp_objects")
        .select("*")
        .order("item_number", { ascending: true })
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