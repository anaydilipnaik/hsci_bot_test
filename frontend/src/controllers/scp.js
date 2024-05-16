/*
    List of APIs needed for round robin:
    1. getAllSCPs() --> Get a list of all the SCP along with all of their details
    2. getSCPById(scpId) --> Get the details of a particular SCP
    3. updateSCPPreferences(scpId, language_preferences, servicePreferences) --> Update the language abd service preference for a particular SCP
    4. addSCPAvailability(scpId, date, startTime, endTime) --> add/update the SCP availability in scp_availability
    5. getScpAvailability(scpId) --> Get the availability for a particular scp
    6. findMatch(scpId) --> Find the first match based on availability, language and service preferences
    7. createAppointment(scp1Id, scp2Id) --> Create an appointment based on the (found) match
*/

import { supabase } from "../utils/supabase";

export const getAllSCPs = async () => {
  try {
    const { data, error } = await supabase.from("scp").select("*");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching SCPs:", error.message);
    return null;
  }
};

export const getSCPById = async (scpId) => {
  try {
    const { data, error } = await supabase
      .from("scp")
      .select("*")
      .eq("id", scpId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching SCP by ID:", error.message);
    return null;
  }
};

export const getSCPByPhone = async (phone) => {
  try {
    const { data, error } = await supabase
      .from("scp")
      .select("*")
      .eq("whatsapp_phone_no", phone)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching SCP by Phone:", error.message);
    return null;
  }
};

export const updateSCPPreferences = async (
  scpId,
  languagePreferences,
  servicePreferences,
  timezone
) => {
  try {
    const { data, error } = await supabase
      .from("scp")
      .update({
        languages_spoken: languagePreferences,
        services_offered: servicePreferences,
        timezone: timezone,
      })
      .eq("id", scpId);

    if (error) throw error;

    if (data && data.length > 0) {
      // If data is returned, update was successful
      return { success: true, message: "Update successful", data: data };
    } else {
      // If no data was changed, inform the user nothing was updated
      return {
        success: false,
        message: "No changes were made or item does not exist",
      };
    }
  } catch (error) {
    console.error("Error updating SCP preferences:", error.message);
    return { success: false, message: error.message };
  }
};

export const addSCPAvailability = async (scpId, date, startTime, endTime) => {
  const { data, error } = await supabase
    .from("scp_availability")
    .insert([
      { scp_id: scpId, date: date, start_time: startTime, end_time: endTime },
    ]);

  if (error) {
    console.error("Error inserting data:", error);
    return { error };
  }

  return { data };
};

export const getScpAvailability = async (scpId) => {
  try {
    let { data, error, status } = await supabase
      .from("scp_availability")
      .select("*")
      .eq("scp_id", scpId);

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error(error.message);
  }
};

export const findMatch = async (scpId) => {
  let { data, error } = await supabase.rpc("find_first_match", {
    given_scp_id: scpId,
  });
  if (error) console.error(error);
  else return data;
};

export const createAppointment = async (
  scpId,
  patientId,
  meetingDate,
  meetingTime,
  meetingLink,
  patientPhone,
  scpPhone
) => {
  const { data, error } = await supabase.from("appointments").insert([
    {
      scp_id: scpId,
      patient_id: patientId,
      meeting_date: meetingDate,
      meeting_time: meetingTime,
      meeting_link: meetingLink,
      patient_phone: patientPhone,
      scp_phone: scpPhone,
    },
  ]);

  if (error) {
    console.error("Error inserting data:", error);
    return { error };
  }

  return { data };
};

export const deleteSCPAvailability = async (availabilityId) => {
  try {
    const { data, error } = await supabase
      .from("scp_availability")
      .delete()
      .match({
        id: availabilityId,
      });

    if (error) throw error;
    console.log(`deleted:`, data);
  } catch (err) {
    console.error("Error in deleteScpAvailability:", err.message);
  }
};
