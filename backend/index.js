const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { RealtimeClient } = require("@supabase/realtime-js");
const axios = require("axios"); // Import Axios

// Initialize the Express app
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Vercel!");
});

// Initialize the Supabase client
const supabaseUrl = "https://anczzwscgxogzohrdbnv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuY3p6d3NjZ3hvZ3pvaHJkYm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDczNjcsImV4cCI6MjAyODkyMzM2N30.3vqjUN4DvJiA7su0Sg1Gi__lnYQlIzK8o5Tv-cQckzs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Realtime client
const realtimeUrl = supabaseUrl.replace("https", "wss") + "/realtime/v1";
const realtime = new RealtimeClient(realtimeUrl, {
  params: {
    apikey: supabaseAnonKey,
  },
});

// Connect to the Realtime WebSocket server
realtime.connect();

// Listen for changes on 'scp' table using the Realtime client
const scpChannel = realtime.channel("public:scp");
scpChannel.on(
  "postgres_changes",
  { event: "UPDATE", schema: "public", table: "scp" },
  (payload) => {
    triggerFunction(payload);
  }
);
scpChannel.subscribe();

// Listen for changes on 'appointments' table using the Realtime client
const appointmentsChannel = realtime.channel("public:appointments");
appointmentsChannel.on(
  "postgres_changes",
  { event: "UPDATE", schema: "public", table: "appointments" },
  (payload) => {
    if (payload.new.status === "LIVE") deleteScpAvailability(payload);
  }
);
appointmentsChannel.subscribe();

// Delete the availabilities once appointment is confirmed
async function deleteScpAvailability(payload) {
  let start_time = payload.new.meeting_time.split("-")[0];
  let end_time = payload.new.meeting_time.split("-")[1];
  let meeting_date = payload.new.meeting_date;

  let scp_ids = [payload.new.scp_id, payload.new.patient_id];

  try {
    // Loop through each scp_id and perform the delete operation
    for (const scp_id of scp_ids) {
      const { data, error } = await supabase
        .from("scp_availability")
        .delete()
        .match({
          scp_id: scp_id,
          start_time: start_time,
          end_time: end_time,
          date: meeting_date,
        });

      if (error) throw error;
      console.log(`Rows deleted for SCP ID ${scp_id}:`, data);
    }
  } catch (err) {
    console.error("Error in deleteScpAvailability:", err.message);
  }
}

// Function to handle the Realtime changes and perform subsequent actions
async function triggerFunction(payload) {
  try {
    const { data, error } = await supabase.rpc("find_first_match", {
      given_scp_id: payload.new.id,
    });
    if (error) throw error;

    const min = 100000;
    const max = 999999;
    const randomCode = Math.floor(Math.random() * (max - min + 1) + min);

    console.log("DATA: ", data);

    const insertResult = await supabase
      .from("appointments")
      .insert([
        {
          scp_id: payload.new.id,
          patient_id: data.scp_id,
          meeting_date: data.date,
          meeting_time: data.start_time + "-" + data.end_time,
          meeting_link: "https://meet.hsciglobal.org/roundrobin/" + randomCode,
          patient_phone: payload.new.whatsapp_phone_no,
          scp_phone: data.phone,
          status: "DRAFT",
        },
      ])
      .select();

    if (insertResult.error) {
      throw insertResult.error;
    }

    // Assuming 'id' is the name of the auto-increment primary key column in the 'appointments' table
    const newAppointmentId = insertResult.data[0].id;
    console.log("insertResult: ", insertResult);
    console.log("Insert successful, new appointment ID:", newAppointmentId);

    // Define headers for the POST request
    const config = {
      headers: {
        Authorization: "bc9261c7-2d89-4415-a439-a98609b58fc8",
        "Content-Type": "application/json",
      },
    };

    // Gupshup callback URL and payload data
    const gupshupUrl =
      "https://notifications.gupshup.io/notifications/callback/service/ipass/project/31566410/integration/137b1758102d899b5f9d308e0";
    const payloadDataPatient = {
      event_name: "appointment_details",
      event_time: JSON.stringify(new Date()),
      user: {
        phone: payload.new.whatsapp_phone_no,
        name: payload.new.name,
        matched_person: data.name,
        meeting_date: data.date,
        meeting_time: data.start_time + "-" + data.end_time,
        meeting_link: "https://meet.hsciglobal.org/roundrobin/" + randomCode,
        appointment_id: newAppointmentId,
      },
      txid: "123",
    };

    // Send POST requests with the Authorization header
    await axios.post(gupshupUrl, payloadDataPatient, config);

    // const payloadDataScp = {
    //   event_name: "appointment_details",
    //   event_time: JSON.stringify(new Date()),
    //   user: {
    //     phone: data.phone,
    //     name: data.name,
    //     matched_person: payload.new.name,
    //     meeting_date: data.date,
    //     meeting_time: data.start_time + "-" + data.end_time,
    //     meeting_link: "https://meet.hsciglobal.org/roundrobin/" + randomCode,
    //   },
    //   txid: "123",
    // };

    // await axios.post(gupshupUrl, payloadDataScp, config);
  } catch (err) {
    console.error("Error in trigger function:", err.message);
  }
}

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
