const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { RealtimeClient } = require("@supabase/realtime-js");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Initialize the Express app
const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

app.post("/acknowledgement", async (req, res, next) => {
  try {
    const config = {
      headers: {
        Authorization: "fa2fed37-42f1-4d9c-b889-f52984dc03a4",
        "Content-Type": "application/json",
      },
    };

    const gupshupUrl =
      "https://notifications.gupshup.io/notifications/callback/service/ipass/project/31566410/integration/187b1a89156f3c87982a83954";

    const ackPayloadData = {
      event_name: "preferences_acknowledgement",
      event_time: new Date().toISOString(),
      user: {
        phone: req.body.whatsapp_phone_no,
        name: req.body.name,
      },
      txid: "123",
    };

    await axios.post(gupshupUrl, ackPayloadData, config);

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("Something went wrong");
  }
});

app.post("/", async (req, res, next) => {
  console.log("ROOT ROUTE for backend.trayacare.hsciglobal.org");
});

app.post("/feedback-loop", async (req, res, next) => {
  console.log("IN FEEDBACK LOOP: ", req.body);
  try {
    const config = {
      headers: {
        Authorization: "ed048b5b-2dd7-491c-a8e5-3ababf728e5f",
        "Content-Type": "application/json",
      },
    };

    const gupshupUrl =
      "https://notifications.gupshup.io/notifications/callback/service/ipass/project/31566410/integration/1f71128216413333213086552";

    const feedbackPayload = {
      event_name: "feedback_loop",
      event_time: new Date().toISOString(),
      user: {
        phone: req.body.whatsapp_phone_no,
        name: req.body.name,
        appointment_id: req.body.appointment_id,
        role_type: req.body.role_type,
        matched_name: req.body.matched_name,
      },
      txid: "456",
    };

    console.log("feedbackPayload: ", feedbackPayload);

    await axios.post(gupshupUrl, feedbackPayload, config);

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("Something went wrong");
  }
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
  { event: "INSERT", schema: "public", table: "appointments" },
  (payload) => {
    updateScpAvailability(payload);
  }
);
appointmentsChannel.subscribe();

async function updateScpAvailability(payload) {
  let start_time = payload.new.meeting_time.split("-")[0];
  let end_time = payload.new.meeting_time.split("-")[1];
  let meeting_date = payload.new.meeting_date;

  let scp_ids = [payload.new.scp_id, payload.new.patient_id];

  try {
    // Loop through each scp_id and perform the update operation
    for (const scp_id of scp_ids) {
      const { data: availabilities, error: fetchError } = await supabase
        .from("scp_availability")
        .select("*")
        .eq("scp_id", scp_id)
        .eq("date", meeting_date);

      if (fetchError) throw fetchError;

      console.log("data for SCP availabilities: ", availabilities);

      for (const availability of availabilities) {
        const existing_start = availability.start_time;
        const existing_end = availability.end_time;

        // Check if there is an overlap
        if (existing_start < end_time && existing_end > start_time) {
          // Delete the overlapping availability
          const { error: deleteError } = await supabase
            .from("scp_availability")
            .delete()
            .eq("scp_id", scp_id)
            .eq("start_time", existing_start)
            .eq("end_time", existing_end)
            .eq("date", meeting_date);

          if (deleteError) throw deleteError;

          // Insert new availability slots before the appointment
          if (existing_start < start_time) {
            const diffBefore =
              new Date(`1970-01-01T${start_time}:00Z`) -
              new Date(`1970-01-01T${existing_start}:00Z`);
            if (diffBefore >= 3600000) {
              // 3600000 milliseconds = 1 hour
              const { error: insertErrorBefore } = await supabase
                .from("scp_availability")
                .insert([
                  {
                    scp_id: scp_id,
                    start_time: existing_start,
                    end_time: start_time,
                    date: meeting_date,
                  },
                ]);

              if (insertErrorBefore) throw insertErrorBefore;
            }
          }

          // Insert new availability slots after the appointment
          if (existing_end > end_time) {
            const diffAfter =
              new Date(`1970-01-01T${existing_end}:00Z`) -
              new Date(`1970-01-01T${end_time}:00Z`);
            if (diffAfter >= 3600000) {
              // 3600000 milliseconds = 1 hour
              const { error: insertErrorAfter } = await supabase
                .from("scp_availability")
                .insert([
                  {
                    scp_id: scp_id,
                    start_time: end_time,
                    end_time: existing_end,
                    date: meeting_date,
                  },
                ]);

              if (insertErrorAfter) throw insertErrorAfter;
            }
          }
        }
      }

      console.log(`Availability updated for SCP ID ${scp_id}`);
    }
  } catch (err) {
    console.error("Error in updateScpAvailability:", err.message);
  }
}

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", options); // 'en-GB' uses day-month-year order
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
};

