import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { getAppointmentById } from "../controllers/appointment";

const MeetingFeedback = () => {
  const location = useLocation();

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
  };

  const messageStyle = {
    fontFamily: "Arial, sans-serif",
    fontSize: "1.5em",
    color: "#333",
    marginTop: "20px",
  };

  const triggerFeedback = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/feedback-loop",
        data
      );
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const getAppointmentDetailsById = async (appointmentId, role) => {
    const res = await getAppointmentById(appointmentId);

    let dataJson = {
      name: role === "p" ? res.patient.name : res.scp.name,
      whatsapp_phone_no: role === "p" ? res.patient_phone : res.scp_phone,
      appointmentId: res.id,
    };

    await triggerFeedback(dataJson);
  };

  const hasRun = useRef(false);

  useEffect(() => {
    if (location && !hasRun.current) {
      hasRun.current = true;
      const params = new URLSearchParams(location.search);
      const appointmentId = params.get("appt");
      const role = params.get("role");

      getAppointmentDetailsById(appointmentId, role);
    }
  }, [location]);

  return (
    <div style={containerStyle}>
      <div>
        <div style={messageStyle}>
          We hope you had a productive session. We will reach out to you on
          WhatsApp shortly to gather your feedback.
        </div>
      </div>
    </div>
  );
};

export default MeetingFeedback;
