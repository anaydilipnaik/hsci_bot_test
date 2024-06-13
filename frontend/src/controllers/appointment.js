import { supabase } from "../utils/supabase";

export const getAppointmentById = async (appointmentId) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        scp:scp_id ( name ),
        patient:patient_id ( name )
      `
      )
      .eq("id", appointmentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching Appointment by ID:", error.message);
    return null;
  }
};
