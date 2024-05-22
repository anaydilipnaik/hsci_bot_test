import { supabase } from "../utils/supabase";

export const createPatient = async (name, phone, hospital) => {
  const { data, error } = await supabase.from("patients").insert([
    {
      name: name,
      whatsapp_phone_no: phone,
      hospital: hospital,
    },
  ]);

  if (error) {
    console.error("Error inserting data:", error);
    return { error };
  }

  return { data };
};
