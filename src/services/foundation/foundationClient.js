import { supabase } from "../../lib/supabase";

export const foundationClient = {
  async request(operation) {
    try {
      const result = await operation(supabase);

      if (result.error) {
        throw result.error;
      }

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      console.error("[FOUNDATION]", error);

      return {
        data: null,
        error,
      };
    }
  },
};