// Function to handle the Realtime changes and perform subsequent actions
async function triggerFunction(payload) {
  // Define headers for the POST request
  const config = {
    headers: {
      Authorization: "bc9261c7-2d89-4415-a439-a98609b58fc8",
      "Content-Type": "application/json",
    },
  };
  const gupshupUrl =
    "https://notifications.gupshup.io/notifications/callback/service/ipass/project/31566410/integration/137b1758102d899b5f9d308e0";

  try {
    const { data, error } = await supabase.rpc("find_first_match", {
      given_scp_id: payload.new.id,
    });
    if (error) throw error;

    const uniqueCodePatient = new Date().getTime();
    const uniqueCodeScp = new Date().getTime();

    const tokenPayloadPatient = {
      context: {
        user: {
          name: payload.new.name,
        },
      },
      moderator: true,
      aud: "jitsi",
      iss: "QXjoVJbUNbVNEbhsIDKnTfe7RCN",
      sub: "meet.hsciglobal.org",
      room: "roundrobin",
      exp: 1720071689,
    };

    const tokenPayloadScp = {
      context: {
        user: {
          name: data.name,
        },
      },
      moderator: true,
      aud: "jitsi",
      iss: "QXjoVJbUNbVNEbhsIDKnTfe7RCN",
      sub: "meet.hsciglobal.org",
      room: "roundrobin",
      exp: 1720071689,
    };

    // Sign the token with the payload and secret key
    const tokenPatient = jwt.sign(
      tokenPayloadPatient,
      "S7ksAUnc1IXbXP47Ky2GMgB9QMP"
    );
    const tokenScp = jwt.sign(tokenPayloadScp, "S7ksAUnc1IXbXP47Ky2GMgB9QMP");

    const meetingLinkPatient = {
      [`room=${uniqueCodePatient}`]: `room=roundrobin&jwt=${tokenPatient}`,
    };

    const meetingLinkScp = {
      [`room=${uniqueCodeScp}`]: `room=roundrobin&jwt=${tokenScp}`,
    };

    const insertResult = await supabase
      .from("appointments")
      .insert([
        {
          scp_id: data.scp_id,
          patient_id: payload.new.id,
          meeting_date: data.date,
          meeting_time: data.start_time + "-" + data.end_time,
          meeting_link_patient: meetingLinkPatient,
          meeting_link_scp: meetingLinkScp,
          patient_phone: payload.new.whatsapp_phone_no,
          scp_phone: data.phone,
          status: "DRAFT",
        },
      ])
      .select();

    if (insertResult.error) {
      throw insertResult.error;
    }

    const newAppointmentId = insertResult.data[0].id;
    console.log("insertResult: ", insertResult);
    console.log("Insert successful, new appointment ID:", newAppointmentId);

    const meetingLinkKeyPatient = Object.keys(
      insertResult.data[0].meeting_link_patient
    )[0];
    const meetingLinkKeyScp = Object.keys(
      insertResult.data[0].meeting_link_scp
    )[0];

    // Gupshup callback URL and payload data
    const payloadDataPatient = {
      event_name: "appointment_details",
      event_time: JSON.stringify(new Date()),
      user: {
        phone: payload.new.whatsapp_phone_no,
        name: payload.new.name,
        matched_person: data.name,
        meeting_date: formatDate(data.date),
        meeting_time:
          formatTime(data.start_time) + "-" + formatTime(data.end_time),
        meeting_link:
          "http://trayaschedule.hsciglobal.org/meeting?" +
          meetingLinkKeyPatient +
          "&role=p",
        appointment_id: newAppointmentId,
      },
      txid: "123",
    };

    // Send POST requests with the Authorization header
    await axios.post(gupshupUrl, payloadDataPatient, config);

    const payloadDataScp = {
      event_name: "appointment_details",
      event_time: JSON.stringify(new Date()),
      user: {
        phone: data.phone,
        name: data.name,
        matched_person: payload.new.name,
        meeting_date: formatDate(data.date),
        meeting_time:
          formatTime(data.start_time) + "-" + formatTime(data.end_time),
        meeting_link:
          "http://trayaschedule.hsciglobal.org/meeting?" +
          meetingLinkKeyScp +
          "&role=s",
      },
      txid: "123",
    };

    await axios.post(gupshupUrl, payloadDataScp, config);
  } catch (err) {
    console.error("Error in trigger function:", err.message);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
