import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Remove curly braces
import { supabase } from "../utils/supabase";
import { JitsiMeeting } from "@jitsi/react-sdk";

const JitsiMeetComponent = () => {
  const apiRef = useRef();
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [appointmentId, setAppointmentId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(location.search);
      const key = "room=" + params.get("room");
      const role = params.get("role");
      setUserRole(role);

      if (key && role) {
        let columnName;
        if (role === "p") {
          columnName = "meeting_link_patient";
        } else if (role === "s") {
          columnName = "meeting_link_scp";
        } else {
          console.error("Invalid role specified in the URL");
          return;
        }

        const { data, error } = await supabase
          .from("appointments")
          .select(`id, ${columnName}`);

        if (error) {
          console.error("Error fetching data from Supabase:", error);
        } else if (data && data.length > 0) {
          // Find the row where the JSON column contains the key
          const row = data.find((row) => row[columnName][key]);
          setAppointmentId(row.id);

          if (row) {
            const meetingLink = row[columnName][key]; // Get the value for the specified key
            const linkParams = new URLSearchParams(meetingLink);
            const jwtToken = linkParams.get("jwt");
            const room = linkParams.get("room");

            if (jwtToken) {
              setToken(jwtToken);
              const decoded = jwtDecode(jwtToken);
              if (decoded?.context?.user?.name) {
                setUserName(decoded.context.user.name);
              }
            }
            if (room) {
              setRoomName(room);
            }
          } else {
            console.error("Key not found in any row's JSON object");
          }
        }
      }
    };

    fetchData();
  }, [location]);

  const handleApiReady = (apiObj) => {
    apiRef.current = apiObj;
    apiRef.current.on("readyToClose", handleReadyToClose);
    apiRef.current.on("videoConferenceJoined", () => {
      // Ensure the tile view is toggled when the user joins the conference
      setTimeout(() => {
        apiRef.current.executeCommand("toggleTileView");
      }, 1000); // Adjust the delay if needed
    });
  };

  const handleReadyToClose = () => {
    console.log("Participant has left the meeting.");
    window.location.href =
      "/meeting-feedback?appt=" + appointmentId + "&role=" + userRole;
  };

  const Spinner = () => {
    return (
      <div style={spinnerStyle}>
        <div style={spinnerInnerStyle}></div>
      </div>
    );
  };

  const spinnerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  const spinnerInnerStyle = {
    width: "40px",
    height: "40px",
    border: "5px solid rgba(0, 0, 0, 0.1)",
    borderTop: "5px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {token && roomName ? (
        <JitsiMeeting
          domain="meet.hsciglobal.org"
          roomName={roomName}
          jwt={token}
          configOverwrite={{
            defaultLanguage: "en",
            userInfo: {
              displayName: userName,
            },
          }}
          interfaceConfigOverwrite={{
            filmStripOnly: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          }}
          onApiReady={handleApiReady}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.position = "fixed";
            iframeRef.style.top = "0";
            iframeRef.style.left = "0";
            iframeRef.style.width = "100%";
            iframeRef.style.height = "100%";
            iframeRef.style.border = "none";
          }}
          loadingComponent={Spinner} // Use the custom spinner
        />
      ) : (
        <Spinner /> // Display the spinner while loading
      )}
    </div>
  );
};

export default JitsiMeetComponent;
